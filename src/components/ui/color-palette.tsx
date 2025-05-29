import { Box, Group, Tooltip, UnstyledButton, useMantineTheme } from '@mantine/core';
import { useTheme } from '@/providers/theme-provider';
import { Icons } from '@/components/icons';

interface ColorPaletteProps {
  value: string;
  onChange: (color: string) => void;
  label?: string;
  disabled?: boolean;
}

export function ColorPalette({ value, onChange, label, disabled = false }: ColorPaletteProps) {
  const { colorScheme, theme } = useTheme();
  const mantineTheme = useMantineTheme();
  const isDark = colorScheme === 'dark';

  // Predefined color swatches for labels - using theme colors
  const colorSwatches = [
    // Primary colors
    { name: 'Blue', value: mantineTheme.colors.blue[5] },
    { name: 'Red', value: mantineTheme.colors.red[5] },
    { name: 'Green', value: mantineTheme.colors.green[5] },
    { name: 'Yellow', value: mantineTheme.colors.yellow[5] },
    { name: 'Indigo', value: mantineTheme.colors.indigo[5] },
    { name: 'Teal', value: mantineTheme.colors.teal[5] },
    { name: 'Orange', value: mantineTheme.colors.orange[5] },
    { name: 'Cyan', value: mantineTheme.colors.cyan[5] },
    
    // Second row
    { name: 'Pink', value: mantineTheme.colors.pink[5] },
    { name: 'Lime', value: mantineTheme.colors.lime[5] },
    { name: 'Violet', value: mantineTheme.colors.violet[5] },
    { name: 'Grape', value: mantineTheme.colors.grape[5] },
    { name: 'Dark Blue', value: mantineTheme.colors.blue[7] },
    { name: 'Dark Red', value: mantineTheme.colors.red[7] },
    { name: 'Dark Green', value: mantineTheme.colors.green[7] },
    { name: 'Dark Yellow', value: mantineTheme.colors.yellow[7] },
    
    // Third row - light variants
    { name: 'Light Blue', value: mantineTheme.colors.blue[3] },
    { name: 'Light Red', value: mantineTheme.colors.red[3] },
    { name: 'Light Green', value: mantineTheme.colors.green[3] },
    { name: 'Light Yellow', value: mantineTheme.colors.yellow[3] },
    { name: 'Light Indigo', value: mantineTheme.colors.indigo[3] },
    { name: 'Light Teal', value: mantineTheme.colors.teal[3] },
    { name: 'Light Orange', value: mantineTheme.colors.orange[3] },
    { name: 'Light Cyan', value: mantineTheme.colors.cyan[3] },
  ];

  return (
    <Box>
      {label && (
        <Group gap={4} mb={8}>
          <Box
            component="span"
            style={{
              fontSize: mantineTheme.fontSizes.sm,
              fontWeight: 500,
              color: isDark ? theme.colors.gray[5] : theme.colors.gray[7],
            }}
          >
            {label}
          </Box>
        </Group>
      )}
      
      <Box
        style={{
          padding: mantineTheme.spacing.sm,
          backgroundColor: isDark ? theme.colors.dark[6] : theme.colors.gray[0],
          borderRadius: mantineTheme.radius.md,
          border: `1px solid ${isDark ? theme.colors.dark[4] : theme.colors.gray[3]}`,
        }}
      >
        <Group gap={8}>
          {colorSwatches.map((swatch) => (
            <Tooltip key={swatch.value} label={swatch.name} position="top">
              <UnstyledButton
                onClick={() => !disabled && onChange(swatch.value)}
                disabled={disabled}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: mantineTheme.radius.sm,
                  backgroundColor: swatch.value,
                  border: `2px solid ${
                    value === swatch.value
                      ? isDark ? theme.white : theme.black
                      : isDark ? theme.colors.dark[4] : theme.colors.gray[3]
                  }`,
                  boxShadow: value === swatch.value ? theme.other.shadows.md : 'none',
                  position: 'relative',
                  cursor: disabled ? 'not-allowed' : 'pointer',
                  opacity: disabled ? 0.5 : 1,
                  transition: 'all 0.2s ease',
                  '&:hover': !disabled ? {
                    transform: 'scale(1.1)',
                    boxShadow: theme.other.shadows.sm,
                  } : {},
                }}
              >
                {value === swatch.value && (
                  <Box
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      color: theme.white,
                      filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))',
                    }}
                  >
                    <Icons.Check size={16} />
                  </Box>
                )}
              </UnstyledButton>
            </Tooltip>
          ))}
        </Group>
      </Box>
    </Box>
  );
}