import {
  Skeleton as MantineSkeleton,
  Stack,
  type MantineSpacing,
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

// interface CardSkeletonProps {
//   height?: number | string;
//   width?: number | string;
//   withHeader?: boolean;
//   withFooter?: boolean;
//   contentLines?: number;
//   animate?: boolean;
// }

// export function CardSkeleton({
//   height = 180,
//   width = '100%',
//   withHeader = true,
//   withFooter = false,
//   contentLines = 3,
//   animate = true,
// }: CardSkeletonProps) {
//   return (
//     <Box
//       style={{
//         height,
//         width,
//         padding: 16,
//         border: '1px solid var(--mantine-color-gray-3)',
//         borderRadius: 'var(--mantine-radius-md)',
//       }}
//     >
//       {withHeader && (
//         <Box mb="md">
//           <Group justify="space-between"mb="xs">
//             <Skeleton height={24} width={150} animate={animate} />
//             <Skeleton height={22} width={40} animate={animate} />
//           </Group>
//           <Skeleton height={2} width="100%" animate={animate} />
//         </Box>
//       )}

//       <TextSkeleton lines={contentLines} animate={animate} />

//       {withFooter && (
//         <Group justify="space-between"mt="md">
//           <Skeleton height={36} width={100} animate={animate} radius="md" />
//           <Skeleton height={36} width={100} animate={animate} radius="md" />
//         </Group>
//       )}
//     </Box>
//   );
// }
