import { useState, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  getPaginationRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table";
import type { SortingState, ColumnDef } from "@tanstack/react-table";
import {
  Table,
  ScrollArea,
  UnstyledButton,
  Group,
  Text,
  Badge,
  Pagination,
  Menu,
  ActionIcon,
  Button,
  TextInput,
} from "@mantine/core";
import {
  IconDots,
  IconEye,
  IconCopyCheck,
  IconTrash,
  IconSortAscending,
  IconSortDescending,
  IconSearch,
  IconArrowsSort,
  IconPlus,
} from "@tabler/icons-react";
import { useRecipes } from "../../lib/queries/recipe";
import { getTaskTypeColor } from "@/lib/utils";
import type { RecipeResponse } from "../../lib/validator/recipe";
import type { Region } from "@/types/recipe";

// Helper functions outside of component to prevent re-creation on each render

const getStatusColor = (status: string) => {
  switch (status) {
    case "active":
      return "green";
    case "inactive":
      return "yellow";
    case "error":
      return "red";
    default:
      return "gray";
  }
};

const getRegionCount = (regions: Region[]) => {
  if (!regions || regions.length === 0) return 0;
  return regions.length;
};

// Simplified date formatter
const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    // Simple relative time (just for display purposes)
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return "Today";
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else if (diffDays < 30) {
      return `${Math.floor(diffDays / 7)} weeks ago`;
    } else {
      return date.toLocaleDateString();
    }
  } catch (e) {
    return dateString;
  }
};

export function RecipesList() {
  const { t } = useTranslation(["recipes", "common"]);
  const navigate = useNavigate();
  const { data: recipes = [] } = useRecipes();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [pageIndex, setPageIndex] = useState(0);

  // Memoized task type label function
  const getTaskTypeLabel = useCallback(
    (type: string) => {
      return t(`recipes:creation.taskType.types.${type}`);
    },
    [t]
  );

  const columns = useMemo<ColumnDef<RecipeResponse>[]>(
    () => [
      {
        accessorKey: "name",
        header: t("recipes:table.name"),
        cell: (info) => {
          const name = info.getValue() as string;
          return (
            <Text fw={500} size="sm">
              {name}
            </Text>
          );
        },
      },
      {
        accessorKey: "taskType",
        header: t("recipes:table.taskType"),
        cell: (info) => {
          const taskType = info.getValue() as string;
          return (
            <Badge color={getTaskTypeColor(taskType)}>
              {getTaskTypeLabel(taskType)}
            </Badge>
          );
        },
      },
      {
        accessorKey: "status",
        header: t("recipes:table.status"),
        cell: (info) => {
          const status = info.getValue() as string;
          return (
            <Badge color={getStatusColor(status)}>
              {t(`recipes:status.${status}`)}
            </Badge>
          );
        },
      },
      {
        accessorKey: "regions",
        header: t("recipes:table.regions"),
        cell: (info) => {
          const regions = info.getValue() as Region[];
          return (
            <Text size="sm">{getRegionCount(regions)}</Text>
          );
        },
      },
      {
        accessorKey: "createdAt",
        header: t("recipes:table.createdAt"),
        cell: (info) => {
          const createdAt = info.getValue() as string;
          return (
            <Text size="sm" c="dimmed">
              {formatDate(createdAt)}
            </Text>
          );
        },
      },
      {
        id: "actions",
        header: "",
        cell: (info) => (
          <Menu position="bottom-end" shadow="md">
            <Menu.Target>
              <ActionIcon variant="subtle">
                <IconDots size={16} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item
                leftSection={<IconEye size={16} />}
                onClick={() => navigate(`/recipes/${info.row.original.id}`)}
              >
                {t("common:button.view")}
              </Menu.Item>
              <Menu.Item
                leftSection={<IconCopyCheck size={16} />}
                onClick={() =>
                  navigate(`/tasks/create?recipeId=${info.row.original.id}`)
                }
              >
                {t("recipes:runTask")}
              </Menu.Item>
              <Menu.Divider />
              <Menu.Item leftSection={<IconTrash size={16} />} color="red">
                {t("common:button.delete")}
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        ),
      },
    ],
    [t, getTaskTypeLabel, navigate]
  );

  const table = useReactTable({
    data: recipes,
    columns,
    state: {
      sorting,
      globalFilter,
      pagination: {
        pageIndex,
        pageSize: 10,
      },
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const handlePageChange = useCallback((page: number) => {
    setPageIndex(page - 1);
  }, []);

  const handleFilterChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setGlobalFilter(e.target.value);
    },
    []
  );

  return (
    <div>
      <Group justify="space-between" mb="md">
        <TextInput
          placeholder={t("recipes:table.search")}
          value={globalFilter}
          onChange={handleFilterChange}
          leftSection={<IconSearch size={16} />}
          w={300}
        />
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={() => navigate("/recipes/create")}
        >
          {t("recipes:create")}
        </Button>
      </Group>

      <ScrollArea>
        <Table highlightOnHover>
          <Table.Thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <Table.Tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <Table.Th key={header.id}>
                    {header.isPlaceholder ? null : (
                      <UnstyledButton
                        onClick={header.column.getToggleSortingHandler()}
                        style={{ width: "100%" }}
                      >
                        <Group justify="space-between">
                          <Text fw={500} size="sm">
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                          </Text>
                          {header.column.getCanSort() && (
                            <Group>
                              {header.column.getIsSorted() === "asc" ? (
                                <IconSortAscending size={14} />
                              ) : header.column.getIsSorted() === "desc" ? (
                                <IconSortDescending size={14} />
                              ) : (
                                <IconArrowsSort
                                  size={14}
                                  style={{ opacity: 0.5 }}
                                />
                              )}
                            </Group>
                          )}
                        </Group>
                      </UnstyledButton>
                    )}
                  </Table.Th>
                ))}
              </Table.Tr>
            ))}
          </Table.Thead>
          <Table.Tbody>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <Table.Tr key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <Table.Td key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </Table.Td>
                  ))}
                </Table.Tr>
              ))
            ) : (
              <Table.Tr>
                <Table.Td
                  colSpan={columns.length}
                  style={{ textAlign: "center" }}
                >
                  <Text c="dimmed">{t("recipes:noRecipes")}</Text>
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      </ScrollArea>

      {table.getPageCount() > 1 && (
        <Group justify="center" mt="md">
          <Pagination
            total={table.getPageCount()}
            value={pageIndex + 1}
            onChange={handlePageChange}
          />
        </Group>
      )}
    </div>
  );
}
