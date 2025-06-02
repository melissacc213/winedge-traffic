import {
  type MantineSpacing,
  Skeleton as MantineSkeleton,
  Stack,
} from "@mantine/core";
import type { CSSProperties } from "react";

type SkeletonProps = {
  height?: number | string;
  width?: number | string;
  radius?: number | string;
  mb?: number | string;
  mt?: number | string;
  mx?: number | string;
  my?: number | string;
  animate?: boolean;
  className?: string;
  style?: CSSProperties;
};

export function Skeleton({
  height = 20,
  width = "100%",
  radius = "sm",
  mb = 0,
  mt = 0,
  mx = 0,
  my = 0,
  animate = true,
  className,
  style,
}: SkeletonProps) {
  return (
    <MantineSkeleton
      height={height}
      width={width}
      radius={radius}
      mb={mb}
      mt={mt}
      mx={mx}
      my={my}
      animate={animate}
      className={className}
      style={style}
    />
  );
}

interface TextSkeletonProps {
  lines?: number;
  width?: number | string | (number | string)[];
  gap?: MantineSpacing;
  animate?: boolean;
  height?: number;
}

export function TextSkeleton({
  lines = 3,
  width = ["100%", "90%", "80%"],
  gap = "xs",
  animate = true,
  height = 14,
}: TextSkeletonProps) {
  const widthArray = Array.isArray(width) ? width : Array(lines).fill(width);

  return (
    <Stack gap={gap}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          height={height}
          width={widthArray[index % widthArray.length]}
          animate={animate}
        />
      ))}
    </Stack>
  );
}

