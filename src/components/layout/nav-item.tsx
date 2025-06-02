import { Button, Tooltip, useComputedColorScheme,useMantineTheme } from '@mantine/core';
import { Link } from 'react-router-dom';

import { cn } from '@/lib/utils';

type NavItemProps = {
  path: string;
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick?: () => void;
  iconOnly?: boolean;
};

export function NavItem({ path, label, icon, isActive, onClick, iconOnly = false }: NavItemProps) {
  const theme = useMantineTheme();
  const computedColorScheme = useComputedColorScheme();
  const isDark = computedColorScheme === 'dark';
  
  // Theme color utility function
  const getThemeColor = (colorPath: string): string => {
    // Parse the color path (e.g., "blue.5" -> theme.colors.blue[5])
    const [colorName, index] = colorPath.split('.');
    
    // Special handling for theme's other properties
    if (colorName === 'ui') {
      return theme.other?.ui?.[index] || colorPath;
    }
    
    if (colorName === 'backgrounds') {
      return theme.other?.backgrounds?.[index] || colorPath;
    }
    
    // Standard color from theme colors
    return theme.colors?.[colorName]?.[Number(index)] || colorPath;
  };
  
  const button = (
    <Button
      component={Link}
      to={path}
      variant={isActive ? 'filled' : 'subtle'}
      color={isActive ? 'blue' : 'gray'}
      onClick={onClick}
      leftSection={!iconOnly ? icon : undefined}
      className={cn(
        'justify-start font-medium transition-all duration-300 w-full overflow-hidden',
        isActive
          ? isDark ? 'bg-blue-900 text-blue-400 hover:bg-blue-800' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
          : isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100',
        iconOnly && 'justify-center'
      )}
      styles={{
        inner: {
          justifyContent: iconOnly ? 'center' : 'flex-start',
          transition: 'transform 0.3s ease'
        },
        label: {
          fontSize: iconOnly ? '0' : '16px',
          opacity: iconOnly ? '0' : '1',
          transition: 'font-size 0.3s ease, opacity 0.3s ease',
          whiteSpace: 'nowrap'
        },
        root: {
          boxShadow: isActive ? (isDark ? `0 0 10px ${getThemeColor('blue.4')}33` : `0 0 10px ${getThemeColor('blue.5')}1a`) : 'none',
          fontSize: iconOnly ? '16px' : '17px',
          fontWeight: 500,
          height: iconOnly ? '52px' : '52px',
          padding: iconOnly ? '0' : '0 16px',
          transition: 'all 0.3s ease',
          ...(isActive 
            ? { 
                backgroundColor: isDark ? `${getThemeColor('blue.5')}40` : `${getThemeColor('blue.5')}26`, 
                color: isDark ? getThemeColor('blue.4') : getThemeColor('blue.5') 
              } 
            : { 
                backgroundColor: 'transparent',
                color: isDark ? getThemeColor('gray.4') : getThemeColor('gray.6')
              })
        },
        section: {
          color: isActive ? (isDark ? getThemeColor('blue.4') : getThemeColor('blue.5')) : (isDark ? getThemeColor('gray.4') : getThemeColor('gray.6')),
          marginRight: '14px',
          transform: 'scale(1.1)' // Slightly larger icons
        }
      }}
    >
      {iconOnly ? icon : label}
    </Button>
  );

  // We only need a tooltip when in collapsed mode
  return iconOnly ? (
    <Tooltip label={label} position="right" withArrow offset={10}>
      {button}
    </Tooltip>
  ) : button;
}