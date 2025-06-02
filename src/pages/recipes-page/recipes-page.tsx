import { ActionIcon, Badge, Button, Menu, Stack, Text } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { Icons } from "@/components/icons";
import { PageLayout } from "@/components/page-layout/page-layout";
import { DataTable } from "@/components/ui";
import { confirmDelete } from "@/lib/confirmation";
import { useDeleteRecipe,useRecipes } from "@/lib/queries/recipe";
import { useRecipeStore } from "@/lib/store/recipe-store";
import { getTaskTypeColor } from "@/lib/utils";
import type { Recipe } from "@/types/recipe";

export function RecipesPage() {
  const { t } = useTranslation(["recipes", "common"]);
  const navigate = useNavigate();
  const { isLoading } = useRecipes();
  const recipes = useRecipeStore((state) => state.recipes);
  const deleteRecipeMutation = useDeleteRecipe();

  const handleCreateRecipe = () => {
    navigate("/recipes/create");
  };

  const handleViewDetails = (recipe: Recipe) => {
    navigate(`/recipes/${recipe.id}`);
  };

  const handleEditRecipe = (recipe: Recipe) => {
    navigate(`/recipes/${recipe.id}/edit`);
  };

  const handleDeleteRecipe = (recipe: Recipe) => {
    confirmDelete(recipe.name, t("recipes:common.recipe"), async () => {
      try {
        await deleteRecipeMutation.mutateAsync(recipe.id);
        notifications.show({
          color: "green",
          message: t("recipes:notifications.deleteSuccessMessage"),
          title: t("recipes:notifications.deleteSuccess"),
        });
      } catch (error) {
        notifications.show({
          color: "red",
          message: t("recipes:notifications.deleteError"),
          title: t("common:error"),
        });
      }
    });
  };

  const columns = [
    {
      key: "name",
      label: t("recipes:table.name"),
      render: (recipe: Recipe) => (
        <Text fw={500} size="sm">
          {recipe.name}
        </Text>
      ),
    },
    {
      key: "description",
      label: t("recipes:table.description"),
      render: (recipe: Recipe) => (
        <Text size="sm" c="dimmed" lineClamp={1}>
          {recipe.description || "—"}
        </Text>
      ),
    },
    {
      key: "taskType",
      label: t("recipes:table.taskType"),
      render: (recipe: Recipe) => (
        <Badge
          color={getTaskTypeColor(recipe.taskType)}
          variant="light"
          size="md"
        >
          {t(`recipes:taskType.${recipe.taskType}`)}
        </Badge>
      ),
      width: 140,
    },
    {
      key: "status",
      label: t("recipes:table.status"),
      render: (recipe: Recipe) => (
        <Badge
          variant="light"
          color={recipe.status === "active" ? "green" : "gray"}
          size="md"
        >
          {t(`recipes:status.${recipe.status}`)}
        </Badge>
      ),
      width: 100,
    },
    {
      key: "regions",
      label: t("recipes:table.regions"),
      render: (recipe: Recipe) => (
        <Text size="sm">{recipe.regions?.length || 0} regions</Text>
      ),
      width: 100,
    },
    {
      key: "modelId",
      label: t("recipes:table.model"),
      render: (recipe: Recipe) => (
        <Text size="sm">{recipe.modelId || "—"}</Text>
      ),
    },
    {
      key: "createdAt",
      label: t("recipes:table.createdAt"),
      render: (recipe: Recipe) => {
        if (!recipe.createdAt) return <Text size="sm">—</Text>;
        const date = new Date(recipe.createdAt);
        return <Text size="sm">{date.toLocaleDateString()}</Text>;
      },
      width: 120,
    },
  ];

  const actions = (recipe: Recipe) => (
    <Menu position="bottom-end" withArrow withinPortal>
      <Menu.Target>
        <ActionIcon variant="subtle" color="gray">
          <Icons.Dots size={16} />
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Item
          leftSection={<Icons.Eye size={16} />}
          onClick={() => handleViewDetails(recipe)}
        >
          {t("recipes:actions.viewDetails")}
        </Menu.Item>
        <Menu.Item
          leftSection={<Icons.Edit size={16} />}
          onClick={() => handleEditRecipe(recipe)}
        >
          {t("common:action.edit")}
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item
          leftSection={<Icons.Trash size={16} />}
          color="red"
          onClick={() => handleDeleteRecipe(recipe)}
        >
          {t("common:action.delete")}
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );

  return (
    <PageLayout
      title={t("recipes:title")}
      description={t("recipes:description")}
      actions={
        <Button
          leftSection={<Icons.Plus size={16} />}
          onClick={handleCreateRecipe}
          color="blue"
        >
          {t("recipes:create")}
        </Button>
      }
    >
      <Stack gap="lg">
        <DataTable
          data={recipes}
          columns={columns}
          loading={isLoading}
          actions={actions}
          onRowClick={handleViewDetails}
          height={700}
          emptyMessage={t("recipes:noRecipes")}
          defaultSort={{ direction: "desc", key: "createdAt" }}
          showPagination={true}
          pageSize={10}
          enableGlobalFilter={true}
        />
      </Stack>
    </PageLayout>
  );
}
