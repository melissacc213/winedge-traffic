import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Center,
  Checkbox,
  Flex,
  Group,
  Loader,
  Paper,
  ScrollArea,
  Select,
  Stack,
  Table,
  Text,
  TextInput,
  Tooltip,
  Transition,
  useComputedColorScheme,
  useMantineTheme,
} from "@mantine/core";
import type {
  ColumnDef,
  ColumnFiltersState,
  RowSelectionState,
  SortingState,
  VisibilityState,
} from "@tanstack/react-table";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type { ReactNode } from "react";
import { useEffect,useMemo, useState } from "react";

import { Icons } from "@/components/icons";
import { highlightSearchTerm } from "@/lib/utils";

export interface DataTableColumn<T> {
  key: string;
  label: string;
  width?: number | string;
  render?: (item: T, globalFilter?: string) => ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  filterType?: "text" | "select" | "date";
  filterOptions?: { value: string; label: string }[];
}

interface DataTableProps<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  loading?: boolean;
  pageSize?: number;
  onRowClick?: (item: T) => void;
  selectedRowId?: string | number;
  getRowId?: (item: T) => string | number;
  stickyHeader?: boolean;
  height?: number;
  showPagination?: boolean;
  defaultSort?: { key: string; direction: "asc" | "desc" };
  actions?: (item: T) => ReactNode;
  emptyMessage?: string;
  showSelection?: boolean;
  selectedIds?: Set<string | number>;
  onSelectionChange?: (ids: Set<string | number>) => void;
  enableGlobalFilter?: boolean;
  enableColumnFilters?: boolean;
  enableColumnVisibility?: boolean;
  showDensityToggle?: boolean;
  exportable?: boolean;
  onExport?: () => void;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  pageSize: initialPageSize = 10,
  onRowClick,
  selectedRowId,
  getRowId = (item) => item.id,
  stickyHeader = true,
  height = 600,
  showPagination = true,
  defaultSort,
  actions,
  emptyMessage = "No data available",
  showSelection = false,
  selectedIds = new Set(),
  onSelectionChange,
  enableGlobalFilter = true,
}: DataTableProps<T>) {
  const theme = useMantineTheme();
  const computedColorScheme = useComputedColorScheme();
  const isDark = computedColorScheme === 'dark';

  // Table states
  const [sorting, setSorting] = useState<SortingState>(
    defaultSort
      ? [{ desc: defaultSort.direction === "desc", id: defaultSort.key }]
      : []
  );
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [searchInput, setSearchInput] = useState("");
  const [globalFilter, setGlobalFilter] = useState("");

  // Handle search submission
  const handleSearch = () => {
    setGlobalFilter(searchInput);
  };

  // Handle search clear
  const handleClearSearch = () => {
    setSearchInput("");
    setGlobalFilter("");
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Sync external selection with internal state
  useEffect(() => {
    if (showSelection && onSelectionChange) {
      const newRowSelection: RowSelectionState = {};
      data.forEach((item, index) => {
        const rowId = getRowId(item);
        if (selectedIds.has(rowId)) {
          newRowSelection[index] = true;
        }
      });
      setRowSelection(newRowSelection);
    }
  }, [selectedIds, data, getRowId, showSelection, onSelectionChange]);

  // Create TanStack table columns with globalFilter dependency
  const tableColumns = useMemo<ColumnDef<T>[]>(() => {
    const cols: ColumnDef<T>[] = [];

    // Selection column
    if (showSelection) {
      cols.push({
        cell: ({ row }) => (
          <Center>
            <Checkbox
              checked={row.getIsSelected()}
              onChange={row.getToggleSelectedHandler()}
              onClick={(e) => e.stopPropagation()}
              styles={{
                input: {
                  "&:checked": {
                    backgroundColor: theme.colors.blue[6],
                    borderColor: theme.colors.blue[6],
                  },
                  border: `1.5px solid ${isDark ? theme.colors.dark?.[3] || theme.colors.gray[6] : theme.colors.gray[4]}`,
                  cursor: "pointer",
                },
              }}
            />
          </Center>
        ),
        enableHiding: false,
        enableSorting: false,
        header: ({ table }) => (
          <Center>
            <Checkbox
              checked={table.getIsAllRowsSelected()}
              indeterminate={table.getIsSomeRowsSelected()}
              onChange={table.getToggleAllRowsSelectedHandler()}
              styles={{
                input: {
                  "&:checked": {
                    backgroundColor: theme.colors.blue[6],
                    borderColor: theme.colors.blue[6],
                  },
                  border: `1.5px solid ${isDark ? theme.colors.dark?.[3] || theme.colors.gray[6] : theme.colors.gray[4]}`,
                  cursor: "pointer",
                },
              }}
            />
          </Center>
        ),
        id: "select",
        size: 48,
      });
    }

    // Data columns
    columns.forEach((column) => {
      cols.push({
        accessorKey: column.key,
        cell: ({ row }) => {
          const value = row.original[column.key];

          // If there's a custom render function, use it with the global filter
          if (column.render) {
            return column.render(row.original, globalFilter);
          }

          // If there's a global filter and the value is a string, highlight matches
          if (globalFilter && typeof value === "string") {
            return (
              <div style={{ fontSize: "14px" }}>
                {highlightSearchTerm(value, globalFilter)}
              </div>
            );
          }

          // Otherwise return the value as-is
          return value;
        },
        enableHiding: true,
        enableSorting: column.sortable !== false,
        header: ({ column: col }) => {
          const isSorted = col.getIsSorted();
          const canSort = column.sortable !== false;

          return (
            <Group
              gap={8}
              justify="apart"
              wrap="nowrap"
              align="center"
              style={{ cursor: canSort ? "pointer" : "default" }}
              onClick={canSort ? col.getToggleSortingHandler() : undefined}
            >
              <Text
                size="xs"
                fw={600}
                tt="uppercase"
                style={{
                  color: isDark ? theme.colors.gray[4] : theme.colors.gray[6],
                  fontSize: "11px",
                  letterSpacing: "0.05em",
                  lineHeight: "16px",
                }}
              >
                {column.label}
              </Text>
              {canSort && (
                <Box
                  style={{
                    alignItems: "center",
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                    justifyContent: "center",
                  }}
                >
                  <Icons.ChevronUp
                    size={10}
                    style={{
                      color:
                        isSorted === "asc"
                          ? theme.colors.blue[6]
                          : isDark
                            ? theme.colors.gray[6]
                            : theme.colors.gray[5],
                      opacity: isSorted === "asc" ? 1 : 0.3,
                      transition: "all 0.2s ease",
                    }}
                  />
                  <Icons.ChevronDown
                    size={10}
                    style={{
                      color:
                        isSorted === "desc"
                          ? theme.colors.blue[6]
                          : isDark
                            ? theme.colors.gray[6]
                            : theme.colors.gray[5],
                      opacity: isSorted === "desc" ? 1 : 0.3,
                      transition: "all 0.2s ease",
                    }}
                  />
                </Box>
              )}
            </Group>
          );
        },
        id: column.key,
        size: column.width as number,
      });
    });

    // Actions column
    if (actions) {
      cols.push({
        cell: ({ row }) => actions(row.original),
        enableHiding: false,
        enableSorting: false,
        header: () => (
          <Text
            size="xs"
            fw={600}
            tt="uppercase"
            style={{
              color: isDark ? theme.colors.gray[4] : theme.colors.gray[6],
            }}
          >
            Actions
          </Text>
        ),
        id: "actions",
        size: 80,
      });
    }

    return cols;
  }, [columns, actions, showSelection, isDark, theme, globalFilter]);

  // Create table instance
  const table = useReactTable({
    columns: tableColumns,
    data,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: {
      pagination: {
        pageSize: initialPageSize,
      },
    },
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: (updater) => {
      setRowSelection(updater);
      if (showSelection && onSelectionChange) {
        const newRowSelection =
          typeof updater === "function" ? updater(rowSelection) : updater;
        const selectedIndexes = Object.keys(newRowSelection)
          .filter((key) => newRowSelection[key])
          .map(Number);
        const newSelectedIds = new Set(
          selectedIndexes.map((index) => getRowId(data[index]))
        );
        onSelectionChange(newSelectedIds);
      }
    },
    onSortingChange: setSorting,
    state: {
      columnFilters,
      columnVisibility,
      globalFilter,
      rowSelection,
      sorting,
    },
  });

  if (loading) {
    return (
      <Paper
        radius="lg"
        style={{
          background: isDark
            ? theme.colors.dark?.[7] || theme.colors.gray[8]
            : theme.white,
          border: `1px solid ${isDark ? theme.colors.dark?.[5] || theme.colors.gray[6] : theme.colors.gray[2]}`,
          height,
          overflow: "hidden",
        }}
      >
        <Center h="100%">
          <Stack align="center" gap="md">
            <Loader size="lg" variant="dots" />
            <Text size="sm" c="dimmed">
              Loading data...
            </Text>
          </Stack>
        </Center>
      </Paper>
    );
  }

  return (
    <Paper
      radius="lg"
      style={{
        background: isDark
          ? theme.colors.dark?.[7] || theme.colors.gray[8]
          : theme.white,
        border: `1px solid ${isDark ? theme.colors.dark?.[5] || theme.colors.gray[6] : theme.colors.gray[2]}`,
        boxShadow: isDark
          ? "0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)"
          : "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        display: "flex",
        flexDirection: "column",
        height: height,
        overflow: "hidden",
      }}
    >
      {/* Fixed Header with Search */}
      {enableGlobalFilter && (
        <Box
          style={{
            background: isDark
              ? theme.colors.dark?.[6] || theme.colors.gray[7]
              : theme.colors.gray[0],
            borderBottom: `1px solid ${isDark ? theme.colors.dark?.[5] || theme.colors.gray[6] : theme.colors.gray[2]}`,
            flexShrink: 0,
            padding: "12px 20px",
          }}
        >
          <Flex justify="flex-end" align="center" gap="md">
            <Group gap="xs">
              <TextInput
                placeholder="Search all columns..."
                leftSection={<Icons.Search size={16} />}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyPress={handleKeyPress}
                style={{ width: 300 }}
                size="sm"
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
                styles={{
                  input: {
                    "&:focus": {
                      borderColor:
                        theme.colors.blue?.[6] || theme.colors.blue[5],
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
          </Flex>
        </Box>
      )}

      {/* Scrollable Table Content */}
      <Box style={{ flex: 1, overflow: "hidden", position: "relative" }}>
        <ScrollArea h="100%" offsetScrollbars type="hover">
          <Table
            verticalSpacing={0}
            stickyHeader={stickyHeader}
            style={{ minWidth: "100%" }}
            styles={{
              table: {
                borderCollapse: "collapse",
                fontSize: "14px",
              },
              tbody: {
                tr: {
                  "&:hover": {
                    backgroundColor: isDark
                      ? "rgba(255, 255, 255, 0.02)"
                      : theme.colors.gray[0],
                  },
                  "&:last-child": {
                    borderBottom: "none",
                  },
                  borderBottom: `1px solid ${isDark ? theme.colors.dark?.[5] || theme.colors.gray[6] : theme.colors.gray[1]}`,
                  transition: "all 0.15s ease",
                },
              },
              thead: {
                borderBottom: "none",
              },
            }}
          >
            <Table.Thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <Table.Tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <Table.Th
                      key={header.id}
                      style={{
                        background: isDark
                          ? theme.colors.dark?.[7] || theme.colors.gray[8]
                          : theme.white,
                        borderBottom: `2px solid ${isDark ? theme.colors.dark?.[5] || theme.colors.gray[6] : theme.colors.gray[2]}`,
                        fontWeight: 600,
                        padding: "14px 20px",
                        position: stickyHeader ? "sticky" : undefined,
                        top: stickyHeader ? 0 : undefined,
                        transition: "all 0.2s ease",
                        width: header.getSize(),
                        zIndex: stickyHeader ? 10 : undefined,
                      }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </Table.Th>
                  ))}
                </Table.Tr>
              ))}
            </Table.Thead>
            <Table.Tbody>
              {table.getRowModel().rows.length === 0 ? (
                <Table.Tr>
                  <Table.Td
                    colSpan={table.getAllColumns().length}
                    style={{
                      color: isDark
                        ? theme.colors.gray[5]
                        : theme.colors.gray[6],
                      padding: "80px 20px",
                      textAlign: "center",
                    }}
                  >
                    <Stack align="center" gap="md">
                      <Icons.Database size={56} style={{ opacity: 0.3 }} />
                      <Box>
                        <Text size="lg" fw={500}>
                          {emptyMessage}
                        </Text>
                        {globalFilter && (
                          <>
                            <Text size="sm" c="dimmed" mt="xs">
                              No results found for "{globalFilter}"
                            </Text>
                            <Button
                              size="xs"
                              variant="light"
                              mt="md"
                              onClick={handleClearSearch}
                              leftSection={<Icons.X size={14} />}
                            >
                              Clear search
                            </Button>
                          </>
                        )}
                      </Box>
                    </Stack>
                  </Table.Td>
                </Table.Tr>
              ) : (
                table.getRowModel().rows.map((row, index) => {
                  const rowData = row.original;
                  const rowId = getRowId(rowData);
                  const isSelected =
                    selectedRowId === rowId || row.getIsSelected();

                  return (
                    <Transition
                      key={row.id}
                      mounted={true}
                      transition="fade"
                      duration={100}
                      timingFunction="ease"
                      enterDelay={0}
                    >
                      {(styles) => (
                        <Table.Tr
                          onClick={() => onRowClick?.(rowData)}
                          style={{
                            ...styles,
                            backgroundColor: isSelected
                              ? isDark
                                ? "rgba(59, 130, 246, 0.08)"
                                : "rgba(59, 130, 246, 0.04)"
                              : undefined,
                            cursor: onRowClick ? "pointer" : "default",
                            position: "relative",
                          }}
                        >
                          {isSelected && (
                            <Box
                              style={{
                                backgroundColor: theme.colors.blue[6],
                                bottom: 0,
                                left: 0,
                                position: "absolute",
                                top: 0,
                                width: 3,
                              }}
                            />
                          )}
                          {row.getVisibleCells().map((cell) => (
                            <Table.Td
                              key={cell.id}
                              style={{
                                color: isDark
                                  ? theme.colors.gray[3]
                                  : theme.colors.gray[7],
                                fontSize: "14px",
                                padding: "14px 20px",
                              }}
                              onClick={(e) => {
                                // Prevent row click when clicking on actions column
                                if (cell.column.id === "actions") {
                                  e.stopPropagation();
                                }
                              }}
                            >
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )}
                            </Table.Td>
                          ))}
                        </Table.Tr>
                      )}
                    </Transition>
                  );
                })
              )}
            </Table.Tbody>
          </Table>
        </ScrollArea>
      </Box>

      {/* Fixed Pagination Footer */}
      {showPagination && (
        <Box
          style={{
            background: isDark
              ? theme.colors.dark?.[6] || theme.colors.gray[7]
              : theme.colors.gray[0],
            borderTop: `1px solid ${isDark ? theme.colors.dark?.[5] || theme.colors.gray[6] : theme.colors.gray[2]}`,
            flexShrink: 0,
            padding: "12px 20px",
          }}
        >
          <Flex justify="space-between" align="center" w="100%">
            <Box>
              {showSelection && table.getSelectedRowModel().rows.length > 0 && (
                <Badge
                  variant="light"
                  color="blue"
                  leftSection={<Icons.Check size={12} />}
                >
                  {table.getSelectedRowModel().rows.length} selected
                </Badge>
              )}
            </Box>

            <Flex align="center" gap="lg">
              <Group gap={4}>
                <Tooltip label="First page">
                  <ActionIcon
                    onClick={() => table.setPageIndex(0)}
                    disabled={!table.getCanPreviousPage()}
                    variant="default"
                    size="sm"
                  >
                    <Icons.ChevronsLeft size={14} />
                  </ActionIcon>
                </Tooltip>
                <Tooltip label="Previous page">
                  <ActionIcon
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                    variant="default"
                    size="sm"
                  >
                    <Icons.ChevronLeft size={14} />
                  </ActionIcon>
                </Tooltip>

                <Text
                  size="sm"
                  fw={500}
                  px="sm"
                  style={{ minWidth: 60, textAlign: "center" }}
                >
                  {table.getState().pagination.pageIndex + 1} /{" "}
                  {table.getPageCount()}
                </Text>

                <Tooltip label="Next page">
                  <ActionIcon
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                    variant="default"
                    size="sm"
                  >
                    <Icons.ChevronRight size={14} />
                  </ActionIcon>
                </Tooltip>
                <Tooltip label="Last page">
                  <ActionIcon
                    onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                    disabled={!table.getCanNextPage()}
                    variant="default"
                    size="sm"
                  >
                    <Icons.ChevronsRight size={14} />
                  </ActionIcon>
                </Tooltip>
              </Group>

              <Group gap="xs" align="center">
                <Select
                  value={String(table.getState().pagination.pageSize)}
                  onChange={(value) => {
                    table.setPageSize(Number(value!));
                  }}
                  data={[
                    { label: "10", value: "10" },
                    { label: "20", value: "20" },
                    { label: "50", value: "50" },
                    { label: "100", value: "100" },
                  ]}
                  size="xs"
                  w={70}
                  styles={{
                    input: {
                      "&:focus": {
                        borderColor: theme.colors.blue[6],
                      },
                      backgroundColor: isDark
                        ? theme.colors.dark?.[7] || theme.colors.gray[8]
                        : theme.white,
                      border: `1px solid ${isDark ? theme.colors.dark?.[4] || theme.colors.gray[6] : theme.colors.gray[3]}`,
                    },
                  }}
                />
                <Text size="sm" c="dimmed">
                  / page
                </Text>
              </Group>

              <Text size="sm" c="dimmed">
                {table.getFilteredRowModel().rows.length === 0
                  ? "No results"
                  : `Showing ${Math.min(table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1, table.getFilteredRowModel().rows.length)}-${Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, table.getFilteredRowModel().rows.length)} of ${table.getFilteredRowModel().rows.length} results`}
              </Text>
            </Flex>
          </Flex>
        </Box>
      )}
    </Paper>
  );
}
