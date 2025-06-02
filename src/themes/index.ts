import { createTheme, mergeMantineTheme } from "@mantine/core";
import type { MantineThemeOverride } from "@mantine/core";

/**
 * IMPORTANT: Theme Property Access in Mantine v8
 * 
 * This theme file defines both Mantine built-in properties and custom properties.
 * Access patterns:
 * 
 * 1. For Mantine built-in properties (radius, spacing, fontSizes, etc.):
 *    - Use useMantineTheme() hook from @mantine/core
 *    - Access: mantineTheme.radius.md, mantineTheme.spacing.lg, etc.
 * 
 * 2. For custom properties defined in 'other' object:
 *    - Use useTheme() hook from theme provider
 *    - Access: theme.other.shadows.md, theme.other.regionPalette[0], etc.
 * 
 * 3. Colors can be accessed from either:
 *    - mantineTheme.colors.blue[5] OR theme.colors.blue[5]
 * 
 * Common error: "Cannot read properties of undefined (reading 'md')"
 * This happens when trying to access theme.radius.md instead of mantineTheme.radius.md
 */

// Base theme with shared settings
const baseTheme: MantineThemeOverride = {
  primaryColor: "blue",
  focusRing: "auto",
  colors: {
    // Main blue palette
    blue: [
      "#e6f7ff", // 0: Lightest blue, good for backgrounds
      "#bae7ff", // 1: Very light blue
      "#91d5ff", // 2: Light blue
      "#69c0ff", // 3: Medium-light blue
      "#40a9ff", // 4: Medium blue
      "#1890ff", // 5: Primary blue
      "#096dd9", // 6: Medium-dark blue
      "#0050b3", // 7: Dark blue
      "#003a8c", // 8: Very dark blue
      "#002766", // 9: Darkest blue
    ],
    
    // Secondary color - teal
    teal: [
      "#e6fffb", // 0
      "#b5f5ec", // 1
      "#87e8de", // 2
      "#5cdbd3", // 3
      "#36cfc9", // 4
      "#13c2c2", // 5: Primary teal
      "#08979c", // 6
      "#006d75", // 7
      "#00474f", // 8
      "#002329", // 9
    ],
    
    // Accent color - indigo
    indigo: [
      "#f0f5ff", // 0
      "#d6e4ff", // 1
      "#adc6ff", // 2
      "#85a5ff", // 3
      "#597ef7", // 4
      "#2f54eb", // 5: Primary indigo
      "#1d39c4", // 6
      "#10239e", // 7
      "#061178", // 8
      "#030852", // 9
    ],
    
    // Alert/Status colors
    green: [
      "#f0fff4", // 0
      "#d3f9d8", // 1
      "#b2f2bb", // 2
      "#8ce99a", // 3
      "#69db7c", // 4
      "#51cf66", // 5: Primary green
      "#40c057", // 6
      "#2f9e44", // 7
      "#2b8a3e", // 8
      "#237032", // 9
    ],
    
    red: [
      "#fff5f5", // 0
      "#ffe3e3", // 1
      "#ffc9c9", // 2
      "#ffa8a8", // 3
      "#ff8787", // 4
      "#ff6b6b", // 5: Primary red
      "#fa5252", // 6
      "#f03e3e", // 7
      "#e03131", // 8
      "#c92a2a", // 9
    ],
    
    yellow: [
      "#fff9db", // 0
      "#fff3bf", // 1
      "#ffec99", // 2
      "#ffe066", // 3
      "#ffd43b", // 4
      "#fcc419", // 5: Primary yellow
      "#fab005", // 6
      "#f59f00", // 7
      "#f08c00", // 8
      "#e67700", // 9
    ],
    
    // UI grays
    gray: [
      "#f8fafc", // 0: Lightest gray, for backgrounds
      "#f1f5f9", // 1: Very light gray
      "#e2e8f0", // 2: Light gray for borders
      "#cbd5e1", // 3: Medium-light gray
      "#94a3b8", // 4: Medium gray
      "#64748b", // 5: Medium-dark gray
      "#475569", // 6: Dark gray
      "#334155", // 7: Very dark gray
      "#1e293b", // 8: Almost black
      "#0f172a", // 9: Darkest gray/black
    ],
    
    // Additional color palettes for region variety
    orange: [
      "#fff8f1", // 0
      "#feecdc", // 1
      "#fed8b1", // 2
      "#fdc996", // 3
      "#fbb46e", // 4
      "#fa9c46", // 5: Primary orange
      "#e8751a", // 6
      "#c44d16", // 7
      "#9e3c13", // 8
      "#7c2d12", // 9
    ],
    
    cyan: [
      "#ecfeff", // 0
      "#cffafe", // 1
      "#a5f3fc", // 2
      "#67e8f9", // 3
      "#22d3ee", // 4
      "#06b6d4", // 5
      "#0891b2", // 6
      "#0e7490", // 7
      "#155e75", // 8
      "#164e63", // 9
    ],
    
    lime: [
      "#f7fee7", // 0
      "#ecfccb", // 1
      "#d9f99d", // 2
      "#bef264", // 3
      "#a3e635", // 4
      "#84cc16", // 5
      "#65a30d", // 6
      "#4d7c0f", // 7
      "#3f6212", // 8
      "#365314", // 9
    ],
    
    violet: [
      "#f5f3ff", // 0
      "#ede9fe", // 1
      "#ddd6fe", // 2
      "#c4b5fd", // 3
      "#a78bfa", // 4
      "#8b5cf6", // 5
      "#7c3aed", // 6
      "#6d28d9", // 7
      "#5b21b6", // 8
      "#4c1d95", // 9
    ],
    
    pink: [
      "#fdf2f8", // 0
      "#fce7f3", // 1
      "#fbcfe8", // 2
      "#f9a8d4", // 3
      "#f472b6", // 4
      "#ec4899", // 5
      "#db2777", // 6
      "#be185d", // 7
      "#9d174d", // 8
      "#831843", // 9
    ],
    
    grape: [
      "#f8f0fc", // 0
      "#f3d9fa", // 1
      "#eebefa", // 2
      "#e599f7", // 3
      "#da77f2", // 4
      "#cc5de8", // 5
      "#be4bdb", // 6
      "#ae3ec9", // 7
      "#9c36b5", // 8
      "#862e9c", // 9
    ],
  },
  fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif",
  defaultRadius: "md",
  
  // Custom color-related variables
  other: {
    // Region colors for visualization
    regionColors: {
      countLine: "blue.5",
      areaOfInterest: "green.5", 
      exclusionZone: "red.5"
    },
    
    // Extended color palette for regions - 40 distinct colors
    regionPalette: [
      "blue.5",      // Primary blue
      "red.5",       // Primary red
      "green.5",     // Primary green
      "yellow.7",    // Dark yellow
      "indigo.5",    // Primary indigo
      "teal.5",      // Primary teal
      "orange.5",    // Orange
      "cyan.6",      // Cyan
      "pink.5",      // Pink
      "lime.6",      // Lime
      "violet.5",    // Violet
      "grape.5",     // Grape
      "blue.7",      // Dark blue
      "red.7",       // Dark red
      "green.7",     // Dark green
      "yellow.5",    // Primary yellow
      "indigo.7",    // Dark indigo
      "teal.7",      // Dark teal
      "orange.7",    // Dark orange
      "cyan.8",      // Dark cyan
      "pink.7",      // Dark pink
      "lime.8",      // Dark lime
      "violet.7",    // Dark violet
      "grape.7",     // Dark grape
      "blue.3",      // Light blue
      "red.3",       // Light red
      "green.3",     // Light green
      "yellow.3",    // Light yellow
      "indigo.3",    // Light indigo
      "teal.3",      // Light teal
      "orange.3",    // Light orange
      "cyan.3",      // Light cyan
      "pink.3",      // Light pink
      "lime.3",      // Light lime
      "violet.3",    // Light violet
      "grape.3",     // Light grape
      "blue.6",      // Medium-dark blue
      "green.6",     // Medium-dark green
      "red.6",       // Medium-dark red
      "yellow.6",    // Medium-dark yellow
    ],
    
    // Transparency values
    transparency: {
      regionFill: 0.3,
      regionFillHover: 0.5,
      regionStroke: 1.0
    },
    
    // Background colors
    backgrounds: {
      cardLight: "gray.0",
      cardHover: "gray.1",
      pageBackground: "white",
      divider: "gray.2"
    },
    
    // Task-specific colors
    taskTypes: {
      trafficStatistics: "teal.5",
      trainDetection: "indigo.5"
    },
    
    // UI element colors
    ui: {
      border: "gray.2",
      borderHover: "gray.3",
      shadow: "rgba(0,0,0,0.1)",
      borderRadius: "8px"
    },
    
    // Shadow definitions
    shadows: {
      xs: "0 1px 3px rgba(0, 0, 0, 0.05)",
      sm: "0 2px 4px rgba(0, 0, 0, 0.1)",
      md: "0 4px 6px rgba(0, 0, 0, 0.15)",
      lg: "0 10px 15px rgba(0, 0, 0, 0.2)",
      xl: "0 20px 25px rgba(0, 0, 0, 0.25)"
    }
  },
  components: {
    Button: {
      defaultProps: {
        radius: "md",
      },
      styles: {
        root: {
          fontWeight: 500,
          "&:hover": {
            transform: "translateY(-1px)",
          },
        },
      },
    },
    TextInput: {
      defaultProps: {
        radius: "md",
      },
    },
    PasswordInput: {
      defaultProps: {
        radius: "md",
      },
    },
    Paper: {
      defaultProps: {
        radius: "md",
        p: "md",
      },
    },
    Card: {
      styles: {
        root: {
          transition: "all 0.2s ease",
          "&:hover": {
            transform: "translateY(-2px)",
          },
        },
      },
    },
    ActionIcon: {
      styles: {
        root: {
          transition: "all 0.2s ease",
          "&:hover": {
            transform: "translateY(-1px)",
          },
        },
      },
    },
    Menu: {
      styles: {
        dropdown: {
          // Styles will be handled by CSS variables in Mantine v7+
        },
        item: {
          // Styles will be handled by CSS variables in Mantine v7+
        },
      },
    },
    Tooltip: {
      styles: {
        tooltip: {
          // Styles will be handled by CSS variables in Mantine v7+
        },
      },
    },
    Badge: {
      styles: {
        root: {
          textTransform: "none",
        },
      },
    },
  },
};

