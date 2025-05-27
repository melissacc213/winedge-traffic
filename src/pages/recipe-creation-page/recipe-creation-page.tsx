import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { Box } from "@mantine/core";
import { RecipeStepper } from "../../components/recipe-creation";
import { RecipeNavigationGuard } from "../../components/recipe-creation/navigation-guard";
import { useRecipeStore } from "../../lib/store/recipe-store";

export function RecipeCreationPage() {
  const { t } = useTranslation(["recipes"]);
  const { resetForm, isDirty } = useRecipeStore();

  // Handle browser navigation (back/forward buttons)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isDirty]);

  // Clean up store when component unmounts
  useEffect(() => {
    return () => {
      // Only reset if navigation was confirmed
      const isConfirmed = sessionStorage.getItem('recipe-navigation-confirmed');
      if (isConfirmed === 'true') {
        resetForm();
        sessionStorage.removeItem('recipe-navigation-confirmed');
      }
    };
  }, [resetForm]);

  return (
    <>
      <RecipeNavigationGuard />
      <RecipeStepper />
    </>
  );
}