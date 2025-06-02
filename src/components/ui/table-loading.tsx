import {
  Box,
  Group,
  Paper,
  Skeleton,
  Stack,
  Table,
  Text,
  Title,
} from "@mantine/core";

import { Icons } from "../icons";

interface TableLoadingProps {
  title?: string;
  rows?: number;
  columns?: number;
  withHeader?: boolean;
  withSearch?: boolean;
  withPagination?: boolean;
  withActions?: boolean;
  fullWidth?: boolean;
  noData?: boolean;
  noDataMessage?: string;
  emptyIcon?: React.ReactNode;
}

/**
 * Table loading skeleton for standardized user experience
 *
 * This component renders a skeleton loading state for tables
 * with configurable options for different table features
 */
export function TableLoading({
  title = "Loading data...",
  rows = 5,
  columns = 5,
  withHeader = true,
  withSearch = true,
  withPagination = true,
  withActions = true,
  fullWidth = true,
  noData = false,
  noDataMessage = "No data found",
  emptyIcon = <Icons.InfoCircle size={48} stroke={1.5} />,
}: TableLoadingProps) {
  // Show empty state if specified
  if (noData) {
    return (
      <Paper withBorder p="xl">
        {title && (
          <Title order={3} mb="md">
            {title}
          </Title>
        )}
        <Paper withBorder p="xl">
          <Stack align="center" gap="md">
            {emptyIcon}
            <Text size="lg" fw={500}>
              {noDataMessage}
            </Text>
          </Stack>
        </Paper>
      </Paper>
    );
  }

  // Handle loading state
  return (
    <Paper withBorder p="md" w={fullWidth ? "100%" : "auto"}>
      {/* Header area */}
      {title && (
        <Group justify="space-between" mb="md">
          <Title order={3}>{title}</Title>
          {withSearch && <Skeleton height={36} width={240} radius="md" />}
        </Group>
      )}

      {/* Table skeleton */}
      <Table striped withTableBorder mb="md">
        {withHeader && (
          <Table.Thead>
            <Table.Tr>
              {Array.from({ length: columns }).map((_, i) => (
                <Table.Th key={`header-${i}`}>
                  <Group justify="space-between" wrap="nowrap">
                    <Skeleton height={20} width="80%" />
                    <Skeleton height={16} width={16} radius="xl" />
                  </Group>
                </Table.Th>
              ))}
              {withActions && (
                <Table.Th style={{ width: 80 }}>
                  <Skeleton height={20} width="60%" />
                </Table.Th>
              )}
            </Table.Tr>
          </Table.Thead>
        )}
        <Table.Tbody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <Table.Tr key={`row-${rowIndex}`}>
              {Array.from({ length: columns }).map((_, cellIndex) => (
                <Table.Td key={`cell-${rowIndex}-${cellIndex}`}>
                  {cellIndex === 0 ? (
                    <Box>
                      <Skeleton height={18} width="70%" mb={4} />
                      <Skeleton height={12} width="40%" />
                    </Box>
                  ) : cellIndex === columns - 1 && !withActions ? (
                    <Skeleton height={24} width="70%" radius="xl" />
                  ) : (
                    <Skeleton
                      height={20}
                      width={["75%", "60%", "80%", "50%", "70%"][cellIndex % 5] as string}
                    />
                  )}
                </Table.Td>
              ))}
              {withActions && (
                <Table.Td>
                  <Group gap={4} justify="flex-end" wrap="nowrap">
                    <Skeleton height={28} width={28} radius="xl" />
                    <Skeleton height={28} width={28} radius="xl" />
                  </Group>
                </Table.Td>
              )}
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>

      {/* Pagination area */}
      {withPagination && (
        <Group justify="space-between" align="center">
          <Group gap="xs">
            <Skeleton height={20} width={120} />
            <Skeleton height={36} width={120} radius="xl" />
          </Group>
          <Skeleton height={36} width={200} radius="xl" />
        </Group>
      )}
    </Paper>
  );
}
