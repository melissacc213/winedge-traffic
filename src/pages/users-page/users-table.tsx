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
import { TableLoading } from "../../components/ui";
import { useTheme } from "../../providers/theme-provider";

interface User {
  id: string;
  username: string;
  email: string;
  status: "active" | "disabled";
  role: "admin" | "user" | "viewer";
  created: string;
}

interface UsersTableProps {
  users: User[];
  isLoading: boolean;
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
  onToggleStatus?: (id: string, status: "active" | "disabled") => void;
}

export function UsersTable({
  users,
  isLoading,
  onDelete,
  onEdit,
  onToggleStatus,
}: UsersTableProps) {
  const { t } = useTranslation(["components", "common"]);
  const { colorScheme } = useTheme();
  const navigate = useNavigate();
  const [sorting, setSorting] = useState<SortingState>([
    { id: "created", desc: true },
  ]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  // Format date with relative time
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    let relativeTime = "";
    if (diffMins < 1) {
      relativeTime = "just now";
    } else if (diffMins < 60) {
      relativeTime = `${diffMins} mins ago`;
    } else if (diffHours < 24) {
      relativeTime = `${diffHours} hours ago`;
    } else if (diffDays < 7) {
      relativeTime = `${diffDays} days ago`;
    } else {
      relativeTime = new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }).format(date);
    }

    return relativeTime;
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    return status === "active" ? "green" : "red";
  };

  // Get role badge color
  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "blue";
      case "user":
        return "teal";
      case "viewer":
        return "grape";
      default:
        return "gray";
    }
  };

  const columnHelper = createColumnHelper<User>();

  const columns = useMemo(
    () => [
      columnHelper.accessor("username", {
        header: t("components:users.list.username"),
        cell: (info) => (
          <Box>
            <Text fw={500}>{info.getValue()}</Text>
            <Text size="xs" c="dimmed">
              {info.row.original.id}
            </Text>
          </Box>
        ),
      }),
      columnHelper.accessor("email", {
        header: t("components:users.list.email"),
        cell: (info) => <Text>{info.getValue()}</Text>,
      }),
      columnHelper.accessor("status", {
        header: t("components:users.list.status"),
        cell: (info) => (
          <Badge color={getStatusColor(info.getValue())} variant="light">
            {t(`components:users.status.${info.getValue()}`)}
          </Badge>
        ),
      }),
      columnHelper.accessor("role", {
        header: t("components:users.list.role"),
        cell: (info) => (
          <Badge color={getRoleColor(info.getValue())} variant="light">
            {t(`components:users.role.${info.getValue()}`)}
          </Badge>
        ),
      }),
      columnHelper.accessor("created", {
        header: t("components:users.list.created"),
        cell: (info) => (
          <Box>
            <Text size="sm" fw={500}>
              {formatDate(info.getValue())}
            </Text>
            <Text size="xs" c="dimmed">
              {info.getValue() ? new Intl.DateTimeFormat("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              }).format(new Date(info.getValue())) : ""}
            </Text>
          </Box>
        ),
      }),
      columnHelper.accessor("id", {
        header: t("components:users.list.actions"),
        cell: (info) => (
          <Group gap={4} justify="flex-end" style={{ flexWrap: "nowrap" }}>
            <Menu position="bottom-end" withArrow withinPortal>
              <Menu.Target>
                <ActionIcon variant="subtle" color="gray">
                  <Icons.Dots size={16} />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item
                  leftSection={<Icons.Eye size={16} />}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/users/${info.getValue()}`);
                  }}
                >
                  {t("components:users.actions.view")}
                </Menu.Item>
                <Menu.Item
                  leftSection={<Icons.Pencil size={16} />}
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit?.(info.getValue());
                  }}
                >
                  {t("components:users.actions.edit")}
                </Menu.Item>
                {info.row.original.status === "active" ? (
                  <Menu.Item
                    leftSection={<Icons.X size={16} />}
                    color="orange"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleStatus?.(info.getValue(), "disabled");
                    }}
                  >
                    {t("components:users.actions.disable")}
                  </Menu.Item>
                ) : (
                  <Menu.Item
                    leftSection={<Icons.Check size={16} />}
                    color="teal"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleStatus?.(info.getValue(), "active");
                    }}
                  >
                    {t("components:users.actions.enable")}
                  </Menu.Item>
                )}
                <Menu.Divider />
                <Menu.Item
                  leftSection={<Icons.Trash size={16} />}
                  color="red"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete?.(info.getValue());
                  }}
                >
                  {t("components:users.actions.delete")}
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        ),
      }),
    ],
    [columnHelper, t, onEdit, onToggleStatus, onDelete]
  );

  const table = useReactTable({
    data: users,
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
        title={t("components:users.title")}
        rows={5}
        columns={5}
        withPagination={true}
        withSearch={true}
        withActions={true}
      />
    );
  }

  // Show empty state
  if (users.length === 0) {
    return (
      <TableLoading
        title={t("components:users.title")}
        noData={true}
        noDataMessage={t("components:users.list.empty", "No users found")}
        emptyIcon={<Icons.Users size={48} />}
      />
    );
  }

  // Show table with data
  return (
    <Paper withBorder p="md">
      <Group justify="space-between" mb="md">
        <Title order={3}>{t("components:users.title")}</Title>
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
                          <Icons.ArrowUp size={16} />
                        ) : header.column.getIsSorted() === "desc" ? (
                          <Icons.ArrowDown size={16} />
                        ) : (
                          <Icons.Sort size={16} style={{ opacity: 0.5 }} />
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
              onClick={() => navigate(`/users/${row.original.id}`)}
              style={{
                cursor: 'pointer',
              }}
            >
              {row.getVisibleCells().map((cell) => (
                <Table.Td 
                  key={cell.id}
                  onClick={(e) => {
                    // Prevent row click for action column
                    if (cell.column.id === 'id') {
                      e.stopPropagation();
                    }
                  }}
                >
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
