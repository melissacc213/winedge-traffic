import { Box, Text, UnstyledButton, useMantineTheme } from '@mantine/core';
import { useTheme } from '@/providers/theme-provider';
import { Icons } from '@/components/icons';
import { useRef } from 'react';
import { getShadow } from '@/lib/theme-utils';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  label?: string;
  disabled?: boolean;
}

export function ColorPicker({ value, onChange, label, disabled = false }: ColorPickerProps) {
  const { colorScheme, theme } = useTheme();
  const mantineTheme = useMantineTheme();
  const isDark = colorScheme === 'dark';
  const inputRef = useRef<HTMLInputElement>(null);

  const handleColorClick = () => {
    if (!disabled && inputRef.current) {
      inputRef.current.click();
    }
  };

  return (
    <Box>
      {label && (
        <Text
          size="sm"
          fw={500}
          mb={4}
          c={isDark ? theme.colors.gray[5] : theme.colors.gray[7]}
        >
          {label}
        </Text>
      )}
      
      <Box
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: mantineTheme.spacing.sm,
        }}
      >
        <UnstyledButton
          onClick={handleColorClick}
          disabled={disabled}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: mantineTheme.spacing.xs,
            padding: `${mantineTheme.spacing.xs} ${mantineTheme.spacing.sm}`,
            borderRadius: mantineTheme.radius.md,
            border: `1px solid ${isDark ? theme.colors.dark?.[4] || theme.colors.gray[6] : theme.colors.gray[3]}`,
            backgroundColor: isDark ? theme.colors.dark?.[6] || theme.colors.gray[7] : theme.white,
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.5 : 1,
            transition: 'all 0.2s ease',
            '&:hover': !disabled ? {
              backgroundColor: isDark ? theme.colors.dark?.[5] || theme.colors.gray[6] : theme.colors.gray[0],
              transform: 'scale(1.05)',
            } : {},
          }}
        >
          <Box
            style={{
              width: 32,
              height: 32,
              borderRadius: mantineTheme.radius.sm,
              backgroundColor: value,
              border: `2px solid ${isDark ? theme.colors.dark?.[4] || theme.colors.gray[6] : theme.colors.gray[3]}`,
              position: 'relative',
              overflow: 'hidden',
              boxShadow: getShadow(theme, 'sm', isDark),
            }}
          >
            {/* Checkerboard pattern for transparency */}
            <Box
              style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: `
                  linear-gradient(45deg, ${theme.colors.gray[3]} 25%, transparent 25%),
                  linear-gradient(-45deg, ${theme.colors.gray[3]} 25%, transparent 25%),
                  linear-gradient(45deg, transparent 75%, ${theme.colors.gray[3]} 75%),
                  linear-gradient(-45deg, transparent 75%, ${theme.colors.gray[3]} 75%)
                `,
                backgroundSize: '8px 8px',
                backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px',
                opacity: 0.3,
              }}
            />
          </Box>
          <Icons.Palette size={18} style={{ color: isDark ? theme.colors.gray[4] : theme.colors.gray[6] }} />
        </UnstyledButton>
        
        <Text size="sm" c={isDark ? theme.colors.gray[3] : theme.colors.gray[7]}>
          {value.toUpperCase()}
        </Text>
      </Box>
        
      {/* Hidden color input */}
      <input
        ref={inputRef}
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        style={{
          position: 'absolute',
          visibility: 'hidden',
          width: 0,
          height: 0,
        }}
      />
    </Box>
  );
}