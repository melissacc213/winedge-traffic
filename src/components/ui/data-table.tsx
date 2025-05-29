import { useState, ReactNode } from "react";
import {
  Box,
  Table,
  ScrollArea,
  Group,
  Text,
  Select,
  Pagination,
  Paper,
  Skeleton,
} from "@mantine/core";
import { useTheme } from "@/providers/theme-provider";

interface DataTableProps<T> {
  data: T[];
  columns: {
    key: string;
    label: string;
    width?: number | string;
    render?: (item: T) => ReactNode;
  }[];
  loading?: boolean;
  pageSize?: number;
  onRowClick?: (item: T) => void;
  selectedRowId?: string | number;
  getRowId?: (item: T) => string | number;
  stickyHeader?: boolean;
  height?: number;
  showPagination?: boolean;
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
  height = 500,
  showPagination = true,
}: DataTableProps<T>) {
  const { theme, colorScheme } = useTheme();
  const isDark = colorScheme === "dark";
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  // Calculate pagination
  const totalPages = Math.ceil(data.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = showPagination ? data.slice(startIndex, endIndex) : data;

  // Reset page when data changes
  if (currentPage > totalPages && totalPages > 0) {
    setCurrentPage(1);
  }

  const headerBg = isDark ? theme.colors.dark[7] : theme.colors.gray[0];
  const rowHoverBg = isDark ? theme.colors.dark[6] : theme.colors.gray[1];
  const selectedBg = isDark ? theme.colors.blue[9] : theme.colors.blue[0];

  if (loading) {
    return (
      <Paper withBorder radius="md" style={{ height: height + 60 }}>
        <Box p="md">
          <Skeleton height={40} mb="md" />
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} height={60} mb="sm" />
          ))}
        </Box>
      </Paper>
    );
  }

  return (
    <Paper withBorder radius="md">
      <Box style={{ position: "relative", height: showPagination ? height + 60 : height }}>
        <ScrollArea h={height} offsetScrollbars>
          <Table
            verticalSpacing="sm"
            highlightOnHover
            stickyHeader={stickyHeader}
            striped
            withTableBorder
            style={{ minWidth: "100%" }}
          >
            <Table.Thead style={{ backgroundColor: headerBg }}>
              <Table.Tr>
                {columns.map((column) => (
                  <Table.Th
                    key={column.key}
                    style={{
                      width: column.width,
                      position: stickyHeader ? "sticky" : undefined,
                      top: stickyHeader ? 0 : undefined,
                      backgroundColor: headerBg,
                      zIndex: stickyHeader ? 10 : undefined,
                    }}
                  >
                    {column.label}
                  </Table.Th>
                ))}
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {paginatedData.length === 0 ? (
                <Table.Tr>
                  <Table.Td colSpan={columns.length} style={{ textAlign: "center", padding: "40px" }}>
                    <Text c="dimmed">No data available</Text>
                  </Table.Td>
                </Table.Tr>
              ) : (
                paginatedData.map((item) => {
                  const rowId = getRowId(item);
                  const isSelected = selectedRowId === rowId;

                  return (
                    <Table.Tr
                      key={rowId}
                      onClick={() => onRowClick?.(item)}
                      style={{
                        cursor: onRowClick ? "pointer" : undefined,
                        backgroundColor: isSelected ? selectedBg : undefined,
                        transition: "background-color 200ms ease",
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected && onRowClick) {
                          e.currentTarget.style.backgroundColor = rowHoverBg;
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.backgroundColor = "";
                        }
                      }}
                    >
                      {columns.map((column) => (
                        <Table.Td key={column.key}>
                          {column.render ? column.render(item) : item[column.key]}
                        </Table.Td>
                      ))}
                    </Table.Tr>
                  );
                })
              )}
            </Table.Tbody>
          </Table>
        </ScrollArea>
      </Box>

      {showPagination && data.length > 0 && (
        <Box
          p="md"
          style={{
            borderTop: `1px solid ${isDark ? theme.colors.dark[5] : theme.colors.gray[2]}`,
            backgroundColor: isDark ? theme.colors.dark[8] : theme.white,
          }}
        >
          <Group justify="space-between">
            <Group gap="xs">
              <Text size="sm">
                Showing {Math.min(startIndex + 1, data.length)} -{" "}
                {Math.min(endIndex, data.length)} of {data.length}
              </Text>
              <Select
                size="xs"
                value={String(pageSize)}
                onChange={(value) => {
                  setPageSize(Number(value));
                  setCurrentPage(1);
                }}
                data={["5", "10", "20", "30", "40", "50"].map((size) => ({
                  value: size,
                  label: `${size} per page`,
                }))}
                w={110}
                radius="xl"
              />
            </Group>
            <Pagination
              total={totalPages}
              value={currentPage}
              onChange={setCurrentPage}
              color="blue"
              size="sm"
              radius="xl"
              withEdges
            />
          </Group>
        </Box>
      )}
    </Paper>
  );
}