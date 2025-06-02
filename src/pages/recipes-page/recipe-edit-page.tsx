import { useParams } from "react-router-dom";

import { RecipeEditStepper } from "@/components/recipe-creation/edit-stepper";
import { RecipeNavigationGuard } from "@/components/recipe-creation/navigation-guard";

export function RecipeEditPage() {
  const { recipeId } = useParams<{ recipeId: string }>();

  if (!recipeId) {
    return null;
  }

  return (
    <>
      <RecipeNavigationGuard />
      <RecipeEditStepper recipeId={recipeId} />
    </>
  );
}