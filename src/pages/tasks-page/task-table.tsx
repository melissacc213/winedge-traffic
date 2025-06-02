import { useState, useMemo } from "react";
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
import type { PaginationState, SortingState, ColumnDef } from "@tanstack/react-table";
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
  Progress,
} from "@mantine/core";
import { Icons } from "../../components/icons";
import type { Task } from "../../types/task";
import { TableLoading } from "../../components/ui";

interface TaskTableProps {
  tasks: Task[];
  isLoading: boolean;
  onCancel?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function TaskTable({
  tasks,
  isLoading,
  onCancel,
  onDelete,
}: TaskTableProps) {
  const { t } = useTranslation(["tasks", "common"]);
  const navigate = useNavigate();
  const [sorting, setSorting] = useState<SortingState>([
    { id: "createdAt", desc: true },
  ]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  // Get badge color based on status
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "green";
      case "running":
        return "blue";
      case "queued":
        return "yellow";
      case "failed":
        return "red";
      case "cancelled":
        return "gray";
      default:
        return "gray";
    }
  };

  // Get result type color
  const getResultTypeColor = (type: string) => {
    switch (type) {
      case "detection":
        return "blue";
      case "classification":
        return "green";
      case "counting":
        return "orange";
      case "tracking":
        return "violet";
      default:
        return "gray";
    }
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
    } catch (e) {
      return dateString;
    }
  };

  const columns = useMemo<ColumnDef<Task>[]>(
    () => [
      {
        accessorKey: "name",
        header: t("tasks:table.name"),
        cell: (info) => {
          const name = info.getValue() as string;
          return (
            <Box>
              <Text fw={500}>{name}</Text>
              <Text size="xs" c="dimmed" lineClamp={1}>
                {info.row.original.description || t("tasks:noDescription")}
              </Text>
            </Box>
          );
        },
      },
      {
        accessorKey: "status",
        header: t("tasks:table.status"),
        cell: (info) => {
          const status = info.getValue() as string;
          return (
            <Badge color={getStatusColor(status)} variant="light">
              {t(`tasks:status.${status}`)}
            </Badge>
          );
        },
      },
      {
        accessorKey: "progress",
        header: t("tasks:table.progress"),
        cell: (info) => {
          const progress = info.getValue() as number;
          return (
            <Box style={{ width: "100px" }}>
              <Progress
                value={progress}
                color={getStatusColor(info.row.original.status)}
                size="sm"
                radius="sm"
                animated={info.row.original.status === "running"}
                striped={info.row.original.status === "running"}
              />
              <Text size="xs" ta="right" c="dimmed" mt={4}>
                {progress}%
              </Text>
            </Box>
          );
        },
      },
      {
        accessorKey: "resultType",
        header: t("tasks:table.type"),
        cell: (info) => {
          const resultType = info.getValue() as string;
          return (
            <Badge color={getResultTypeColor(resultType)} variant="light">
              {t(`tasks:taskType.${resultType}`)}
            </Badge>
          );
        },
      },
      {
        accessorKey: "recipeName",
        header: t("tasks:table.recipe"),
        cell: (info) => {
          const recipeName = info.getValue() as string;
          return (
            <Text size="sm" lineClamp={1}>
              {recipeName || "—"}
            </Text>
          );
        },
      },
      {
        accessorKey: "createdAt",
        header: t("tasks:table.createdAt"),
        cell: (info) => {
          const createdAt = info.getValue() as string;
          return <Text size="sm">{formatDate(createdAt)}</Text>;
        },
      },
      {
        accessorKey: "id",
        header: t("tasks:table.actions"),
        cell: (info) => {
          const task = info.row.original;
          const id = info.getValue() as string;
          return (
            <Group gap={4} justify="flex-end" style={{ flexWrap: "nowrap" }}>
              <Menu position="bottom-end" withArrow withinPortal>
                <Menu.Target>
                  <ActionIcon>
                    <Icons.Dots size={16} />
                  </ActionIcon>
                </Menu.Target>
                <Menu.Dropdown>
                  {task.status === "running" && (
                    <Menu.Item
                      leftSection={<Icons.PlayerStop size={14} />}
                      color="yellow"
                      onClick={() => onCancel?.(id)}
                    >
                      {t("tasks:action.cancel")}
                    </Menu.Item>
                  )}

                  {task.status === "completed" && (
                    <Menu.Item
                      leftSection={<Icons.FileAnalytics size={14} />}
                      onClick={() =>
                        navigate(`/tasks/${id}/metrics`)
                      }
                    >
                      {t("tasks:action.viewMetrics")}
                    </Menu.Item>
                  )}

                  <Menu.Divider />

                  <Menu.Item
                    leftSection={<Icons.Trash size={14} />}
                    color="red"
                    onClick={() => onDelete?.(id)}
                    disabled={task.status === "running"}
                  >
                    {t("tasks:action.delete")}
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </Group>
          );
        },
      },
    ],
    [t, navigate, onCancel, onDelete]
  );

  const table = useReactTable({
    data: tasks,
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
        title={t("tasks:table.title")}
        rows={5}
        columns={7}
        withPagination={true}
        withSearch={true}
        withActions={true}
      />
    );
  }

  // Show empty state
  if (tasks.length === 0) {
    return (
      <TableLoading
        title={t("tasks:table.title")}
        noData={true}
        noDataMessage={t("tasks:noTasks")}
        emptyIcon={<Icons.Activity size={48} opacity={0.7} />}
      />
    );
  }

  // Show table with data
  return (
    <Paper withBorder p="md">
      <Group justify="space-between" mb="md">
        <Title order={3}>{t("tasks:table.title")}</Title>
        <Input
          placeholder={t("common:action.search")}
          value={globalFilter ?? ""}
          onChange={(e) => setGlobalFilter(e.target.value)}
          leftSection={<Icons.Search size={16} />}
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
            <Table.Tr
              key={row.id}
              onClick={() => navigate(`/tasks/${row.original.id}`)}
              style={{ cursor: "pointer" }}
            >
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
