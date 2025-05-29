import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Button, Stack, Menu, ActionIcon, Badge, Text, Group } from "@mantine/core";
import { Icons } from "@/components/icons";
import { PageLayout } from "@/components/page-layout/page-layout";
import { DataTable } from "@/components/ui";
import { useRecipes, useDeleteRecipe } from "@/lib/queries/recipe";
import { useRecipeStore } from "@/lib/store/recipe-store";
import { notifications } from "@mantine/notifications";
import { modals } from "@mantine/modals";
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
    modals.openConfirmModal({
      title: t("recipes:confirmDelete.title"),
      children: (
        <Text size="sm">
          {t("recipes:confirmDelete.message", { name: recipe.name })}
        </Text>
      ),
      labels: { confirm: t("common:action.delete"), cancel: t("common:action.cancel") },
      confirmProps: { color: "red" },
      onConfirm: async () => {
        try {
          await deleteRecipeMutation.mutateAsync(recipe.id);
          notifications.show({
            title: t("recipes:notifications.deleteSuccess"),
            message: t("recipes:notifications.deleteSuccessMessage"),
            color: "green",
          });
        } catch (error) {
          notifications.show({
            title: t("common:error"),
            message: t("recipes:notifications.deleteError"),
            color: "red",
          });
        }
      },
    });
  };


  const columns = [
    {
      key: "name",
      label: t("recipes:table.name"),
      render: (recipe: Recipe) => (
        <Text fw={500}>{recipe.name}</Text>
      ),
    },
    {
      key: "description",
      label: t("recipes:table.description"),
      render: (recipe: Recipe) => (
        <Text size="sm" lineClamp={1}>
          {recipe.description || "—"}
        </Text>
      ),
    },
    {
      key: "taskType",
      label: t("recipes:table.taskType"),
      render: (recipe: Recipe) => (
        <Badge color={getTaskTypeColor(recipe.taskType)} variant="light">
          {t(`recipes:taskType.${recipe.taskType}`)}
        </Badge>
      ),
    },
    {
      key: "status",
      label: t("recipes:table.status"),
      render: (recipe: Recipe) => (
        <Badge 
          variant="light" 
          color={recipe.status === 'active' ? 'green' : 'gray'}
        >
          {t(`recipes:status.${recipe.status}`)}
        </Badge>
      ),
    },
    {
      key: "regions",
      label: t("recipes:table.regions"),
      render: (recipe: Recipe) => (
        <Text size="sm">{recipe.regions?.length || 0} regions</Text>
      ),
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
        if (!recipe.createdAt) return "—";
        const date = new Date(recipe.createdAt);
        return date.toLocaleDateString();
      },
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
          {t("recipes:action.viewDetails")}
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
        <Button leftSection={<Icons.Plus size={16} />} onClick={handleCreateRecipe}>
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
          height={600}
          emptyMessage={t("recipes:noRecipes")}
          defaultSort={{ key: 'createdAt', direction: 'desc' }}
        />
      </Stack>
    </PageLayout>
  );
}