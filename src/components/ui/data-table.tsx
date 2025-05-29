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
  ActionIcon,
  Menu,
  Checkbox,
  Stack,
  Badge,
  Transition,
} from "@mantine/core";
import { Icons } from "@/components/icons";
import { useTheme } from "@/providers/theme-provider";
import { useMantineTheme } from "@mantine/core";

export interface DataTableColumn<T> {
  key: string;
  label: string;
  width?: number | string;
  render?: (item: T) => ReactNode;
  sortable?: boolean;
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
  defaultSort?: { key: string; direction: 'asc' | 'desc' };
  actions?: (item: T) => ReactNode;
  emptyMessage?: string;
  showSelection?: boolean;
  selectedIds?: Set<string | number>;
  onSelectionChange?: (ids: Set<string | number>) => void;
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
  defaultSort,
  actions,
  emptyMessage = "No data available",
  showSelection = false,
  selectedIds = new Set(),
  onSelectionChange,
}: DataTableProps<T>) {
  const { theme, colorScheme } = useTheme();
  const mantineTheme = useMantineTheme();
  const isDark = colorScheme === "dark";
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(
    defaultSort || null
  );

  // Sort data
  const sortedData = [...data].sort((a, b) => {
    if (!sortConfig) return 0;
    
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];
    
    // Handle special sorting for default items
    if (sortConfig.key === 'is_default') {
      if (a.is_default && !b.is_default) return -1;
      if (!a.is_default && b.is_default) return 1;
      return 0;
    }
    
    if (aValue === null || aValue === undefined) return 1;
    if (bValue === null || bValue === undefined) return -1;
    
    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  // Move default items to top if they exist
  const finalData = sortedData.some(item => item.is_default !== undefined)
    ? [...sortedData.filter(item => item.is_default), ...sortedData.filter(item => !item.is_default)]
    : sortedData;

  // Pagination
  const totalPages = Math.ceil(finalData.length / pageSize);
  const paginatedData = showPagination
    ? finalData.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : finalData;

  const handleSort = (key: string) => {
    setSortConfig((prev) => {
      if (prev?.key === key) {
        return {
          key,
          direction: prev.direction === "asc" ? "desc" : "asc",
        };
      }
      return { key, direction: "asc" };
    });
  };

  const handleSelectAll = () => {
    if (onSelectionChange) {
      const pageIds = new Set(paginatedData.map(item => getRowId(item)));
      if (allPageSelected) {
        const newSelectedIds = new Set(selectedIds);
        pageIds.forEach(id => newSelectedIds.delete(id));
        onSelectionChange(newSelectedIds);
      } else {
        const newSelectedIds = new Set(selectedIds);
        pageIds.forEach(id => newSelectedIds.add(id));
        onSelectionChange(newSelectedIds);
      }
    }
  };

  const handleSelectRow = (id: string | number) => {
    if (onSelectionChange) {
      const newSelectedIds = new Set(selectedIds);
      if (newSelectedIds.has(id)) {
        newSelectedIds.delete(id);
      } else {
        newSelectedIds.add(id);
      }
      onSelectionChange(newSelectedIds);
    }
  };

  const pageItemIds = paginatedData.map(item => getRowId(item));
  const allPageSelected = pageItemIds.length > 0 && pageItemIds.every(id => selectedIds.has(id));
  const somePageSelected = pageItemIds.some(id => selectedIds.has(id)) && !allPageSelected;

  // Add actions column if actions prop is provided
  const allColumns = actions 
    ? [...columns, { key: '_actions', label: 'Actions', width: 80 }]
    : columns;

  if (loading) {
    return (
      <Paper 
        radius="lg" 
        style={{ 
          overflow: 'hidden',
          background: isDark ? theme.colors.dark[7] : theme.white,
          border: `1px solid ${isDark ? theme.colors.dark[5] : theme.colors.gray[2]}`,
        }}
      >
        <Stack gap={0}>
          {[...Array(5)].map((_, index) => (
            <Box
              key={index}
              px="md"
              py="sm"
              style={{
                borderBottom: `1px solid ${isDark ? theme.colors.dark[6] : theme.colors.gray[1]}`,
              }}
            >
              <Skeleton height={20} radius="sm" />
            </Box>
          ))}
        </Stack>
      </Paper>
    );
  }

  return (
    <Paper 
      radius="lg" 
      style={{ 
        overflow: 'hidden',
        background: isDark ? theme.colors.dark[7] : theme.white,
        border: `1px solid ${isDark ? theme.colors.dark[5] : theme.colors.gray[2]}`,
        boxShadow: isDark 
          ? '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2)' 
          : '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      }}
    >
      <Box>
        <ScrollArea h={height} offsetScrollbars type="hover">
          <Table
            verticalSpacing={0}
            stickyHeader={stickyHeader}
            style={{ minWidth: "100%" }}
            styles={{
              table: {
                borderCollapse: 'collapse',
                fontSize: '14px',
              },
              thead: {
                borderBottom: 'none',
              },
              tbody: {
                '& tr': {
                  borderBottom: `1px solid ${isDark ? theme.colors.dark[5] : theme.colors.gray[1]}`,
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                },
                '& tr:lastChild': {
                  borderBottom: 'none',
                },
                '& tr:hover': {
                  backgroundColor: isDark 
                    ? 'rgba(255, 255, 255, 0.03)' 
                    : theme.colors.gray[0],
                  transform: 'translateY(-1px)',
                  boxShadow: isDark
                    ? '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)'
                    : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                },
              },
            }}
          >
            <Table.Thead>
              <Table.Tr>
                {showSelection && (
                  <Table.Th
                    style={{
                      width: 48,
                      position: stickyHeader ? "sticky" : undefined,
                      top: stickyHeader ? 0 : undefined,
                      background: isDark 
                        ? `linear-gradient(to bottom, ${theme.colors.dark[6]}, ${theme.colors.dark[7]})` 
                        : `linear-gradient(to bottom, ${theme.colors.gray[0]}, ${theme.colors.gray[1]})`,
                      zIndex: stickyHeader ? 10 : undefined,
                      padding: '16px 16px 16px 24px',
                      borderBottom: `2px solid ${isDark ? theme.colors.dark[4] : theme.colors.gray[3]}`,
                    }}
                  >
                    <Checkbox
                      checked={allPageSelected}
                      indeterminate={somePageSelected}
                      onChange={handleSelectAll}
                      styles={{ 
                        input: { 
                          cursor: "pointer",
                          border: `1.5px solid ${isDark ? theme.colors.dark[3] : theme.colors.gray[4]}`,
                          '&:checked': {
                            backgroundColor: theme.colors.blue[6],
                            borderColor: theme.colors.blue[6],
                          }
                        } 
                      }}
                    />
                  </Table.Th>
                )}
                {allColumns.map((column) => (
                  <Table.Th
                    key={column.key}
                    style={{
                      width: column.width,
                      position: stickyHeader ? "sticky" : undefined,
                      top: stickyHeader ? 0 : undefined,
                      background: isDark 
                        ? `linear-gradient(to bottom, ${theme.colors.dark[6]}, ${theme.colors.dark[7]})` 
                        : `linear-gradient(to bottom, ${theme.colors.gray[0]}, ${theme.colors.gray[1]})`,
                      zIndex: stickyHeader ? 10 : undefined,
                      cursor: column.sortable !== false && column.key !== '_actions' ? "pointer" : "default",
                      userSelect: "none",
                      padding: '16px 24px',
                      borderBottom: `2px solid ${isDark ? theme.colors.dark[4] : theme.colors.gray[3]}`,
                      fontWeight: 600,
                      transition: 'all 0.2s ease',
                      '&:hover': column.sortable !== false && column.key !== '_actions' ? {
                        backgroundColor: isDark ? theme.colors.dark[5] : theme.colors.gray[2],
                      } : undefined,
                    }}
                    onClick={() => column.sortable !== false && column.key !== '_actions' && handleSort(column.key)}
                  >
                    <Group gap={8} justify="apart" wrap="nowrap" align="center">
                      <Text 
                        size="xs" 
                        fw={600}
                        tt="uppercase"
                        style={{ 
                          letterSpacing: '0.05em',
                          fontSize: '11px',
                          lineHeight: '16px',
                          background: isDark 
                            ? `linear-gradient(135deg, ${theme.colors.gray[3]}, ${theme.colors.gray[5]})` 
                            : `linear-gradient(135deg, ${theme.colors.gray[7]}, ${theme.colors.gray[9]})`,
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          backgroundClip: 'text',
                        }}
                      >
                        {column.label}
                      </Text>
                      {column.sortable !== false && column.key !== '_actions' && (
                        <Box style={{ 
                          display: 'flex', 
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 2,
                        }}>
                          <Icons.ChevronUp 
                            size={10} 
                            style={{ 
                              opacity: sortConfig?.key === column.key && sortConfig.direction === 'asc' ? 1 : 0.3,
                              color: sortConfig?.key === column.key && sortConfig.direction === 'asc' 
                                ? theme.colors.blue[6] 
                                : isDark ? theme.colors.gray[6] : theme.colors.gray[5],
                              transition: 'all 0.2s ease',
                            }} 
                          />
                          <Icons.ChevronDown 
                            size={10} 
                            style={{ 
                              opacity: sortConfig?.key === column.key && sortConfig.direction === 'desc' ? 1 : 0.3,
                              color: sortConfig?.key === column.key && sortConfig.direction === 'desc' 
                                ? theme.colors.blue[6] 
                                : isDark ? theme.colors.gray[6] : theme.colors.gray[5],
                              transition: 'all 0.2s ease',
                            }} 
                          />
                        </Box>
                      )}
                    </Group>
                  </Table.Th>
                ))}
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {paginatedData.length === 0 ? (
                <Table.Tr>
                  <Table.Td 
                    colSpan={allColumns.length + (showSelection ? 1 : 0)} 
                    style={{ 
                      textAlign: "center", 
                      padding: "60px 20px",
                      color: isDark ? theme.colors.gray[5] : theme.colors.gray[6],
                    }}
                  >
                    <Stack align="center" gap="sm">
                      <Icons.Database size={48} style={{ opacity: 0.3 }} />
                      <Text size="lg" fw={500}>
                        {emptyMessage}
                      </Text>
                    </Stack>
                  </Table.Td>
                </Table.Tr>
              ) : (
                paginatedData.map((item, index) => {
                  const rowId = getRowId(item);
                  const isSelected = selectedRowId === rowId || selectedIds.has(rowId);
                  
                  return (
                    <Transition
                      key={rowId}
                      mounted={true}
                      transition="fade"
                      duration={200}
                      timingFunction="ease"
                      enterDelay={index * 30}
                    >
                      {(styles) => (
                        <Table.Tr
                          onClick={() => onRowClick?.(item)}
                          style={{
                            ...styles,
                            cursor: onRowClick ? "pointer" : "default",
                            backgroundColor: isSelected 
                              ? isDark 
                                ? 'rgba(59, 130, 246, 0.1)' 
                                : 'rgba(59, 130, 246, 0.05)'
                              : undefined,
                            position: 'relative',
                          }}
                        >
                          {isSelected && (
                            <Box
                              style={{
                                position: 'absolute',
                                left: 0,
                                top: 0,
                                bottom: 0,
                                width: 3,
                                backgroundColor: theme.colors.blue[6],
                              }}
                            />
                          )}
                          {showSelection && (
                            <Table.Td
                              onClick={(e) => e.stopPropagation()}
                              style={{ 
                                padding: '12px 16px 12px 24px',
                                width: 48,
                              }}
                            >
                              <Checkbox
                                checked={selectedIds.has(rowId)}
                                onChange={() => handleSelectRow(rowId)}
                                styles={{ 
                                  input: { 
                                    cursor: "pointer",
                                    border: `1.5px solid ${isDark ? theme.colors.dark[3] : theme.colors.gray[4]}`,
                                    '&:checked': {
                                      backgroundColor: theme.colors.blue[6],
                                      borderColor: theme.colors.blue[6],
                                    }
                                  } 
                                }}
                              />
                            </Table.Td>
                          )}
                          {columns.map((column) => (
                            <Table.Td
                              key={column.key}
                              style={{ 
                                padding: '16px 24px',
                                fontSize: '14px',
                                color: isDark ? theme.colors.gray[3] : theme.colors.gray[7],
                              }}
                            >
                              {column.render ? column.render(item) : item[column.key]}
                            </Table.Td>
                          ))}
                          {actions && (
                            <Table.Td
                              onClick={(e) => e.stopPropagation()}
                              style={{ 
                                padding: '12px 16px',
                                width: 80,
                              }}
                            >
                              {actions(item)}
                            </Table.Td>
                          )}
                        </Table.Tr>
                      )}
                    </Transition>
                  );
                })
              )}
            </Table.Tbody>
          </Table>
        </ScrollArea>

        {showPagination && totalPages > 1 && (
          <Box
            style={{
              borderTop: `1px solid ${isDark ? theme.colors.dark[5] : theme.colors.gray[2]}`,
              background: isDark ? theme.colors.dark[6] : theme.colors.gray[0],
              padding: '12px 24px',
            }}
          >
            <Group justify="space-between" align="center">
              <Group gap="xs">
                <Text size="sm" c="dimmed">
                  Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, data.length)} of {data.length} entries
                </Text>
                {showSelection && selectedIds.size > 0 && (
                  <Badge 
                    variant="light" 
                    color="blue"
                    leftSection={<Icons.Check size={12} />}
                  >
                    {selectedIds.size} selected
                  </Badge>
                )}
              </Group>
              
              <Group gap="md">
                <Select
                  value={String(pageSize)}
                  onChange={(value) => {
                    setPageSize(Number(value));
                    setCurrentPage(1);
                  }}
                  data={[
                    { value: "10", label: "10 / page" },
                    { value: "20", label: "20 / page" },
                    { value: "50", label: "50 / page" },
                    { value: "100", label: "100 / page" },
                  ]}
                  size="xs"
                  w={100}
                  styles={{
                    input: {
                      backgroundColor: isDark ? theme.colors.dark[7] : theme.white,
                      border: `1px solid ${isDark ? theme.colors.dark[4] : theme.colors.gray[3]}`,
                      '&:focus': {
                        borderColor: theme.colors.blue[6],
                      }
                    }
                  }}
                />
                
                <Pagination
                  value={currentPage}
                  onChange={setCurrentPage}
                  total={totalPages}
                  size="sm"
                  radius="md"
                  withEdges
                  styles={{
                    control: {
                      backgroundColor: isDark ? theme.colors.dark[7] : theme.white,
                      border: `1px solid ${isDark ? theme.colors.dark[4] : theme.colors.gray[3]}`,
                      '&[data-active="true"]': {
                        backgroundColor: theme.colors.blue[6],
                        borderColor: theme.colors.blue[6],
                        color: theme.white,
                      },
                      '&:hover': {
                        backgroundColor: isDark ? theme.colors.dark[5] : theme.colors.gray[1],
                      }
                    }
                  }}
                />
              </Group>
            </Group>
          </Box>
        )}
      </Box>
    </Paper>
  );
}