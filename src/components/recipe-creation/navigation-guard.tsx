import { useEffect, useState } from "react";
import { useBlocker, useNavigate } from "react-router-dom";
import { useRecipeStore } from "../../lib/store/recipe-store";
import { ConfirmationModal } from "../ui/confirmation-modal";

export function RecipeNavigationGuard() {
  const { isDirty, resetForm } = useRecipeStore();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [pendingLocation, setPendingLocation] = useState<string | null>(null);

  // Block navigation when there are unsaved changes
  const blocker = useBlocker(({ currentLocation, nextLocation }) => {
    // Check if we're navigating away and have unsaved changes
    if (isDirty && currentLocation.pathname !== nextLocation.pathname) {
      // Check if this is a programmatic navigation that was already confirmed
      const isConfirmed = sessionStorage.getItem("recipe-navigation-confirmed");
      if (isConfirmed) {
        // Clean up the flag
        sessionStorage.removeItem("recipe-navigation-confirmed");
        return false; // Don't block
      }
      return true; // Block navigation
    }
    return false;
  });

  // Handle blocked navigation
  useEffect(() => {
    if (blocker.state === "blocked") {
      // Show confirmation modal
      setPendingLocation(blocker.location.pathname);
      setShowModal(true);
    }
  }, [blocker.state, blocker.location]);

  const handleCancel = () => {
    setShowModal(false);
    setPendingLocation(null);
    if (blocker.state === "blocked") {
      blocker.reset();
    }
  };

  const handleConfirm = () => {
    setShowModal(false);
    // Mark navigation as confirmed
    sessionStorage.setItem("recipe-navigation-confirmed", "true");
    resetForm();

    // Proceed with navigation
    if (blocker.state === "blocked" && pendingLocation) {
      blocker.proceed();
    }
  };

  // Clean up store when component unmounts
  useEffect(() => {
    return () => {
      // Only reset if we're actually leaving the recipe creation page
      if (!window.location.pathname.includes("/recipes/create")) {
        const isConfirmed = sessionStorage.getItem(
          "recipe-navigation-confirmed"
        );
        if (!isConfirmed) {
          resetForm();
        }
      }
    };
  }, [resetForm]);

  return (
    <ConfirmationModal
      opened={showModal}
      onClose={handleCancel}
      onConfirm={handleConfirm}
      title="Leave Recipe Creation?"
      message="You have unsaved changes in your recipe. Are you sure you want to leave? All your progress will be lost."
      confirmText="Leave Without Saving"
      cancelText="Continue Editing"
      confirmColor="red"
      icon="warning"
      size="md"
    />
  );
}
