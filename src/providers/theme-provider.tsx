import { MantineProvider } from "@mantine/core";
import { createContext, useContext, useState, useEffect } from "react";
import { darkTheme, lightTheme } from "@/themes";

type ColorScheme = "light" | "dark";

// Define the theme context
interface ThemeContextType {
  colorScheme: ColorScheme;
  theme: typeof lightTheme | typeof darkTheme;
  toggleColorScheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Theme provider props
interface ThemeProviderProps {
  children: React.ReactNode;
}

// Theme provider component
export function ThemeProvider({ children }: ThemeProviderProps) {
  // Get stored color scheme or system preference
  const getInitialColorScheme = (): ColorScheme => {
    const storedColorScheme = localStorage.getItem("mantine-color-scheme");
    if (storedColorScheme === "dark" || storedColorScheme === "light") {
      return storedColorScheme;
    }

    // Check system preference
    if (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      return "dark";
    }

    return "light"; // Default to light
  };

  // State for color scheme
  const [colorScheme, setColorScheme] = useState<ColorScheme>(
    getInitialColorScheme
  );

  // Get theme based on color scheme
  const theme = colorScheme === "dark" ? darkTheme : lightTheme;

  // Toggle color scheme
  const toggleColorScheme = () => {
    const newColorScheme = colorScheme === "dark" ? "light" : "dark";
    setColorScheme(newColorScheme);
    localStorage.setItem("mantine-color-scheme", newColorScheme);
    
    // Set data attribute on document for theme access via CSS
    document.documentElement.setAttribute('data-theme', newColorScheme);
  };
  
  // Set initial theme attribute on document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', colorScheme);
  }, [colorScheme]);

  // Create context value
  const contextValue: ThemeContextType = {
    colorScheme,
    theme,
    toggleColorScheme,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      <MantineProvider theme={theme}>
        {children}
      </MantineProvider>
    </ThemeContext.Provider>
  );
}

// Hook to use the theme context
export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
