import type { MantineTheme } from "@mantine/core";

/**
 * Theme utility functions for consistent and safe theme access
 * These utilities provide type-safe access to theme properties and handle edge cases
 */

/**
 * Get a dark mode background color with fallback
 * @param theme - Mantine theme object
 * @param level - Dark color level (0-9)
 * @param isDark - Whether dark mode is active
 * @returns Background color string
 */
export function getBackgroundColor(
  theme: MantineTheme,
  level: number,
  isDark: boolean
): string {
  if (isDark) {
    // Safe access to dark colors with fallback to gray
    const darkColors = theme.colors.dark;
    if (darkColors && darkColors[level]) {
      return darkColors[level];
    }
    // Fallback mapping
    const grayFallbacks: Record<number, number> = {
      0: 3,
      1: 4,
      2: 5,
      3: 6,
      4: 6,
      5: 6,
      6: 7,
      7: 8,
      8: 9,
      9: 9,
    };
    return theme.colors.gray[grayFallbacks[level] || 8];
  }
  
  // Light mode backgrounds
  const lightMapping: Record<number, string> = {
    0: theme.colors.gray[6],
    1: theme.colors.gray[5],
    2: theme.colors.gray[4],
    3: theme.colors.gray[3],
    4: theme.colors.gray[2],
    5: theme.colors.gray[2],
    6: theme.colors.gray[1],
    7: theme.colors.gray[0],
    8: theme.white,
    9: theme.white,
  };
  
  return lightMapping[level] || theme.white;
}

/**
 * Get a border color with proper dark/light mode handling
 * @param theme - Mantine theme object
 * @param isDark - Whether dark mode is active
 * @param level - Optional level for fine-tuning (default: standard border)
 * @returns Border color string
 */
export function getBorderColor(
  theme: MantineTheme,
  isDark: boolean,
  level: "subtle" | "default" | "strong" = "default"
): string {
  const levelMapping = {
    default: isDark ? 5 : 2,
    strong: isDark ? 4 : 3,
    subtle: isDark ? 6 : 1,
  };
  
  return getBackgroundColor(theme, levelMapping[level], isDark);
}

/**
 * Get hover background color
 * @param theme - Mantine theme object
 * @param isDark - Whether dark mode is active
 * @param intensity - Hover intensity level
 * @returns Hover background color
 */
export function getHoverBackground(
  theme: MantineTheme,
  isDark: boolean,
  intensity: "subtle" | "light" | "medium" = "light"
): string {
  if (isDark) {
    const alphaMapping = {
      light: 0.08,
      medium: 0.1,
      subtle: 0.05,
    };
    return `rgba(255, 255, 255, ${alphaMapping[intensity]})`;
  } else {
    const alphaMapping = {
      light: 0.08,
      medium: 0.1,
      subtle: 0.05,
    };
    return `rgba(0, 0, 0, ${alphaMapping[intensity]})`;
  }
}

/**
 * Get text color with proper contrast
 * @param theme - Mantine theme object
 * @param isDark - Whether dark mode is active
 * @param variant - Text variant
 * @returns Text color string
 */
export function getTextColor(
  theme: MantineTheme,
  isDark: boolean,
  variant: "primary" | "secondary" | "dimmed" = "primary"
): string {
  const variantMapping = {
    dimmed: isDark ? theme.colors.gray[5] : theme.colors.gray[6],
    primary: isDark ? theme.white : theme.black,
    secondary: isDark ? theme.colors.gray[3] : theme.colors.gray[7],
  };
  
  return variantMapping[variant];
}

/**
 * Get shadow with proper dark/light mode handling
 * @param theme - Mantine theme object
 * @param size - Shadow size
 * @param isDark - Whether dark mode is active
 * @returns Shadow string
 */
export function getShadow(
  theme: MantineTheme,
  size: "xs" | "sm" | "md" | "lg" | "xl",
  isDark: boolean
): string {
  // Access custom shadows from theme.other
  const shadows = theme.other?.shadows;
    
  if (shadows && shadows[size]) {
    return shadows[size];
  }
  
  // Fallback shadows
  const fallbackShadows = {
    lg: isDark ? "0 10px 15px rgba(0, 0, 0, 0.4)" : "0 10px 15px rgba(0, 0, 0, 0.2)",
    md: isDark ? "0 4px 6px rgba(0, 0, 0, 0.3)" : "0 4px 6px rgba(0, 0, 0, 0.15)",
    sm: isDark ? "0 2px 4px rgba(0, 0, 0, 0.3)" : "0 2px 4px rgba(0, 0, 0, 0.1)",
    xl: isDark ? "0 20px 25px rgba(0, 0, 0, 0.5)" : "0 20px 25px rgba(0, 0, 0, 0.25)",
    xs: isDark ? "0 1px 3px rgba(0, 0, 0, 0.3)" : "0 1px 3px rgba(0, 0, 0, 0.05)",
  };
  
  return fallbackShadows[size];
}

/**
 * Get region color from palette
 * @param theme - Mantine theme object
 * @param index - Region index
 * @returns Color string
 */
