import {
  Button,
  Group,
  Modal,
  Stack,
  Text,
  useComputedColorScheme,
  useMantineTheme,
} from "@mantine/core";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useBlocker } from "react-router-dom";

import { useRecipeStore } from "../../lib/store/recipe-store";

export function RecipeNavigationGuard() {
  const { isDirty, resetForm } = useRecipeStore();
  const { t } = useTranslation(["recipes", "common"]);
  const theme = useMantineTheme();
  const computedColorScheme = useComputedColorScheme();
  const isDark = computedColorScheme === 'dark';
  const [showModal, setShowModal] = useState(false);

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
      
      // Show confirmation modal
      setShowModal(true);
      return true; // Block navigation initially
    }
    return false;
  });

  // Handle modal confirmation
  const confirmLeave = () => {
    setShowModal(false);
    // Mark navigation as confirmed
    sessionStorage.setItem("recipe-navigation-confirmed", "true");
    resetForm();
    // Proceed with navigation
    if (blocker.state === "blocked") {
      blocker.proceed();
    }
  };

  const cancelLeave = () => {
    setShowModal(false);
    if (blocker.state === "blocked") {
      blocker.reset();
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
    <Modal
      opened={showModal}
      onClose={cancelLeave}
      title={t("recipes:creation.exitTitle", "Leave Recipe Creation?")}
      centered
      size="sm"
    >
      <Stack gap="md">
        <Text size="sm">
          {t(
            "recipes:creation.exitMessage",
            "You have unsaved changes in your recipe. Are you sure you want to leave? All your progress will be lost."
          )}
        </Text>
        <Group justify="space-between">
          <Button
            variant="outline"
            onClick={cancelLeave}
            style={{
              borderColor: isDark
                ? theme.colors.dark[4]
                : theme.colors.gray[4],
              color: isDark ? theme.colors.gray[3] : theme.colors.gray[7],
            }}
          >
            {t("common:button.continueEditing", "Continue Editing")}
          </Button>
          <Button
            onClick={confirmLeave}
            style={{
              "&:hover": {
                backgroundColor: theme.colors.red[7],
              },
              backgroundColor: theme.colors.red[6],
            }}
          >
            {t("common:button.exit", "Leave Without Saving")}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
