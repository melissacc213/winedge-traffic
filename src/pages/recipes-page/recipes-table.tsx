import {
  ActionIcon,
  Badge,
  Box,
  Group,
  Input,
  Menu,
  Pagination,
  Paper,
  Select,
  Table,
  Text,
} from "@mantine/core";
import type { ColumnDef,PaginationState, SortingState } from "@tanstack/react-table";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useMemo,useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { getTaskTypeColor } from "@/lib/utils";
import type { Region } from "@/types/recipe";

import { Icons } from "../../components/icons";
import { TableLoading } from "../../components/ui";
import type { RecipeResponse } from "../../lib/validator/recipe";

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
    { desc: true, id: "createdAt" },
  ]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });


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

  const columns = useMemo<ColumnDef<RecipeResponse>[]>(
    () => [
      {
        accessorKey: "name",
        cell: (info) => (
          <Box>
            <Text fw={500}>{info.getValue() as string}</Text>
            <Text size="xs" c="dimmed">
              {info.row.original.id}
            </Text>
          </Box>
        ),
        header: t("recipes:table.name"),
      },
      {
        accessorKey: "taskType",
        cell: (info) => (
          <Badge color={getTaskTypeColor(info.getValue() as string)} variant="light">
            {getTaskTypeLabel(info.getValue() as string)}
          </Badge>
        ),
        header: t("recipes:table.taskType"),
      },
      {
        accessorKey: "status",
        cell: (info) => (
          <Badge color={getStatusColor(info.getValue() as string)} variant="light">
            {t(`recipes:status.${info.getValue()}`)}
          </Badge>
        ),
        header: t("recipes:table.status"),
      },
      {
        accessorKey: "regions",
        cell: (info) => (
          <Text size="sm">{getRegionCount(info.getValue() as any[])}</Text>
        ),
        header: t("recipes:table.regions"),
      },
      {
        accessorKey: "createdAt",
        cell: (info) => <Text size="sm">{formatDate(info.getValue() as string)}</Text>,
        header: t("recipes:table.createdAt"),
      },
      {
        accessorKey: "id",
        cell: (info) => (
          <Group gap={4} justify="flex-end" style={{ flexWrap: "nowrap" }}>
            <Menu position="bottom-end" withArrow withinPortal>
              <Menu.Target>
                <ActionIcon>
                  <Icons.Dots size={16} />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item
                  leftSection={<Icons.Eye size={14} />}
                  onClick={() => navigate(`/recipes/${info.getValue()}`)}
                >
                  {t("common:button.view")}
                </Menu.Item>
                <Menu.Item
                  leftSection={<Icons.CopyCheck size={14} />}
                  onClick={() =>
                    navigate(`/tasks/create?recipeId=${info.getValue()}`)
                  }
                >
                  {t("recipes:runTask")}
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item
                  leftSection={<Icons.Trash size={14} />}
                  color="red"
                  onClick={() => onDelete?.(info.getValue() as string)}
                >
                  {t("common:button.delete")}
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        ),
        header: t("recipes:list.columns.actions"),
      },
    ],
    [t, getTaskTypeLabel, navigate, onDelete]
  );

  const table = useReactTable({
    columns,
    data: recipes,
    enableGlobalFilter: true,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: false,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    state: {
      globalFilter,
      pagination,
      sorting,
    },
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
                          <Icons.ArrowUp size={12} />
                        ) : header.column.getIsSorted() === "desc" ? (
                          <Icons.ArrowDown size={12} />
                        ) : (
                          <Icons.Sort size={12} style={{ opacity: 0.5 }} />
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
              label: `${pageSize} ${t("common:pagination.per_page")}`,
              value: pageSize,
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
