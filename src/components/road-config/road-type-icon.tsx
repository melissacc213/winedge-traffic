import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Box, Tooltip } from "@mantine/core";

export type RoadType = "straight" | "tJunction" | "crossroads";

interface RoadTypeIconProps {
  type: RoadType;
  size?: number;
  showLabel?: boolean;
  color?: string;
}

export function RoadTypeIcon({
  type,
  size = 32,
  showLabel = false,
  color = "currentColor",
}: RoadTypeIconProps) {
  const { t } = useTranslation(["recipes"]);

  const svgContent = useMemo(() => {
    const svgProps = {
      width: size,
      height: size,
      viewBox: "0 0 100 100",
      style: { color },
    };

    switch (type) {
      case "straight":
        return (
          <svg {...svgProps}>
            {/* Straight horizontal road */}
            <line
              x1="8"
              y1="40"
              x2="92"
              y2="40"
              stroke="black"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <line
              x1="8"
              y1="60"
              x2="92"
              y2="60"
              stroke="black"
              strokeWidth="2"
              strokeLinecap="round"
            />

            {/* Labels */}
            <text
              x="30"
              y="54"
              fontFamily="Arial, sans-serif"
              fontSize="12"
              fontWeight="bold"
              textAnchor="middle"
              fill="black"
            >
              A
            </text>
            <text
              x="70"
              y="54"
              fontFamily="Arial, sans-serif"
              fontSize="12"
              fontWeight="bold"
              textAnchor="middle"
              fill="black"
            >
              B
            </text>
          </svg>
        );
      case "tJunction":
        return (
          <svg {...svgProps}>
            {/* Top vertical road (A) */}
            <line
              x1="40"
              y1="8"
              x2="40"
              y2="40"
              stroke="black"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <line
              x1="60"
              y1="8"
              x2="60"
              y2="40"
              stroke="black"
              strokeWidth="2"
              strokeLinecap="round"
            />

            {/* Left horizontal road (C) - top line only */}
            <line
              x1="8"
              y1="40"
              x2="40"
              y2="40"
              stroke="black"
              strokeWidth="2"
              strokeLinecap="round"
            />

            {/* Right horizontal road (B) - top line only */}
            <line
              x1="60"
              y1="40"
              x2="92"
              y2="40"
              stroke="black"
              strokeWidth="2"
              strokeLinecap="round"
            />

            {/* Connected bottom horizontal line */}
            <line
              x1="8"
              y1="60"
              x2="92"
              y2="60"
              stroke="black"
              strokeWidth="2"
              strokeLinecap="round"
            />

            {/* Labels */}
            <text
              x="76"
              y="54"
              fontFamily="Arial, sans-serif"
              fontSize="12"
              fontWeight="bold"
              textAnchor="middle"
              fill="black"
            >
              B
            </text>
            <text
              x="24"
              y="54"
              fontFamily="Arial, sans-serif"
              fontSize="12"
              fontWeight="bold"
              textAnchor="middle"
              fill="black"
            >
              C
            </text>
            <text
              x="50"
              y="28"
              fontFamily="Arial, sans-serif"
              fontSize="12"
              fontWeight="bold"
              textAnchor="middle"
              fill="black"
            >
              A
            </text>
          </svg>
        );
      case "crossroads":
        return (
          <svg {...svgProps}>
            {/* Top vertical road (D) */}
            <line
              x1="40"
              y1="8"
              x2="40"
              y2="40"
              stroke="black"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <line
              x1="60"
              y1="8"
              x2="60"
              y2="40"
              stroke="black"
              strokeWidth="2"
              strokeLinecap="round"
            />

            {/* Bottom vertical road (B) */}
            <line
              x1="40"
              y1="60"
              x2="40"
              y2="92"
              stroke="black"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <line
              x1="60"
              y1="60"
              x2="60"
              y2="92"
              stroke="black"
              strokeWidth="2"
              strokeLinecap="round"
            />

            {/* Left horizontal road (C) */}
            <line
              x1="8"
              y1="40"
              x2="40"
              y2="40"
              stroke="black"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <line
              x1="8"
              y1="60"
              x2="40"
              y2="60"
              stroke="black"
              strokeWidth="2"
              strokeLinecap="round"
            />

            {/* Right horizontal road (A) */}
            <line
              x1="60"
              y1="40"
              x2="92"
              y2="40"
              stroke="black"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <line
              x1="60"
              y1="60"
              x2="92"
              y2="60"
              stroke="black"
              strokeWidth="2"
              strokeLinecap="round"
            />

            {/* Labels */}
            <text
              x="76"
              y="54"
              fontFamily="Arial, sans-serif"
              fontSize="12"
              fontWeight="bold"
              textAnchor="middle"
              fill="black"
            >
              A
            </text>
            <text
              x="50"
              y="80"
              fontFamily="Arial, sans-serif"
              fontSize="12"
              fontWeight="bold"
              textAnchor="middle"
              fill="black"
            >
              B
            </text>
            <text
              x="24"
              y="54"
              fontFamily="Arial, sans-serif"
              fontSize="12"
              fontWeight="bold"
              textAnchor="middle"
              fill="black"
            >
              C
            </text>
            <text
              x="50"
              y="28"
              fontFamily="Arial, sans-serif"
              fontSize="12"
              fontWeight="bold"
              textAnchor="middle"
              fill="black"
            >
              D
            </text>
          </svg>
        );
      default:
        return null;
    }
  }, [type, size, color]);

  const label = t(`recipes:roadType.${type}`);

  if (showLabel) {
    return (
      <Box style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        {svgContent}
        <span>{label}</span>
      </Box>
    );
  }

  return (
    <Tooltip label={label}>
      <span>{svgContent}</span>
    </Tooltip>
  );
}
