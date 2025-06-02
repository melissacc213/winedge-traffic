import { Box, Text, UnstyledButton, useComputedColorScheme,useMantineTheme } from '@mantine/core';
import { useRef } from 'react';

import { Icons } from '@/components/icons';
import { getShadow } from '@/lib/theme-utils';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  label?: string;
  disabled?: boolean;
}

export function ColorPicker({ value, onChange, label, disabled = false }: ColorPickerProps) {
  const theme = useMantineTheme();
  const computedColorScheme = useComputedColorScheme();
  const isDark = computedColorScheme === 'dark';
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
          alignItems: 'center',
          display: 'inline-flex',
          gap: theme.spacing.sm,
        }}
      >
        <UnstyledButton
          onClick={handleColorClick}
          disabled={disabled}
          style={{
            '&:hover': !disabled ? {
              backgroundColor: isDark ? theme.colors.gray[6] : theme.colors.gray[0],
              transform: 'scale(1.05)',
            } : {},
            alignItems: 'center',
            backgroundColor: isDark ? theme.colors.gray[7] : theme.white,
            border: `1px solid ${isDark ? theme.colors.gray[6] : theme.colors.gray[3]}`,
            borderRadius: theme.radius.md,
            cursor: disabled ? 'not-allowed' : 'pointer',
            display: 'flex',
            gap: theme.spacing.xs,
            opacity: disabled ? 0.5 : 1,
            padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
            transition: 'all 0.2s ease',
          }}
        >
          <Box
            style={{
              backgroundColor: value,
              border: `2px solid ${isDark ? theme.colors.gray[6] : theme.colors.gray[3]}`,
              borderRadius: theme.radius.sm,
              boxShadow: getShadow(theme, 'sm', isDark),
              height: 32,
              overflow: 'hidden',
              position: 'relative',
              width: 32,
            }}
          >
            {/* Checkerboard pattern for transparency */}
            <Box
              style={{
                backgroundImage: `
                  linear-gradient(45deg, ${theme.colors.gray[3]} 25%, transparent 25%),
                  linear-gradient(-45deg, ${theme.colors.gray[3]} 25%, transparent 25%),
                  linear-gradient(45deg, transparent 75%, ${theme.colors.gray[3]} 75%),
                  linear-gradient(-45deg, transparent 75%, ${theme.colors.gray[3]} 75%)
                `,
                backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px',
                backgroundSize: '8px 8px',
                inset: 0,
                opacity: 0.3,
                position: 'absolute',
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
          height: 0,
          position: 'absolute',
          visibility: 'hidden',
          width: 0,
        }}
      />
    </Box>
  );
}