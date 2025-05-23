import { useTranslation } from "react-i18next";
import { RecipeStepper } from "../../components/recipe-creation";
import { PageLayout } from "@/components/page-layout/page-layout";

export function RecipeCreationPage() {
  const { t } = useTranslation(["recipes"]);

  return (
    <PageLayout
      title={t("recipes:creation.title")}
      description={t("recipes:creation.description")}
    >
      <RecipeStepper />
    </PageLayout>
  );
}
