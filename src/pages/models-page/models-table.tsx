import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
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
import type { Model } from "../../lib/store/model-store";
import { TableLoading } from "../../components/ui";

interface ModelTableProps {
  models: Model[];
  isLoading: boolean;
  onDelete?: (id: string) => void;
  onDownload?: (id: string) => void;
}

export function ModelsTable({
  models,
  isLoading,
  onDelete,
  onDownload,
}: ModelTableProps) {
  const { t } = useTranslation(["models", "common"]);
  const navigate = useNavigate();
  const [sorting, setSorting] = useState<SortingState>([
    { id: "createdAt", desc: true },
  ]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  // Format file size to human readable
  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Format date
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  // Get badge color based on model status
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "green";
      case "pending":
        return "yellow";
      case "failed":
        return "red";
      case "processing":
        return "blue";
      case "available":
        return "green";
      case "error":
        return "red";
      default:
        return "gray";
    }
  };

  const columnHelper = createColumnHelper<Model>();

  const columns = useMemo(
    () => [
      columnHelper.accessor("name", {
        header: t("models:list.columns.name"),
        cell: (info) => (
          <Box>
            <Text fw={500}>{info.getValue()}</Text>
            <Text size="xs" c="dimmed">
              {info.row.original.id}
            </Text>
          </Box>
        ),
      }),
      columnHelper.accessor("type", {
        header: t("models:list.columns.type"),
        cell: (info) => <Text>{info.getValue()}</Text>,
      }),
      columnHelper.accessor("size", {
        header: t("models:list.columns.size"),
        cell: (info) => <Text>{formatSize(info.getValue())}</Text>,
      }),
      columnHelper.accessor("status", {
        header: t("models:list.columns.status"),
        cell: (info) => (
          <Badge color={getStatusColor(info.getValue())} variant="light">
            {t(`models:status.${info.getValue()}`)}
          </Badge>
        ),
      }),
      columnHelper.accessor("createdAt", {
        header: t("models:list.columns.date"),
        cell: (info) => <Text size="sm">{formatDate(info.getValue())}</Text>,
      }),
      columnHelper.accessor("id", {
        header: t("models:list.columns.actions"),
        cell: (info) => (
          <Group gap={4} justify="flex-end" style={{ flexWrap: "nowrap" }}>
            <ActionIcon
              color="blue"
              onClick={() => onDownload?.(info.getValue())}
              disabled={
                info.row.original.status !== "active" &&
                info.row.original.status !== "available"
              }
            >
              <Icons.Download size="sm" />
            </ActionIcon>

            <Menu position="bottom-end" withArrow withinPortal>
              <Menu.Target>
                <ActionIcon>
                  <Icons.Dots size="sm" />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item
                  leftSection={<Icons.Eye size="xs" />}
                  disabled={
                    info.row.original.status !== "active" &&
                    info.row.original.status !== "available"
                  }
                  onClick={() => navigate(`/models/${info.getValue()}`)}
                >
                  {t("models:actions.view_details")}
                </Menu.Item>
                <Menu.Item
                  leftSection={<Icons.Pencil size="xs" />}
                  disabled={
                    info.row.original.status !== "active" &&
                    info.row.original.status !== "available"
                  }
                  onClick={() => navigate(`/models/${info.getValue()}/edit`)}
                >
                  {t("models:actions.edit")}
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item
                  leftSection={<Icons.Trash size="xs" />}
                  color="red"
                  onClick={() => onDelete?.(info.getValue())}
                >
                  {t("models:actions.delete")}
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        ),
      }),
    ],
    [t, onDelete, onDownload]
  );

  const table = useReactTable({
    data: models,
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
    getFilteredRowModel: getFilteredRowModel(),
    manualPagination: false,
  });

  // Show loading state
  if (isLoading) {
    return (
      <TableLoading
        title={t("models:list.title")}
        rows={5}
        columns={5}
        withPagination={true}
        withSearch={true}
        withActions={true}
      />
    );
  }

  // Show empty state
  if (models.length === 0) {
    return (
      <TableLoading
        title={t("models:list.title")}
        noData={true}
        noDataMessage={t("models:list.empty")}
        emptyIcon={<Icons.Model size={48} />}
      />
    );
  }

  // Show table with data
  return (
    <Paper withBorder p="md">
      <Group justify="space-between" mb="md">
        <Title order={3}>{t("models:list.title")}</Title>
        <Input
          placeholder={t("common:action.search")}
          value={globalFilter ?? ""}
          onChange={(e) => setGlobalFilter(e.target.value)}
          leftSection={<Icons.Search size="xs" />}
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