export function getRegionColor(theme: MantineTheme, index: number): string {
  const palette = theme.other?.regionPalette;
  if (!palette || palette.length === 0) {
    // Fallback to default colors
    const defaultPalette = [
      theme.colors.blue[5],
      theme.colors.red[5],
      theme.colors.green[5],
      theme.colors.yellow[5],
    ];
    return defaultPalette[index % defaultPalette.length];
  }
  
  const colorRef = palette[index % palette.length];
  
  // Parse color reference (e.g., "blue.5")
  if (typeof colorRef === 'string' && colorRef.includes('.')) {
    const [colorName, levelStr] = colorRef.split('.');
    const level = parseInt(levelStr, 10);
    
    if (theme.colors[colorName] && theme.colors[colorName][level]) {
      return theme.colors[colorName][level];
    }
  }
  
  // Fallback
  return theme.colors.blue[5];
}

/**
 * Get overlay color
 * @param theme - Mantine theme object
 * @param type - Overlay type
 * @param isDark - Whether dark mode is active
 * @returns Overlay color string
 */
export function getOverlayColor(
  theme: MantineTheme,
  type: "gradient" | "controls" | "backdrop" | "loading",
  isDark: boolean
): string {
  const overlay = theme.other?.overlay;
  if (overlay && overlay[type]) {
    return overlay[type];
  }
  
  // Fallbacks
  const fallbacks = {
    backdrop: "rgba(0, 0, 0, 0.15)",
    controls: "rgba(0, 0, 0, 0.6)",
    gradient: isDark ? "rgba(0, 0, 0, 0.9)" : "rgba(0, 0, 0, 0.8)",
    loading: isDark ? "rgba(0, 0, 0, 0.7)" : "rgba(255, 255, 255, 0.7)",
  };
  
  return fallbacks[type];
}

/**
 * Create a glass morphism effect
 * @param theme - Mantine theme object
 * @param isDark - Whether dark mode is active
 * @returns Glass morphism style object
 */
export function getGlassMorphism(theme: MantineTheme, isDark: boolean) {
  return {
    WebkitBackdropFilter: "blur(10px)",
    backdropFilter: "blur(10px)",
    backgroundColor: theme.other?.backgrounds?.glassMorphism || 
      (isDark ? "rgba(17, 25, 40, 0.9)" : "rgba(255, 255, 255, 0.9)"),
    border: `1px solid ${getBorderColor(theme, isDark, "subtle")}`,
  };
}

/**
 * Safe color access helper
 * @param theme - Mantine theme object
 * @param colorPath - Color path (e.g., "blue.5")
 * @param fallback - Fallback color
 * @returns Color string
 */
export function getColor(
  theme: MantineTheme,
  colorPath: string,
  fallback: string
): string {
  const [colorName, levelStr] = colorPath.split('.');
  const level = parseInt(levelStr, 10);
  
  if (theme.colors[colorName] && theme.colors[colorName][level]) {
    return theme.colors[colorName][level];
  }
  
  return fallback;
}

/**
 * Get status badge color based on task status
 * @param theme - Mantine theme object
 * @param status - Task status
 * @returns Badge color configuration
 */
export function getStatusBadgeColor(
  theme: MantineTheme,
  status: string
): { color: string; variant: "filled" | "light" | "outline" } {
  const statusMapping: Record<string, { color: string; variant: "filled" | "light" | "outline" }> = {
    cancelled: { color: theme.colors.gray[6], variant: "outline" },
    completed: { color: theme.colors.green[5], variant: "filled" },
    failed: { color: theme.colors.red[5], variant: "filled" },
    paused: { color: theme.colors.yellow[6], variant: "light" },
    pending: { color: theme.colors.gray[5], variant: "light" },
    running: { color: theme.colors.blue[5], variant: "filled" },
  };

  return statusMapping[status.toLowerCase()] || statusMapping.pending;
}

/**
 * Get video player colors
 * @param theme - Mantine theme object
 * @param isDark - Whether dark mode is active
 * @returns Video player color configuration
 */
export function getVideoPlayerColors(theme: MantineTheme, isDark: boolean) {
  return {
    background: theme.other?.backgrounds?.videoPlayer || theme.black,
    controlsBackground: getBackgroundColor(theme, isDark ? 8 : 0, isDark),
    controlsBorder: getBorderColor(theme, isDark, "default"),
    overlayBackground: getOverlayColor(theme, "controls", isDark),
  };
}

/**
 * Get notification colors for toast messages
 * @param theme - Mantine theme object
 * @param type - Notification type
 * @returns Notification color configuration
 */
export function getNotificationColors(
  theme: MantineTheme,
  type: "success" | "error" | "warning" | "info" = "info"
) {
  const colorMapping = {
    error: { background: theme.colors.red[1], border: theme.colors.red[3], text: theme.colors.red[8] },
    info: { background: theme.colors.blue[1], border: theme.colors.blue[3], text: theme.colors.blue[8] },
    success: { background: theme.colors.green[1], border: theme.colors.green[3], text: theme.colors.green[8] },
    warning: { background: theme.colors.yellow[1], border: theme.colors.yellow[3], text: theme.colors.yellow[8] },
  };

  return colorMapping[type];
}