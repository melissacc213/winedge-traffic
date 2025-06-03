import {
  ActionIcon,
  Alert,
  Button,
  Center,
  Checkbox,
  Group,
  Loader,
  Paper,
  Select,
  Stack,
  Table,
  Text,
  TextInput,
  Tooltip,
  useComputedColorScheme,
  useMantineTheme,
} from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  ColumnDef,
  PaginationState,
  SortingState,
} from "@tanstack/react-table";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useCallback, useEffect,useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { z } from "zod";

import { Icons } from "@/components/icons";
import { taskService } from "@/lib/api/task-service";
import { mockRecipes } from "@/lib/config/mock-recipes";
import { taskTypeSchema } from "@/lib/validator/recipe";
import type { Task } from "@/lib/validator/task";
import type { TaskType } from "@/types/recipe";
import type { Recipe } from "@/types/recipe";

// Form validation schema
const taskFormSchema = z.object({
  localPath: z.string().min(1, "Local file path is required"),
  recipeId: z.string().min(1, "Recipe selection is required"),
  startImmediately: z.boolean(),
  taskType: taskTypeSchema.nullable(),
});

type TaskFormValues = z.infer<typeof taskFormSchema>;

interface TaskFormProps {
  mode: "create" | "edit";
  task?: Task;
  onSuccess?: (task: Task) => void;
}

