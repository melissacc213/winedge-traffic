import { Box, Card, Grid, Stack } from "@mantine/core";
import type { BoxProps } from "@mantine/core";
import { Skeleton, TextSkeleton } from "./skeleton";

export interface CardSkeletonProps extends BoxProps {
  withHeader?: boolean;
  withFooter?: boolean;
  minHeight?: number | string;
  headerHeight?: number;
  footerHeight?: number;
  withBorder?: boolean;
}

/**
 * Skeleton loader for card components
 */
export function CardSkeleton({
  withHeader = true,
  withFooter = false,
  minHeight = 150,
  headerHeight = 30,
  footerHeight = 50,
  withBorder = true,
  ...props
}: CardSkeletonProps) {
  return (
    <Card withBorder={withBorder} {...props} padding="md">
      {withHeader && (
        <Box mb="md">
          <Skeleton height={headerHeight} width="50%" mb={10} />
          <Skeleton height={headerHeight / 2} width="80%" />
        </Box>
      )}

      <Box style={{ minHeight }}>
        <TextSkeleton lines={3} />
      </Box>

      {withFooter && (
        <Box mt="md">
          <Skeleton height={footerHeight} width="100%" />
        </Box>
      )}
    </Card>
  );
}

/**
 * Skeleton loader for info cards grid layout
 */
export function InfoCardGridSkeleton({
  cards = 3,
  columns = 12,
  columnSizes = { base: 12, md: 4 },
  ...props
}: {
  cards?: number;
  columns?: number;
  columnSizes?: Record<string, number>;
} & BoxProps) {
  const span = 12 / columns; // assuming a 12-column grid system
  const computedSizes = columnSizes ?? { base: 12, md: span };

  return (
    <Grid {...props}>
      {Array(cards)
        .fill(0)
        .map((_, i) => (
          <Grid.Col key={i} span={computedSizes}>
            <CardSkeleton />
          </Grid.Col>
        ))}
    </Grid>
  );
}

/**
 * Skeleton loader for stacked cards
 */
export function StackedCardSkeleton({
  cards = 3,
  spacing = "md",
  ...props
}: {
  cards?: number;
  spacing?: string | number;
} & BoxProps) {
  return (
    <Stack gap={spacing} {...props}>
      {Array(cards)
        .fill(0)
        .map((_, i) => (
          <CardSkeleton key={i} />
        ))}
    </Stack>
  );
}
