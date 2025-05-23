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
  Card,
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
import { TableSkeleton } from "../../components/ui";
import { useNavigate } from "react-router-dom";

interface TasksTableProps {
  tasks: Task[];
  isLoading: boolean;
  onCancel?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function TasksTable({
  tasks,
  isLoading,
  onCancel,
  onDelete,
}: TasksTableProps) {
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
      case "trafficStatistics":
        return "cyan";
      case "trainDetection":
        return "indigo";
      default:
        return "gray";
    }
  };

  // TODO: Format date to human readable
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

  const columnHelper = createColumnHelper<Task>();

  const columns = useMemo(
    () => [
      columnHelper.accessor("name", {
        header: t("tasks:table.name"),
        cell: (info) => (
          <Box>
            <Text fw={500}>{info.getValue()}</Text>
            <Text size="xs" c="dimmed" lineClamp={1}>
              {info.row.original.description || t("tasks:noDescription")}
            </Text>
          </Box>
        ),
      }),
      columnHelper.accessor("status", {
        header: t("tasks:table.status"),
        cell: (info) => (
          <Badge color={getStatusColor(info.getValue())} variant="light">
            {t(`tasks:status.${info.getValue()}`)}
          </Badge>
        ),
      }),
      columnHelper.accessor("progress", {
        header: t("tasks:table.progress"),
        cell: (info) => (
          <Box style={{ width: "100px" }}>
            <Progress
              value={info.getValue()}
              color={getStatusColor(info.row.original.status)}
              size="sm"
              radius="sm"
              animated={info.row.original.status === "running"}
              striped={info.row.original.status === "running"}
            />
            <Text size="xs" ta="right" c="dimmed" mt={4}>
              {info.getValue()}%
            </Text>
          </Box>
        ),
      }),
      columnHelper.accessor("resultType", {
        header: t("tasks:table.type"),
        cell: (info) => (
          <Badge color={getResultTypeColor(info.getValue())} variant="light">
            {t(`tasks:taskType.${info.getValue()}`)}
          </Badge>
        ),
      }),
      columnHelper.accessor("recipeName", {
        header: t("tasks:table.recipe"),
        cell: (info) => (
          <Text size="sm" lineClamp={1}>
            {info.getValue() || "—"}
          </Text>
        ),
      }),
      columnHelper.accessor("createdAt", {
        header: t("tasks:table.createdAt"),
        cell: (info) => <Text size="sm">{formatDate(info.getValue())}</Text>,
      }),
      columnHelper.accessor("id", {
        header: t("tasks:list.columns.actions"),
        cell: (info) => {
          const task = info.row.original;
          return (
            <Group gap={4} justify="flex-end" style={{ flexWrap: "nowrap" }}>
              <Menu position="bottom-end" withArrow withinPortal>
                <Menu.Target>
                  <ActionIcon>
                    <Icons.Dots size="sm" />
                  </ActionIcon>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Item
                    leftSection={<Icons.Eye size="xs" />}
                    onClick={() => navigate(`/tasks/${info.getValue()}`)}
                  >
                    {t("tasks:action.view")}
                  </Menu.Item>

                  {task.status === "running" && (
                    <Menu.Item
                      leftSection={<Icons.PlayerStop size="xs" />}
                      color="yellow"
                      onClick={() => onCancel?.(info.getValue())}
                    >
                      {t("tasks:action.cancel")}
                    </Menu.Item>
                  )}

                  {task.status === "completed" && (
                    <Menu.Item
                      leftSection={<Icons.FileAnalytics size="xs" />}
                      onClick={() =>
                        navigate(`/tasks/${info.getValue()}/metrics`)
                      }
                    >
                      {t("tasks:action.viewMetrics")}
                    </Menu.Item>
                  )}

                  <Menu.Divider />

                  <Menu.Item
                    leftSection={<Icons.Trash size="xs" />}
                    color="red"
                    onClick={() => onDelete?.(info.getValue())}
                    disabled={task.status === "running"}
                  >
                    {t("tasks:action.delete")}
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </Group>
          );
        },
      }),
    ],
    [columnHelper, t, navigate, onCancel, onDelete]
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

  if (isLoading) {
    return (
      <Paper withBorder p="md">
        <Title order={3} mb="md">
          {t("tasks:table.title")}
        </Title>
        <TableSkeleton rows={5} columns={7} />
      </Paper>
    );
  }

  if (tasks.length === 0) {
    return (
      <Paper withBorder p="md">
        <Title order={3} mb="md">
          {/* {t("tasks:table.title")} */}
        </Title>
        <Card withBorder p="xl">
          <Text style={{ textAlign: "center" }} c="dimmed">
            {t("tasks:noTasks")}
          </Text>
        </Card>
      </Paper>
    );
  }

  return (
    <Paper withBorder p="md">
      <Group justify="space-between" mb="md">
        <Title order={3}>{t("tasks:table.title")}</Title>
        <Input
          placeholder={t("tasks:table.search")}
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