export function TaskForm({ mode, task, onSuccess }: TaskFormProps) {
  const { t } = useTranslation(["tasks", "common", "recipes"]);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const theme = useMantineTheme();
  const computedColorScheme = useComputedColorScheme();
  const isDark = computedColorScheme === 'dark';
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  // React Table states
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [searchInput, setSearchInput] = useState("");

  // Form management with proper edit mode defaults
  const form = useForm<TaskFormValues>({
    initialValues: {
      localPath: task?.localPath || task?.videoUrl || "",
      recipeId: task?.recipeId || "",
      startImmediately: false, // Always false for edit mode
      taskType: task?.taskType || null,
    },
    validate: zodResolver(taskFormSchema),
  });

  // Load the selected recipe and update form values when task data is available
  useEffect(() => {
    if (mode === "edit" && task) {
      console.log('TaskForm - Edit mode - task data:', task);
      console.log('TaskForm - task.taskType:', task.taskType);
      console.log('TaskForm - task.recipeId:', task.recipeId);
      console.log('TaskForm - Available recipes:', mockRecipes.map(r => ({ id: r.id, name: r.name, taskType: r.taskType })));
      
      // Update form values with task data
      form.setValues({
        localPath: task.localPath || task.videoUrl || "",
        recipeId: task.recipeId,
        startImmediately: false,
        taskType: task.taskType,
      });

      // Set the selected recipe
      const recipe = mockRecipes.find(r => r.id === task.recipeId);
      console.log('TaskForm - found recipe:', recipe);
      if (recipe) {
        setSelectedRecipe(recipe);
        console.log('TaskForm - selectedRecipe set to:', recipe.name);
      } else {
        console.log('TaskForm - No recipe found for ID:', task.recipeId);
      }
      
      // Force update form display
      setTimeout(() => {
        console.log('TaskForm - Current form values after update:', form.values);
      }, 100);
    }
  }, [mode, task]); // Removed form dependency to avoid infinite loops

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
  const columns = useMemo<ColumnDef<Recipe, any>[]>(
    () => [
      {
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
        enableSorting: false,
        header: "",
        id: "select",
        size: 50,
      },
      {
        accessorKey: "name",
        cell: ({ getValue }) => {
          const name = getValue() as string;
          return (
            <Text fw={500} size="xs" lineClamp={1}>
              {name}
            </Text>
          );
        },
        header: t("recipes:table.name"),
      },
      {
        accessorKey: "description",
        cell: ({ getValue }) => {
          const description = getValue() as string;
          return (
            <Text size="xs" c="dimmed" lineClamp={1}>
              {description || t("recipes:noDescription")}
            </Text>
          );
        },
        header: t("recipes:table.description"),
      },
      {
        accessorKey: "regions",
        cell: ({ getValue }) => {
          const regions = getValue() as Recipe["regions"];
          return (
            <Text size="xs" ta="center">
              {regions.length}
            </Text>
          );
        },
        header: t("recipes:table.regions"),
        sortingFn: (rowA, rowB) => {
          return rowA.original.regions.length - rowB.original.regions.length;
        },
      },
      {
        accessorKey: "status",
        cell: ({ getValue }) => {
          const status = getValue() as string;
          return (
            <Text size="xs" c={status === "active" ? "teal" : "gray"}>
              {t(`recipes:status.${status}`)}
            </Text>
          );
        },
        header: t("recipes:table.status"),
      },
      {
        accessorKey: "createdAt",
        cell: ({ getValue }) => {
          const createdAt = getValue() as string;
          return (
            <Text size="xs" c="dimmed">
              {new Date(createdAt).toLocaleDateString()}
            </Text>
          );
        },
        header: t("recipes:table.createdAt"),
      },
    ],
    [t, form.values.recipeId, handleRecipeSelect]
  );

  // React Table instance
  const table = useReactTable({
    columns,
    data: filteredRecipes,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    globalFilterFn: "includesString",
    manualPagination: false,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    pageCount: Math.ceil(filteredRecipes.length / pagination.pageSize),
    state: {
      globalFilter,
      pagination,
      sorting,
    },
  });

  // Reset pagination when task type changes
  const handleTaskTypeChange = (value: TaskType | null) => {
    console.log('TaskForm - handleTaskTypeChange called with:', value);
    console.log('TaskForm - current mode:', mode);
    
    form.setFieldValue("taskType", value);
    form.setFieldValue("recipeId", "");
    setSelectedRecipe(null);
    setPagination((prev) => ({ ...prev, pageIndex: 0 })); // Reset to first page
    setGlobalFilter(""); // Reset search filter
    setSearchInput(""); // Reset search input
  };

  // Handle search
  const handleSearch = () => {
    setGlobalFilter(searchInput);
  };

  // Handle key press for search
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Handle clear search
  const handleClearSearch = () => {
    setSearchInput("");
    setGlobalFilter("");
  };

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: async (values: TaskFormValues) => {
      const taskData = {
        description: `Processing ${values.localPath}`,
        localPath: values.localPath,
        name: `Task for ${selectedRecipe?.name}`,
        priority: "medium" as const,
        recipeId: values.recipeId,
        taskType: values.taskType!,
      };

      const task = await taskService.createTask(taskData);

      if (values.startImmediately) {
        await taskService.startTask(task.id);
      }

      return task;
    },
    onError: (error: any) => {
      notifications.show({
        color: "red",
        message: error.message || t("common:error.generic"),
        title: t("tasks:notifications.taskCreateError"),
      });
    },
    onSuccess: (task) => {
      notifications.show({
        color: "green",
        message: t("tasks:notifications.taskCreatedMessage", { name: task.name }),
        title: t("tasks:notifications.taskCreated"),
      });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      if (onSuccess) {
        onSuccess(task);
      } else {
        navigate(`/tasks/${task.id}`);
      }
    },
  });

  // Update task mutation
  const updateTaskMutation = useMutation({
    mutationFn: async (values: TaskFormValues) => {
      if (!task) throw new Error("Task not found");

      const updateData = {
        localPath: values.localPath,
        recipeId: values.recipeId,
        taskType: values.taskType!,
      };

      return await taskService.updateTask(task.id, updateData);
    },
    onError: (error: any) => {
      notifications.show({
        color: "red",
        message: error.message || t("common:error.generic"),
        title: t("tasks:notifications.taskUpdateError"),
      });
    },
    onSuccess: (updatedTask) => {
      notifications.show({
        color: "green",
        message: t("tasks:notifications.taskUpdatedMessage", { name: updatedTask.name }),
        title: t("tasks:notifications.taskUpdated"),
      });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["task", task?.id] });
      if (onSuccess) {
        onSuccess(updatedTask);
      } else {
        navigate(`/tasks/${updatedTask.id}`);
      }
    },
  });

  const handleSubmit = (values: TaskFormValues) => {
    if (mode === "create") {
      createTaskMutation.mutate(values);
    } else {
      updateTaskMutation.mutate(values);
    }
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

  const isLoading = createTaskMutation.isPending || updateTaskMutation.isPending;

  // Debug current form state
  console.log('TaskForm - Current form values:', form.values);
  console.log('TaskForm - Current mode:', mode);
  console.log('TaskForm - Selected recipe:', selectedRecipe?.name);

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack gap="lg">
        {/* Task Configuration Section */}
        <Paper
          p="lg"
          radius="md"
          withBorder
          style={{
            backgroundColor: isDark ? theme.colors.dark?.[8] || theme.colors.gray[9] : theme.white,
            borderColor: isDark ? theme.colors.dark?.[5] || theme.colors.gray[6] : theme.colors.gray[2],
          }}
        >
          <Group grow align="flex-end" gap="md">
            <Select
              label={t("tasks:creation.taskConfiguration")}
              placeholder={t("tasks:taskType.placeholder")}
              data={[
                {
                  label: t("tasks:taskType.trafficStatistics"),
                  value: "trafficStatistics",
                },
                {
                  label: t("tasks:taskType.trainDetection"),
                  value: "trainDetection",
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
        </Paper>

        {/* Recipe Selection Section */}
        <Paper
          p="lg"
          radius="md"
          withBorder
          style={{
            backgroundColor: isDark ? theme.colors.dark?.[8] || theme.colors.gray[9] : theme.white,
            borderColor: isDark ? theme.colors.dark?.[5] || theme.colors.gray[6] : theme.colors.gray[2],
          }}
        >
          <Stack gap="md">
            <Group justify="space-between" align="flex-end">
              <div>
                <Text size="lg" fw={600} mb={4}>
                  {t("tasks:creation.selectRecipe")}
                </Text>
                <Text size="sm" c="dimmed">
                  {t("tasks:creation.selectRecipeDescription")}
                </Text>
              </div>
              {form.values.taskType && filteredRecipes.length > 0 && (
                <Group gap="xs">
                  <TextInput
                    placeholder={t("common:action.search")}
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    leftSection={<Icons.Search size={16} />}
                    rightSection={
                      searchInput && (
                        <ActionIcon
                          size="sm"
                          variant="subtle"
                          onClick={handleClearSearch}
                          style={{ cursor: "pointer" }}
                        >
                          <Icons.X size={14} />
                        </ActionIcon>
                      )
                    }
                    style={{ width: 300 }}
                    size="sm"
                    styles={{
                      input: {
                        '&:focus': {
                          borderColor: theme.colors.blue?.[6] || theme.colors.blue[5],
                        },
                        backgroundColor: isDark
                          ? theme.colors.dark?.[7] || theme.colors.gray[8]
                          : theme.white,
                        border: `1px solid ${isDark ? theme.colors.dark?.[4] || theme.colors.gray[6] : theme.colors.gray[3]}`,
                      },
                    }}
                  />
                  <Tooltip label="Search" withArrow>
                    <ActionIcon
                      size="lg"
                      variant="filled"
                      color="blue"
                      onClick={handleSearch}
                      disabled={!searchInput}
                    >
                      <Icons.Search size={18} />
                    </ActionIcon>
                  </Tooltip>
                </Group>
              )}
            </Group>

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
                    border: `1px solid ${isDark ? theme.colors.dark?.[5] || theme.colors.gray[6] : theme.colors.gray[2]}`,
                    borderRadius: "0.5rem",
                    display: 'flex',
                    flexDirection: 'column',
                    height: '400px',
                    overflow: "hidden",
                  }}
                >
                  {/* Table wrapper with scroll */}
                  <div style={{ flex: 1, overflowX: 'hidden', overflowY: 'auto' }}>
                    <Table
                      striped
                      highlightOnHover
                      verticalSpacing="sm"
                      stickyHeader
                    >
                    <Table.Thead
                      style={{
                        backgroundColor: isDark
                          ? theme.colors.dark?.[6] || theme.colors.gray[7]
                          : theme.colors.gray[1],
                      }}
                    >
                    {table.getHeaderGroups().map((headerGroup) => (
                      <Table.Tr key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <Table.Th
                            key={header.id}
                            style={{
                              backgroundColor: "transparent",
                              borderBottom: "none",
                              cursor: header.column.getCanSort()
                                ? "pointer"
                                : "default",
                              padding: header.column.id === 'select' ? "0.75rem 0.25rem 0.75rem 0.75rem" : "0.75rem 0.5rem",
                              transition: "background-color 0.15s ease",
                              width:
                                header.column.id === 'select'
                                  ? '50px'
                                  : header.getSize() === 150
                                  ? header.getSize()
                                  : undefined,
                              ...(header.column.getCanSort() && {
                                "&:hover": {
                                  backgroundColor: isDark
                                    ? theme.colors.dark?.[5] || theme.colors.gray[6]
                                    : theme.colors.gray[0],
                                },
                              }),
                            }}
                            onClick={header.column.getToggleSortingHandler()}
                            onMouseEnter={(e) => {
                              if (header.column.getCanSort()) {
                                e.currentTarget.style.backgroundColor = isDark
                                  ? theme.colors.dark?.[5] || theme.colors.gray[6]
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
                                    alignItems: "center",
                                    display: "flex",
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
                          style={{ borderBottom: 'none' }}
                        >
                          <Center h={250}>
                            <Stack align="center" gap="md">
                              <div
                                style={{
                                  alignItems: 'center',
                                  backgroundColor: isDark ? theme.colors.dark?.[6] || theme.colors.gray[7] : theme.colors.gray[1],
                                  borderRadius: '50%',
                                  display: 'flex',
                                  height: 64,
                                  justifyContent: 'center',
                                  width: 64,
                                }}
                              >
                                <Icons.Search
                                  size={32}
                                  style={{
                                    color: isDark ? theme.colors.gray[6] : theme.colors.gray[5],
                                  }}
                                />
                              </div>
                              <Stack gap="xs" align="center">
                                <Text size="md" fw={500} c={isDark ? "white" : "black"}>
                                  {t("recipes:noRecipesFound")}
                                </Text>
                                <Text size="sm" c="dimmed" ta="center" maw={300}>
                                  {globalFilter
                                    ? t("recipes:noRecipesMatchingSearch", { query: globalFilter })
                                    : t("recipes:tryDifferentFilters")}
                                </Text>
                              </Stack>
                              {globalFilter && (
                                <Button
                                  variant="subtle"
                                  size="sm"
                                  onClick={() => setGlobalFilter("")}
                                  leftSection={<Icons.X size={16} />}
                                >
                                  {t("common:clearSearch")}
                                </Button>
                              )}
                            </Stack>
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
                              backgroundColor: isSelected
                                ? isDark
                                  ? theme.colors.blue[9]
                                  : theme.colors.blue[0]
                                : undefined,
                              cursor: "pointer",
                            }}
                          >
                            {row.getVisibleCells().map((cell) => (
                              <Table.Td
                                key={cell.id}
                                style={{
                                  borderBottom: `1px solid ${isDark ? theme.colors.dark?.[5] || theme.colors.gray[6] : theme.colors.gray[2]}`,
                                  padding: cell.column.id === 'select' ? "0.75rem 0.25rem 0.75rem 0.75rem" : "0.75rem 0.5rem",
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
                      backgroundColor: isDark ? theme.colors.dark?.[7] || theme.colors.gray[8] : theme.colors.gray[0],
                      borderTop: `1px solid ${isDark ? theme.colors.dark?.[5] || theme.colors.gray[6] : theme.colors.gray[2]}`,
                      padding: '0.75rem',
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
            backgroundColor: isDark ? theme.colors.dark?.[8] || theme.colors.gray[9] : theme.white,
            borderColor: isDark ? theme.colors.dark?.[5] || theme.colors.gray[6] : theme.colors.gray[2],
          }}
        >
          <Group justify="space-between" align="center">
            {/* Left side: Start immediately checkbox */}
            {mode === "create" && (
              <Checkbox
                label={t("tasks:creation.startImmediately")}
                size="md"
                {...form.getInputProps("startImmediately", {
                  type: "checkbox",
                })}
              />
            )}
            
            {/* Right side: Action buttons */}
            <Group gap="sm" ml={mode === "edit" ? "auto" : undefined}>
              <Button
                type="button"
                variant="default"
                onClick={() => navigate("/tasks")}
                disabled={isLoading}
                size="md"
              >
                {t("common:cancel")}
              </Button>
              <Button
                type="submit"
                loading={isLoading}
                leftSection={
                  !isLoading && (mode === "create" ? <Icons.Plus size={18} /> : <Icons.DeviceFloppy size={18} />)
                }
                disabled={!form.values.recipeId || (mode === "create" && !form.values.localPath)}
                size="md"
              >
                {isLoading ? (
                  <Group gap="xs">
                    <Loader size="sm" />
                    <span>{t("common:saving")}</span>
                  </Group>
                ) : mode === "create" ? (
                  t("tasks:creation.createTask")
                ) : (
                  t("tasks:edit.updateTask")
                )}
              </Button>
            </Group>
          </Group>
          
          {/* Error Alert */}
          {(createTaskMutation.isError || updateTaskMutation.isError) && (
            <Alert
              variant="light"
              color="red"
              icon={<Icons.AlertCircle size={16} />}
              mt="md"
            >
              <Text size="sm">
                {createTaskMutation.error?.message || 
                 updateTaskMutation.error?.message ||
                 t("common:error.generic")}
              </Text>
            </Alert>
          )}
        </Paper>
      </Stack>
    </form>
  );
}