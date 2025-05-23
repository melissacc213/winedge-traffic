import { Table, Box, Group } from "@mantine/core";
import { Skeleton } from "./skeleton";

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  withHeader?: boolean;
  height?: number | string;
  width?: number | string;
  cellHeight?: number;
  animate?: boolean;
  headerHeight?: number;
  columnWidths?: (string | number)[];
  withActions?: boolean;
}

export function TableSkeleton({
  rows = 5,
  columns = 4,
  withHeader = true,
  height = "auto",
  width = "100%",
  cellHeight = 36,
  headerHeight = 40,
  animate = true,
  columnWidths,
  withActions = true,
}: TableSkeletonProps) {
  // If column widths are not provided, create default array
  const colWidths =
    columnWidths || Array(columns).fill(`${Math.floor(100 / columns)}%`);

  // Add action column if specified
  const actualColumns = withActions ? columns + 1 : columns;
  const actualColWidths = withActions
    ? [...colWidths, 100] // Add fixed width for actions column
    : colWidths;

  return (
    <Box style={{ height, width, overflow: "hidden" }}>
      <Table striped withTableBorder withColumnBorders>
        {withHeader && (
          <Table.Thead>
            <Table.Tr>
              {Array.from({ length: actualColumns }).map((_, i) => (
                <Table.Th
                  key={`header-${i}`}
                  style={{ width: actualColWidths[i], height: headerHeight }}
                >
                  <Skeleton
                    height={24}
                    width={i === actualColumns - 1 && withActions ? 80 : "80%"}
                    animate={animate}
                  />
                </Table.Th>
              ))}
            </Table.Tr>
          </Table.Thead>
        )}
        <Table.Tbody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <Table.Tr key={`row-${rowIndex}`} style={{ height: cellHeight }}>
              {Array.from({ length: actualColumns }).map((_, cellIndex) => (
                <Table.Td key={`cell-${rowIndex}-${cellIndex}`}>
                  {cellIndex === actualColumns - 1 && withActions ? (
                    <Group gap="xs">
                      <Skeleton
                        height={28}
                        width={28}
                        radius="md"
                        animate={animate}
                      />
                      <Skeleton
                        height={28}
                        width={28}
                        radius="md"
                        animate={animate}
                      />
                    </Group>
                  ) : (
                    <Skeleton
                      height={20}
                      width={["90%", "70%", "85%", "60%", "80%"][cellIndex % 5]}
                      animate={animate}
                    />
                  )}
                </Table.Td>
              ))}
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Box>
  );
}

export function TableSkeleton2({
  rows = 5,
  columns = 4,
  height = "auto",
  animate = true,
}: TableSkeletonProps) {
  return (
    <Box p="md" style={{ height, width: "100%" }}>
      <Skeleton height={50} width="40%" mb="lg" animate={animate} />

      <Box mb="md">
        <Group justify="space-between" mb="md">
          <Group>
            <Skeleton height={36} width={120} radius="md" animate={animate} />
            <Skeleton height={36} width={120} radius="md" animate={animate} />
          </Group>
          <Skeleton height={36} width={200} radius="md" animate={animate} />
        </Group>
      </Box>

      <TableSkeleton rows={rows} columns={columns} animate={animate} />
    </Box>
  );
}
