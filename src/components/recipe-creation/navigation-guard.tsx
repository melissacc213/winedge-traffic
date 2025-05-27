import { useEffect } from "react";
import { useBlocker } from "react-router-dom";
import { useRecipeStore } from "../../lib/store/recipe-store";

export function RecipeNavigationGuard() {
  const { isDirty, resetForm } = useRecipeStore();

  // Block navigation when there are unsaved changes
  // But don't show any modal - let the parent component handle it
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) => {
      // Check if we're navigating away and have unsaved changes
      if (isDirty && currentLocation.pathname !== nextLocation.pathname) {
        // Check if this is a programmatic navigation that was already confirmed
        const isConfirmed = sessionStorage.getItem('recipe-navigation-confirmed');
        if (isConfirmed) {
          // Clean up the flag
          sessionStorage.removeItem('recipe-navigation-confirmed');
          return false; // Don't block
        }
        return true; // Block and let parent handle
      }
      return false;
    }
  );

  // If navigation is blocked, cancel it and let the parent component handle the confirmation
  useEffect(() => {
    if (blocker.state === "blocked") {
      // Reset the blocker without proceeding
      blocker.reset();
      // Trigger the browser's back button to maintain URL consistency
      window.history.forward();
    }
  }, [blocker]);

  // Clean up store when component unmounts
  useEffect(() => {
    return () => {
      // Only reset if we're actually leaving the recipe creation page
      if (!window.location.pathname.includes("/recipes/create")) {
        const isConfirmed = sessionStorage.getItem('recipe-navigation-confirmed');
        if (!isConfirmed) {
          resetForm();
        }
      }
    };
  }, [resetForm]);

  return null;
}