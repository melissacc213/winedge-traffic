import { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Checkbox,
  Group,
  Paper,
  Select,
  Stack,
  Table,
  TextInput,
  Text,
  Loader,
  Alert,
  Center,
} from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { useMutation } from "@tanstack/react-query";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  createColumnHelper,
  flexRender,
} from "@tanstack/react-table";
import type {
  ColumnDef,
  PaginationState,
  SortingState,
} from "@tanstack/react-table";
import { useTheme } from "@/providers/theme-provider";
import { Icons } from "@/components/icons";
import { taskTypeSchema } from "@/lib/validator/recipe";
import type { TaskType } from "@/types/recipe";
import type { Recipe } from "@/types/task-creation";
import { mockRecipes } from "@/lib/config/mock-recipes";
import { taskService } from "@/lib/api/task-service";

// Form validation schema
const createTaskFormSchema = z.object({
  taskType: taskTypeSchema.nullable(),
  recipeId: z.string().min(1, "Recipe selection is required"),
  localPath: z.string().min(1, "Local file path is required"),
  startImmediately: z.boolean(),
});

type TaskFormValues = z.infer<typeof createTaskFormSchema>;

const columnHelper = createColumnHelper<Recipe>();

export function TaskCreationForm() {
  const { t } = useTranslation(["tasks", "common", "recipes"]);
  const navigate = useNavigate();
  const { colorScheme, theme } = useTheme();
  const isDark = colorScheme === "dark";
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  // React Table states
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<SortingState>([]);

  // Form management
  const form = useForm<TaskFormValues>({
    initialValues: {
      taskType: null,
      recipeId: "",
      localPath: "",
      startImmediately: false,
    },
    validate: zodResolver(createTaskFormSchema),
  });

  // Filter recipes based on selected task type
  const filteredRecipes = useMemo(
    () =>
      form.values.taskType
        ? mockRecipes.filter(
            (recipe) => recipe.taskType === form.values.taskType
          )
        : [],
    [form.values.taskType]
  );

  // Handle recipe selection
  const handleRecipeSelect = useCallback(
    (recipeId: string) => {
      const recipe = filteredRecipes.find((r) => r.id === recipeId);
      if (recipe) {
        setSelectedRecipe(recipe);
        form.setFieldValue("recipeId", recipeId);
      }
    },
    [filteredRecipes, form]
  );

  // Define table columns
  const columns = useMemo<ColumnDef<Recipe>[]>(
    () => [
      columnHelper.display({
        id: "select",
        header: "",
        cell: ({ row }) => {
          const recipe = row.original;
          const isSelected = form.values.recipeId === recipe.id;
          return (
            <Checkbox
              checked={isSelected}
              onChange={() => handleRecipeSelect(recipe.id)}
              onClick={(e) => e.stopPropagation()}
              size="sm"
            />
          );
        },
        size: 50,
        enableSorting: false,
      }),
      columnHelper.accessor("name", {
        header: t("recipes:table.name"),
        cell: ({ getValue }) => (
          <Text fw={500} size="xs" lineClamp={1}>
            {getValue()}
          </Text>
        ),
      }),
      columnHelper.accessor("description", {
        header: t("recipes:table.description"),
        cell: ({ getValue }) => (
          <Text size="xs" c="dimmed" lineClamp={1}>
            {getValue() || t("recipes:noDescription")}
          </Text>
        ),
      }),
      columnHelper.accessor("regions", {
        header: t("recipes:table.regions"),
        cell: ({ getValue }) => (
          <Text size="xs" ta="center">
            {getValue().length}
          </Text>
        ),
        sortingFn: (rowA, rowB) => {
          return rowA.original.regions.length - rowB.original.regions.length;
        },
      }),
      columnHelper.accessor("status", {
        header: t("recipes:table.status"),
        cell: ({ getValue }) => (
          <Text size="xs" c={getValue() === "active" ? "teal" : "gray"}>
            {t(`recipes:status.${getValue()}`)}
          </Text>
        ),
      }),
      columnHelper.accessor("createdAt", {
        header: t("recipes:table.createdAt"),
        cell: ({ getValue }) => (
          <Text size="xs" c="dimmed">
            {new Date(getValue()).toLocaleDateString()}
          </Text>
        ),
      }),
    ],
    [t, form.values.recipeId, handleRecipeSelect]
  );

  // React Table instance
  const table = useReactTable({
    data: filteredRecipes,
    columns,
    state: {
      pagination,
      sorting,
    },
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    pageCount: Math.ceil(filteredRecipes.length / pagination.pageSize),
    manualPagination: false,
  });

  // Reset pagination when task type changes
  const handleTaskTypeChange = (value: TaskType | null) => {
    form.setFieldValue("taskType", value);
    form.setFieldValue("recipeId", "");
    setSelectedRecipe(null);
    setPagination((prev) => ({ ...prev, pageIndex: 0 })); // Reset to first page
  };

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: async (values: TaskFormValues) => {
      const taskData = {
        name: `Task for ${selectedRecipe?.name}`,
        description: `Processing ${values.localPath}`,
        priority: "medium" as const,
        recipeId: values.recipeId,
        localPath: values.localPath,
        taskType: values.taskType!,
      };

      const task = await taskService.createTask(taskData);

      if (values.startImmediately) {
        await taskService.startTask(task.id);
      }

      return task;
    },
    onSuccess: (task) => {
      navigate(`/tasks/${task.id}`);
    },
  });

  const handleSubmit = (values: TaskFormValues) => {
    createTaskMutation.mutate(values);
  };

  const handlePageSizeChange = (value: string | null) => {
    if (value) {
      const pageSize = parseInt(value);
      setPagination({
        pageIndex: 0, // Reset to first page
        pageSize,
      });
    }
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack gap="lg">
        {/* Task Configuration Section */}
        <Paper
          p="lg"
          radius="md"
          withBorder
          style={{
            backgroundColor: isDark ? theme.colors.dark[8] : theme.white,
            borderColor: isDark ? theme.colors.dark[5] : theme.colors.gray[2],
          }}
        >
          <Stack gap="md">
            <div>
              <Text size="lg" fw={600} mb={4}>
                {t("tasks:creation.taskConfiguration")}
              </Text>
              <Text size="sm" c="dimmed">
                {t("tasks:creation.taskConfigurationDescription")}
              </Text>
            </div>

            <Group grow align="flex-start" gap="md">
              <Select
                label={t("tasks:taskType.title")}
                placeholder={t("tasks:taskType.placeholder")}
                data={[
                  {
                    value: "trafficStatistics",
                    label: t("tasks:taskType.trafficStatistics"),
                  },
                  {
                    value: "trainDetection",
                    label: t("tasks:taskType.trainDetection"),
                  },
                ]}
                leftSection={<Icons.Target size={16} />}
                size="sm"
                {...form.getInputProps("taskType")}
                onChange={(value) =>
                  handleTaskTypeChange(value as TaskType | null)
                }
              />
              
              <TextInput
                label={t("tasks:creation.localPath")}
                placeholder={t("tasks:creation.localPathPlaceholder")}
                leftSection={<Icons.Folder size={16} />}
                size="sm"
                {...form.getInputProps("localPath")}
              />
            </Group>
          </Stack>
        </Paper>

        {/* Recipe Selection Section */}
        <Paper
          p="lg"
          radius="md"
          withBorder
          style={{
            backgroundColor: isDark ? theme.colors.dark[8] : theme.white,
            borderColor: isDark ? theme.colors.dark[5] : theme.colors.gray[2],
          }}
        >
          <Stack gap="md">
            <div>
              <Text size="lg" fw={600} mb={4}>
                {t("tasks:creation.selectRecipe")}
              </Text>
              <Text size="sm" c="dimmed">
                {t("tasks:creation.selectRecipeDescription")}
              </Text>
            </div>

            {!form.values.taskType ? (
              <Center h={200}>
                <Stack align="center" gap="sm">
                  <Icons.Recipe size={48} style={{ opacity: 0.3 }} />
                  <Text size="sm" c="dimmed" ta="center">
                    {t("tasks:creation.selectTaskTypeFirst")}
                  </Text>
                  <Text size="xs" c="dimmed" ta="center">
                    {t("tasks:creation.selectTaskTypeFirstDescription")}
                  </Text>
                </Stack>
              </Center>
            ) : filteredRecipes.length === 0 ? (
              <Center h={200}>
                <Stack align="center" gap="sm">
                  <Icons.AlertCircle size={48} style={{ opacity: 0.3 }} />
                  <Text size="sm" c="dimmed" ta="center">
                    {t("tasks:creation.noRecipesAvailable")}
                  </Text>
                  <Text size="xs" c="dimmed" ta="center">
                    {t("tasks:creation.noRecipesAvailableDescription")}
                  </Text>
                </Stack>
              </Center>
            ) : (
              <Stack gap="sm">
                {/* Fixed height container for table */}
                <div
                  style={{
                    height: '400px',
                    display: 'flex',
                    flexDirection: 'column',
                    border: `1px solid ${isDark ? theme.colors.dark[5] : theme.colors.gray[2]}`,
                    borderRadius: "0.5rem",
                    overflow: "hidden",
                  }}
                >
                  {/* Table wrapper with scroll */}
                  <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
                    <Table
                      striped
                      highlightOnHover
                      verticalSpacing="sm"
                      stickyHeader
                    >
                    <Table.Thead
                      style={{
                        backgroundColor: isDark
                          ? theme.colors.dark[6]
                          : theme.colors.gray[1],
                      }}
                    >
                    {table.getHeaderGroups().map((headerGroup) => (
                      <Table.Tr key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <Table.Th
                            key={header.id}
                            style={{
                              width:
                                header.column.id === 'select'
                                  ? '50px'
                                  : header.getSize() === 150
                                  ? header.getSize()
                                  : undefined,
                              cursor: header.column.getCanSort()
                                ? "pointer"
                                : "default",
                              padding: header.column.id === 'select' ? "0.75rem 0.25rem 0.75rem 0.75rem" : "0.75rem 0.5rem",
                              backgroundColor: "transparent",
                              borderBottom: "none",
                              transition: "background-color 0.15s ease",
                              ...(header.column.getCanSort() && {
                                "&:hover": {
                                  backgroundColor: isDark
                                    ? theme.colors.dark[5]
                                    : theme.colors.gray[0],
                                },
                              }),
                            }}
                            onClick={header.column.getToggleSortingHandler()}
                            onMouseEnter={(e) => {
                              if (header.column.getCanSort()) {
                                e.currentTarget.style.backgroundColor = isDark
                                  ? theme.colors.dark[5]
                                  : theme.colors.gray[0];
                              }
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor =
                                "transparent";
                            }}
                          >
                            <Group
                              gap="xs"
                              wrap="nowrap"
                              justify="space-between"
                            >
                              <Text
                                size="xs"
                                fw={700}
                                c={
                                  isDark
                                    ? theme.colors.gray[2]
                                    : theme.colors.gray[7]
                                }
                                style={{
                                  letterSpacing: "0.5px",
                                  textTransform: "uppercase",
                                }}
                              >
                                {header.isPlaceholder
                                  ? null
                                  : flexRender(
                                      header.column.columnDef.header,
                                      header.getContext()
                                    )}
                              </Text>
                              {header.column.getCanSort() && (
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    opacity: header.column.getIsSorted()
                                      ? 1
                                      : 0.6,
                                    transition: "opacity 0.15s ease",
                                  }}
                                >
                                  {{
                                    asc: (
                                      <Icons.ChevronUp
                                        size={14}
                                        color={theme.colors.blue[6]}
                                      />
                                    ),
                                    desc: (
                                      <Icons.ChevronDown
                                        size={14}
                                        color={theme.colors.blue[6]}
                                      />
                                    ),
                                  }[header.column.getIsSorted() as string] ?? (
                                    <Icons.Selector
                                      size={14}
                                      style={{ opacity: 0.4 }}
                                    />
                                  )}
                                </div>
                              )}
                            </Group>
                          </Table.Th>
                        ))}
                      </Table.Tr>
                    ))}
                  </Table.Thead>
                  <Table.Tbody>
                    {table.getRowModel().rows.length === 0 ? (
                      <Table.Tr>
                        <Table.Td
                          colSpan={table.getVisibleFlatColumns().length}
                        >
                          <Center h={100}>
                            <Text c="dimmed" size="xs">
                              {t("recipes:noRecipesFound")}
                            </Text>
                          </Center>
                        </Table.Td>
                      </Table.Tr>
                    ) : (
                      table.getRowModel().rows.map((row) => {
                        const isSelected =
                          form.values.recipeId === row.original.id;
                        return (
                          <Table.Tr
                            key={row.id}
                            onClick={() => handleRecipeSelect(row.original.id)}
                            style={{
                              cursor: "pointer",
                              backgroundColor: isSelected
                                ? isDark
                                  ? theme.colors.blue[9]
                                  : theme.colors.blue[0]
                                : undefined,
                            }}
                          >
                            {row.getVisibleCells().map((cell) => (
                              <Table.Td
                                key={cell.id}
                                style={{
                                  padding: cell.column.id === 'select' ? "0.75rem 0.25rem 0.75rem 0.75rem" : "0.75rem 0.5rem",
                                  borderBottom: `1px solid ${isDark ? theme.colors.dark[5] : theme.colors.gray[2]}`,
                                  verticalAlign: "middle",
                                }}
                              >
                                {flexRender(
                                  cell.column.columnDef.cell,
                                  cell.getContext()
                                )}
                              </Table.Td>
                            ))}
                          </Table.Tr>
                        );
                      })
                    )}
                  </Table.Tbody>
                    </Table>
                  </div>
                  
                  {/* Pagination at bottom of table container */}
                  <div
                    style={{
                      borderTop: `1px solid ${isDark ? theme.colors.dark[5] : theme.colors.gray[2]}`,
                      padding: '0.75rem',
                      backgroundColor: isDark ? theme.colors.dark[7] : theme.colors.gray[0],
                    }}
                  >
                    <Group justify="space-between" align="center">
                      {/* Left side: Showing count */}
                      <Text size="sm" c="dimmed">
                        {t("common:pagination.showing", {
                          from:
                            table.getState().pagination.pageIndex *
                              table.getState().pagination.pageSize +
                            1,
                          to: Math.min(
                            (table.getState().pagination.pageIndex + 1) *
                              table.getState().pagination.pageSize,
                            filteredRecipes.length
                          ),
                          total: filteredRecipes.length,
                        })}
                      </Text>
                      
                      {/* Center: Page navigation */}
                      <Group gap="xs">
                        <Button
                          variant="subtle"
                          size="xs"
                          onClick={() => table.setPageIndex(0)}
                          disabled={!table.getCanPreviousPage()}
                        >
                          <Icons.ChevronsLeft size={14} />
                        </Button>
                        <Button
                          variant="subtle"
                          size="xs"
                          onClick={() => table.previousPage()}
                          disabled={!table.getCanPreviousPage()}
                        >
                          <Icons.ChevronLeft size={14} />
                        </Button>

                        <Text size="sm" c="dimmed" fw={500}>
                          {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
                        </Text>

                        <Button
                          variant="subtle"
                          size="xs"
                          onClick={() => table.nextPage()}
                          disabled={!table.getCanNextPage()}
                        >
                          <Icons.ChevronRight size={14} />
                        </Button>
                        <Button
                          variant="subtle"
                          size="xs"
                          onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                          disabled={!table.getCanNextPage()}
                        >
                          <Icons.ChevronsRight size={14} />
                        </Button>
                      </Group>
                      
                      {/* Right side: Items per page */}
                      <Group gap="xs">
                        <Text size="sm" c="dimmed">
                          {t("common:pagination.itemsPerPage")}:
                        </Text>
                        <Select
                          size="xs"
                          w={70}
                          value={table.getState().pagination.pageSize.toString()}
                          onChange={handlePageSizeChange}
                          data={["10", "20", "30", "50"]}
                        />
                      </Group>
                    </Group>
                  </div>
                </div>
              </Stack>
            )}
          </Stack>
        </Paper>

        {/* Action Section with better layout */}
        <Paper
          p="lg"
          radius="md"
          withBorder
          style={{
            backgroundColor: isDark ? theme.colors.dark[8] : theme.white,
            borderColor: isDark ? theme.colors.dark[5] : theme.colors.gray[2],
          }}
        >
          <Group justify="space-between" align="center">
            {/* Left side: Start immediately checkbox */}
            <Checkbox
              label={t("tasks:creation.startImmediately")}
              size="md"
              {...form.getInputProps("startImmediately", {
                type: "checkbox",
              })}
            />
            
            {/* Right side: Action buttons */}
            <Group gap="sm">
              <Button
                type="button"
                variant="default"
                onClick={() => navigate("/tasks")}
                disabled={createTaskMutation.isPending}
                size="md"
              >
                {t("common:cancel")}
              </Button>
              <Button
                type="submit"
                loading={createTaskMutation.isPending}
                leftSection={
                  !createTaskMutation.isPending && <Icons.Plus size={18} />
                }
                disabled={!form.values.recipeId || !form.values.localPath}
                size="md"
              >
                {createTaskMutation.isPending ? (
                  <Group gap="xs">
                    <Loader size="sm" />
                    <span>{t("common:saving")}</span>
                  </Group>
                ) : (
                  t("tasks:creation.createTask")
                )}
              </Button>
            </Group>
          </Group>
          
          {/* Error Alert */}
          {createTaskMutation.isError && (
            <Alert
              variant="light"
              color="red"
              icon={<Icons.AlertCircle size={16} />}
              mt="md"
            >
              <Text size="sm">
                {createTaskMutation.error?.message ||
                  t("common:error.generic")}
              </Text>
            </Alert>
          )}
        </Paper>
      </Stack>
    </form>
  );
}