// Light theme specific overrides
const lightThemeOverrides: MantineThemeOverride = {
  focusRing: "auto",
  other: {
    // Background colors for light mode
    backgrounds: {
      cardLight: "gray.0",
      cardHover: "gray.1",
      pageBackground: "white",
      divider: "gray.2",
      glassMorphism: "rgba(255, 255, 255, 0.9)",
      videoPlayer: "#000000"
    },
    
    // UI element colors for light mode
    ui: {
      border: "gray.2",
      borderHover: "gray.3",
      shadow: "rgba(0,0,0,0.1)",
      borderRadius: "8px"
    },
    
    // Hover colors for interactive elements
    hover: {
      subtle: "rgba(0, 0, 0, 0.05)",
      light: "rgba(0, 0, 0, 0.08)",
      medium: "rgba(0, 0, 0, 0.1)",
      blueSubtle: "rgba(25, 144, 255, 0.1)",
      blueMedium: "rgba(25, 144, 255, 0.15)"
    },
    
    // Overlay colors
    overlay: {
      gradient: "rgba(0, 0, 0, 0.8)",
      controls: "rgba(0, 0, 0, 0.6)",
      lightButton: "rgba(255, 255, 255, 0.15)",
      blueShadow: "rgba(37, 99, 235, 0.3)",
      backdrop: "rgba(0, 0, 0, 0.15)",
      loading: "rgba(255, 255, 255, 0.7)"
    },
    
    // Shadow definitions for light mode
    shadows: {
      xs: "0 1px 3px rgba(0, 0, 0, 0.05)",
      sm: "0 2px 4px rgba(0, 0, 0, 0.1)",
      md: "0 4px 6px rgba(0, 0, 0, 0.15)",
      lg: "0 10px 15px rgba(0, 0, 0, 0.2)",
      xl: "0 20px 25px rgba(0, 0, 0, 0.25)"
    }
  }
};

