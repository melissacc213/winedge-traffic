import { useState } from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  getPaginationRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table";
import type { SortingState, ColumnFiltersState } from "@tanstack/react-table";
import {
  IconChevronUp,
  IconChevronDown,
  IconSearch,
} from "@tabler/icons-react";
import {
  Group,
  Select,
  Table,
  Text,
  TextInput,
  Badge,
  Paper,
  Pagination,
  Progress,
} from "@mantine/core";
import { useNavigate } from "react-router-dom";
import type { Task } from "../../lib/validator/task";
import { TaskStatusBadge } from "./task-status-badge";
import { formatDate } from "../../lib/utils";
import { TaskActionMenu } from "./task-action-menu";

const columnHelper = createColumnHelper<Task>();

interface TaskTableProps {
  tasks: Task[];
  isLoading?: boolean;
}

export function TaskTable({ tasks }: TaskTableProps) {
  const navigate = useNavigate();
  const [sorting, setSorting] = useState<SortingState>([
    { id: "startTime", desc: true },
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const [pageSize, setPageSize] = useState<string | null>("10");

  const columns = [
    columnHelper.accessor("id", {
      header: "ID",
      cell: (info) => <Text truncate>{info.getValue()}</Text>,
      enableSorting: false,
    }),
    columnHelper.accessor("name", {
      header: "Name",
      cell: (info) => <Text fw={500}>{info.getValue()}</Text>,
    }),
    columnHelper.accessor("taskType", {
      header: "Type",
      cell: (info) => (
        <Badge variant="light" color="blue">
          {info.getValue().charAt(0).toUpperCase() + info.getValue().slice(1)}
        </Badge>
      ),
      filterFn: "equals",
    }),
    columnHelper.accessor("status", {
      header: "Status",
      cell: (info) => <TaskStatusBadge status={info.getValue()} />,
      filterFn: "equals",
    }),
    columnHelper.accessor("progress", {
      header: "Progress",
      cell: (info) => (
        <Group wrap="nowrap" gap="xs">
          <Progress value={info.getValue()} size="sm" style={{ width: 80 }} />
          <Text size="xs">{info.getValue()}%</Text>
        </Group>
      ),
    }),
    columnHelper.accessor("startTime", {
      header: "Start Time",
      cell: (info) =>
        info.getValue() ? (
          <Text>{formatDate(info.getValue()!)}</Text>
        ) : (
          <Text c="dimmed">-</Text>
        ),
    }),
    columnHelper.accessor("endTime", {
      header: "End Time",
      cell: (info) =>
        info.getValue() ? (
          <Text>{formatDate(info.getValue()!)}</Text>
        ) : (
          <Text c="dimmed">-</Text>
        ),
    }),
    columnHelper.display({
      id: "actions",
      header: "",
      cell: (info) => <TaskActionMenu task={info.row.original} />,
      enableSorting: false,
    }),
  ];

  const table = useReactTable({
    data: tasks,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  // Update pagination when page size changes
  if (pageSize) {
    table.setPageSize(Number(pageSize));
  }

  const navigateToTaskDetails = (taskId: string) => {
    navigate(`/tasks/${taskId}`);
  };

  // Filter options for status and type
  const statusOptions = [
    { value: "all", label: "All Statuses" },
    { value: "running", label: "Running" },
    { value: "pending", label: "Pending" },
    { value: "completed", label: "Completed" },
    { value: "failed", label: "Failed" },
    { value: "stopped", label: "Stopped" },
  ];

  const typeOptions = [
    { value: "all", label: "All Types" },
    { value: "detection", label: "Detection" },
    { value: "classification", label: "Classification" },
    { value: "counting", label: "Counting" },
    { value: "tracking", label: "Tracking" },
  ];

  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const handleStatusFilterChange = (value: string | null) => {
    if (value && value !== "all") {
      table.getColumn("status")?.setFilterValue(value);
    } else {
      table.getColumn("status")?.setFilterValue(undefined);
    }
    setStatusFilter(value || "all");
  };

  const handleTypeFilterChange = (value: string | null) => {
    if (value && value !== "all") {
      table.getColumn("taskType")?.setFilterValue(value);
    } else {
      table.getColumn("taskType")?.setFilterValue(undefined);
    }
    setTypeFilter(value || "all");
  };

  return (
    <div className="task-table-container">
      <Paper p="md" withBorder mb="md">
        <Group justify="space-between" mb="md">
          <TextInput
            placeholder="Search tasks..."
            leftSection={<IconSearch size={16} />}
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.currentTarget.value)}
            style={{ width: 300 }}
          />
          <Group>
            <Select
              label="Status"
              value={statusFilter}
              onChange={handleStatusFilterChange}
              data={statusOptions}
              clearable={false}
            />
            <Select
              label="Type"
              value={typeFilter}
              onChange={handleTypeFilterChange}
              data={typeOptions}
              clearable={false}
            />
          </Group>
        </Group>
      </Paper>

      <Table withTableBorder highlightOnHover>
        <Table.Thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <Table.Tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <Table.Th
                  key={header.id}
                  style={{
                    cursor: header.column.getCanSort() ? "pointer" : "default",
                  }}
                  onClick={header.column.getToggleSortingHandler()}
                >
                  <Group gap="xs" justify="space-between" wrap="nowrap">
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                    {header.column.getCanSort() && (
                      <span>
                        {header.column.getIsSorted() === "asc" ? (
                          <IconChevronUp size={14} />
                        ) : header.column.getIsSorted() === "desc" ? (
                          <IconChevronDown size={14} />
                        ) : null}
                      </span>
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
                colSpan={columns.length}
                style={{ textAlign: "center", padding: "40px 0" }}
              >
                <Text c="dimmed">
                  No tasks found. Try adjusting your filters.
                </Text>
              </Table.Td>
            </Table.Tr>
          ) : (
            table.getRowModel().rows.map((row) => (
              <Table.Tr
                key={row.id}
                className="task-row-link"
                onClick={() => navigateToTaskDetails(row.original.id)}
              >
                {row.getVisibleCells().map((cell) => (
                  <Table.Td key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </Table.Td>
                ))}
              </Table.Tr>
            ))
          )}
        </Table.Tbody>
      </Table>

      <div className="task-table-footer">
        <Group gap="xs">
          <Pagination
            total={table.getPageCount()}
            value={table.getState().pagination.pageIndex + 1}
            onChange={(page) => table.setPageIndex(page - 1)}
          />
          <Select
            value={pageSize}
            onChange={setPageSize}
            data={[
              { value: "5", label: "5 rows" },
              { value: "10", label: "10 rows" },
              { value: "20", label: "20 rows" },
              { value: "50", label: "50 rows" },
            ]}
            style={{ width: 100 }}
          />
        </Group>
        <Text size="sm">
          Showing {table.getRowModel().rows.length} of {tasks.length} tasks
        </Text>
      </div>
    </div>
  );
}
