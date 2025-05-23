import { Group, Box } from '@mantine/core';
import { Skeleton } from './skeleton';

interface PageHeaderSkeletonProps {
  withIcon?: boolean;
  withRightSection?: boolean;
  iconSize?: number;
  titleWidth?: number | string;
  descriptionWidth?: number | string;
  rightSectionWidth?: number | string;
  animate?: boolean;
}

export function PageHeaderSkeleton({
  withIcon = true,
  withRightSection = true,
  iconSize = 24,
  titleWidth = 200,
  descriptionWidth = 300,
  rightSectionWidth = 100,
  animate = true,
}: PageHeaderSkeletonProps) {
  return (
    <Group justify="space-between">
      <Group>
        {withIcon && (
          <Box style={{ width: iconSize, height: iconSize }}>
            <Skeleton width={iconSize} height={iconSize} radius="xl" animate={animate} />
          </Box>
        )}
        <div>
          <Skeleton height={28} width={titleWidth} mb={8} animate={animate} />
          <Skeleton height={16} width={descriptionWidth} animate={animate} />
        </div>
      </Group>
      {withRightSection && (
        <Box style={{ minWidth: rightSectionWidth }}>
          <Skeleton height={36} width={rightSectionWidth} radius="md" animate={animate} />
        </Box>
      )}
    </Group>
  );
}