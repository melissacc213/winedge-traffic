import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Tooltip } from '@mantine/core';

export type Direction = 
  | 'northToSouth'
  | 'southToNorth'
  | 'eastToWest'
  | 'westToEast'
  | 'northEastToSouthWest'
  | 'southWestToNorthEast'
  | 'northWestToSouthEast'
  | 'southEastToNorthWest';

interface DirectionIconProps {
  direction: Direction;
  size?: number;
  showLabel?: boolean;
  color?: string;
}

export function DirectionIcon({ 
  direction, 
  size = 32, 
  showLabel = false,
  color = 'currentColor'
}: DirectionIconProps) {
  const { t } = useTranslation(['recipes']);
  
  const svgContent = useMemo(() => {
    const commonProps = {
      width: size,
      height: size,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: color,
      strokeWidth: 2,
      strokeLinecap: "round",
      strokeLinejoin: "round"
    };

    const renderArrow = (path: string) => (
      <svg {...commonProps}>
        <path d={path} />
      </svg>
    );

    switch (direction) {
      case 'northToSouth':
        return renderArrow("M12 3v18 M12 21l-3-3 M12 21l3-3");
      case 'southToNorth':
        return renderArrow("M12 21v-18 M12 3l-3 3 M12 3l3 3");
      case 'eastToWest':
        return renderArrow("M21 12h-18 M3 12l3-3 M3 12l3 3");
      case 'westToEast':
        return renderArrow("M3 12h18 M21 12l-3-3 M21 12l-3 3");
      case 'northEastToSouthWest':
        return renderArrow("M4 20L20 4 M4 20l3-3 M4 20l-1-4 M20 4l-3 3 M20 4l-4-1");
      case 'southWestToNorthEast':
        return renderArrow("M20 4L4 20 M20 4l-3 3 M20 4l-4-1 M4 20l3-3 M4 20l-1-4");
      case 'northWestToSouthEast':
        return renderArrow("M4 4L20 20 M20 20l-3-3 M20 20l-1-4 M4 4l3 3 M4 4l-1 4");
      case 'southEastToNorthWest':
        return renderArrow("M20 20L4 4 M4 4l3 3 M4 4l-1 4 M20 20l-3-3 M20 20l-1-4");
      default:
        return null;
    }
  }, [direction, size, color]);

  const label = t(`recipes:direction.${direction}`);

  if (showLabel) {
    return (
      <Box display="flex" alignItems="center" gap="xs">
        {svgContent}
        <span>{label}</span>
      </Box>
    );
  }

  return (
    <Tooltip label={label}>
      {svgContent}
    </Tooltip>
  );
}