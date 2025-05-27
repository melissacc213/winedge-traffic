import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  getPaginationRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table";
import type { PaginationState, SortingState } from "@tanstack/react-table";
import {
  Table,
  Badge,
  Text,
  Group,
  ActionIcon,
  Menu,
  Input,
  Select,
  Pagination,
  Box,
  Paper,
  Title,
} from "@mantine/core";
import { Icons } from "../../components/icons";
import type { RecipeResponse } from "../../lib/validator/recipe";
import { TableLoading } from "../../components/ui";
import { useNavigate } from "react-router-dom";
import type { Region } from "@/types/recipe";

interface RecipesTableProps {
  recipes: RecipeResponse[];
  isLoading: boolean;
  onDelete?: (id: string) => void;
}

export function RecipesTable({
  recipes,
  isLoading,
  onDelete,
}: RecipesTableProps) {
  const { t } = useTranslation(["recipes", "common"]);
  const navigate = useNavigate();
  const [sorting, setSorting] = useState<SortingState>([
    { id: "createdAt", desc: true },
  ]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  // Get badge color based on task type
  const getTaskTypeColor = (type: string) => {
    switch (type) {
      case "trafficStatistics":
        return "cyan";
      case "trainDetection":
        return "indigo";
      default:
        return "gray";
    }
  };

  // Get task type label
  const getTaskTypeLabel = (type: string) => {
    return t(`recipes:creation.taskType.types.${type}`);
  };

  // Get badge color based on status
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

  // Get region count
  const getRegionCount = (regions: Region[]) => {
    if (!regions || regions.length === 0) return 0;
    return regions.length;
  };

  // Format date to human readable
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "";

    try {
      const date = new Date(dateString);
      // Format as relative time
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
    } catch {
      return dateString;
    }
  };

  const columnHelper = createColumnHelper<RecipeResponse>();

  const columns = useMemo(
    () => [
      columnHelper.accessor("name", {
        header: t("recipes:table.name"),
        cell: (info) => (
          <Box>
            <Text fw={500}>{info.getValue()}</Text>
            <Text size="xs" c="dimmed">
              {info.row.original.id}
            </Text>
          </Box>
        ),
      }),
      columnHelper.accessor("taskType", {
        header: t("recipes:table.taskType"),
        cell: (info) => (
          <Badge color={getTaskTypeColor(info.getValue())} variant="light">
            {getTaskTypeLabel(info.getValue())}
          </Badge>
        ),
      }),
      columnHelper.accessor("status", {
        header: t("recipes:table.status"),
        cell: (info) => (
          <Badge color={getStatusColor(info.getValue())} variant="light">
            {t(`recipes:status.${info.getValue()}`)}
          </Badge>
        ),
      }),
      columnHelper.accessor("regions", {
        header: t("recipes:table.regions"),
        cell: (info) => (
          <Text size="sm">{getRegionCount(info.getValue())}</Text>
        ),
      }),
      columnHelper.accessor("createdAt", {
        header: t("recipes:table.createdAt"),
        cell: (info) => <Text size="sm">{formatDate(info.getValue())}</Text>,
      }),
      columnHelper.accessor("id", {
        header: t("recipes:list.columns.actions"),
        cell: (info) => (
          <Group spacing={4} justify="flex-end" style={{ flexWrap: "nowrap" }}>
            <Menu position="bottom-end" withArrow withinPortal>
              <Menu.Target>
                <ActionIcon>
                  <Icons.Dots size="sm" />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item
                  leftSection={<Icons.Eye size="xs" />}
                  onClick={() => navigate(`/recipes/${info.getValue()}`)}
                >
                  {t("common:button.view")}
                </Menu.Item>
                <Menu.Item
                  leftSection={<Icons.CopyCheck size="xs" />}
                  onClick={() =>
                    navigate(`/tasks/create?recipeId=${info.getValue()}`)
                  }
                >
                  {t("recipes:runTask")}
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item
                  leftSection={<Icons.Trash size="xs" />}
                  color="red"
                  onClick={() => onDelete?.(info.getValue())}
                >
                  {t("common:button.delete")}
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        ),
      }),
    ],
    [columnHelper, t, getTaskTypeLabel, navigate, onDelete]
  );

  const table = useReactTable({
    data: recipes,
    columns,
    state: {
      sorting,
      globalFilter,
      pagination,
    },
    enableGlobalFilter: true,
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    manualPagination: false,
  });

  // Show loading state
  if (isLoading) {
    return (
      <TableLoading
        title={t("recipes:table.title")}
        rows={5}
        columns={5}
        withPagination={true}
        withSearch={true}
        withActions={true}
      />
    );
  }

  // Show empty state
  if (recipes.length === 0) {
    return (
      <TableLoading
        title={t("recipes:table.title")}
        noData={true}
        noDataMessage={t("recipes:noRecipes")}
        emptyIcon={<Icons.Recipe size={48} opacity={0.7} />}
      />
    );
  }

  // Show table with data
  return (
    <Paper withBorder p="md">
      <Group justify="flex-end" mb="md">
        <Input
          placeholder={t("common:action.search")}
          value={globalFilter ?? ""}
          onChange={(e) => setGlobalFilter(e.target.value)}
          leftSection={<Icons.Search size={16} />}
          style={{ maxWidth: 300 }}
        />
      </Group>

      <Table
        verticalSpacing="md"
        horizontalSpacing="md"
        striped
        withTableBorder
        mb="md"
      >
        <Table.Thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <Table.Tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <Table.Th
                  key={header.id}
                  onClick={header.column.getToggleSortingHandler()}
                  style={{
                    cursor: header.column.getCanSort() ? "pointer" : "default",
                    width: header.id === "id" ? 120 : "auto",
                  }}
                >
                  <Group justify="space-between" style={{ flexWrap: "nowrap" }}>
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                    {header.column.getCanSort() && (
                      <Box style={{ display: "inline-block", width: 16 }}>
                        {header.column.getIsSorted() === "asc" ? (
                          <Icons.ArrowUp size="xs" />
                        ) : header.column.getIsSorted() === "desc" ? (
                          <Icons.ArrowDown size="xs" />
                        ) : (
                          <Icons.Sort size="xs" style={{ opacity: 0.5 }} />
                        )}
                      </Box>
                    )}
                  </Group>
                </Table.Th>
              ))}
            </Table.Tr>
          ))}
        </Table.Thead>
        <Table.Tbody>
          {table.getRowModel().rows.map((row) => (
            <Table.Tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <Table.Td key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </Table.Td>
              ))}
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>

      <Group justify="space-between">
        <Group gap="xs">
          <Text size="sm">
            {t("common:pagination.showing")}{" "}
            {table.getState().pagination.pageIndex *
              table.getState().pagination.pageSize +
              1}{" "}
            -{" "}
            {Math.min(
              (table.getState().pagination.pageIndex + 1) *
                table.getState().pagination.pageSize,
              table.getFilteredRowModel().rows.length
            )}{" "}
            {t("common:pagination.of")}{" "}
            {table.getFilteredRowModel().rows.length}
          </Text>
          <Select
            size="xs"
            value={String(table.getState().pagination.pageSize)}
            onChange={(value) => table.setPageSize(Number(value))}
            data={["5", "10", "20", "30", "40", "50"].map((pageSize) => ({
              value: pageSize,
              label: `${pageSize} ${t("common:pagination.per_page")}`,
            }))}
            w={110}
            radius="xl"
          />
        </Group>
        <Pagination
          total={table.getPageCount()}
          value={table.getState().pagination.pageIndex + 1}
          onChange={(page) => table.setPageIndex(page - 1)}
          color="blue"
          size="sm"
          radius="xl"
          withEdges
        />
      </Group>
    </Paper>
  );
}
