import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Tooltip } from '@mantine/core';

type RoadType = 'straight' | 'tJunction' | 'crossroads';

interface RoadTypeIconProps {
  type: RoadType;
  size?: number;
  showLabel?: boolean;
}

export function RoadTypeIcon({ type, size = 32, showLabel = false }: RoadTypeIconProps) {
  const { t } = useTranslation(['recipes']);
  
  const svgContent = useMemo(() => {
    const commonProps = {
      width: size,
      height: size,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: 2,
      strokeLinecap: "round" as const,
      strokeLinejoin: "round" as const
    };

    switch (type) {
      case 'straight':
        return (
          <svg {...commonProps}>
            {/* Straight Road - simple vertical line with horizontal markers */}
            <path d="M12 3v18" />
            <path d="M8 6h8" />
            <path d="M8 18h8" />
          </svg>
        );
      case 'tJunction':
        return (
          <svg {...commonProps}>
            {/* T-Junction - T shaped road */}
            <path d="M12 3v10" />
            <path d="M3 13h18" />
            <path d="M8 16l-2 4" />
            <path d="M16 16l2 4" />
          </svg>
        );
      case 'crossroads':
        return (
          <svg {...commonProps}>
            {/* Crossroads - intersection of two roads */}
            <path d="M12 3v18" />
            <path d="M3 12h18" />
            <path d="M5 5l2 2" />
            <path d="M19 5l-2 2" />
            <path d="M5 19l2-2" />
            <path d="M19 19l-2-2" />
          </svg>
        );
      default:
        return null;
    }
  }, [type, size]);

  const label = t(`recipes:roadType.${type}`);

  if (showLabel) {
    return (
      <Box style={{ display: 'flex', alignItems: 'center', gap: 'var(--mantine-spacing-xs)' }}>
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

// Component to display all road types in a row
export function RoadTypeSelector({ 
  value, 
  onChange, 
  size = 32 
}: { 
  value: RoadType; 
  onChange: (type: RoadType) => void; 
  size?: number;
}) {
  const { t } = useTranslation(['recipes']);
  const roadTypes: RoadType[] = ['straight', 'tJunction', 'crossroads'];

  return (
    <Box style={{ display: 'flex', gap: 'var(--mantine-spacing-md)' }}>
      {roadTypes.map(type => (
        <Box 
          key={type}
          onClick={() => onChange(type)}
          style={{
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '4px',
            border: `2px solid ${value === type ? 'var(--mantine-color-blue-6)' : 'transparent'}`,
            backgroundColor: value === type ? 'var(--mantine-color-blue-0)' : 'transparent',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            if (value !== type) {
              e.currentTarget.style.backgroundColor = 'var(--mantine-color-gray-0)';
            }
          }}
          onMouseLeave={(e) => {
            if (value !== type) {
              e.currentTarget.style.backgroundColor = 'transparent';
            }
          }}
        >
          <Tooltip label={t(`recipes:roadType.${type}`)}>
            <div>
              <RoadTypeIcon type={type} size={size} />
            </div>
          </Tooltip>
        </Box>
      ))}
    </Box>
  );
}