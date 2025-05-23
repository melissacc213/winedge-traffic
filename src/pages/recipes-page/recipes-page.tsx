// RecipesPage.tsx
import { useTranslation } from "react-i18next";
import { Button } from "@mantine/core";
import { Link } from "react-router-dom";
import { useRecipes, useDeleteRecipe } from "../../lib/queries/recipe";
import { useRecipeStore } from "../../lib/store/recipe-store";
import { RecipesTable } from "./recipes-table";
import { Icons } from "../../components/icons";
import { PageLayout } from "@/components/page-layout/page-layout";

export function RecipesPage() {
  const { t } = useTranslation(["recipes", "common"]);
  const { isLoading } = useRecipes();
  const recipes = useRecipeStore((state) => state.recipes);
  const deleteRecipeMutation = useDeleteRecipe();

  const handleDelete = (id: string) => {
    if (window.confirm(t("recipes:delete.confirm"))) {
      deleteRecipeMutation.mutate(id);
    }
  };

  return (
    <PageLayout
      title={t("recipes:title")}
      description={t("recipes:description")}
      actions={
        <Button
          component={Link}
          to="/recipes/create"
          leftSection={<Icons.Plus size={16} />}
        >
          {t("recipes:create")}
        </Button>
      }
    >
      <RecipesTable
        recipes={recipes}
        isLoading={isLoading}
        onDelete={handleDelete}
      />
    </PageLayout>
  );
}