// Dark theme specific overrides
const darkThemeOverrides: MantineThemeOverride = {
  focusRing: "auto",
  other: {
    // Background colors for dark mode
    backgrounds: {
      cardLight: "gray.9",
      cardHover: "gray.8",
      pageBackground: "gray.9",
      divider: "gray.7",
      glassMorphism: "rgba(17, 25, 40, 0.9)",
      videoPlayer: "#000000"
    },
    
    // UI element colors for dark mode
    ui: {
      border: "gray.7",
      borderHover: "gray.6",
      shadow: "rgba(0,0,0,0.3)",
      borderRadius: "8px"
    },
    
    // Hover colors for interactive elements
    hover: {
      subtle: "rgba(255, 255, 255, 0.05)",
      light: "rgba(255, 255, 255, 0.08)",
      medium: "rgba(255, 255, 255, 0.1)",
      blueSubtle: "rgba(64, 192, 255, 0.1)",
      blueMedium: "rgba(64, 192, 255, 0.15)"
    },
    
    // Overlay colors
    overlay: {
      gradient: "rgba(0, 0, 0, 0.9)",
      controls: "rgba(0, 0, 0, 0.6)",
      lightButton: "rgba(255, 255, 255, 0.15)",
      blueShadow: "rgba(37, 99, 235, 0.3)",
      backdrop: "rgba(0, 0, 0, 0.15)",
      loading: "rgba(0, 0, 0, 0.7)"
    },
    
    // Shadow definitions for dark mode
    shadows: {
      xs: "0 1px 3px rgba(0, 0, 0, 0.3)",
      sm: "0 2px 4px rgba(0, 0, 0, 0.3)",
      md: "0 4px 6px rgba(0, 0, 0, 0.3)",
      lg: "0 10px 15px rgba(0, 0, 0, 0.4)",
      xl: "0 20px 25px rgba(0, 0, 0, 0.5)"
    }
  }
};

// Create base theme
const baseThemeInstance = createTheme(baseTheme);

// Create the light and dark themes
export const lightTheme = mergeMantineTheme(baseThemeInstance, lightThemeOverrides);
export const darkTheme = mergeMantineTheme(baseThemeInstance, darkThemeOverrides);

// For compatibility, export light theme as default
export default lightTheme;
