import { createTheme,localStorageColorSchemeManager,MantineProvider } from "@mantine/core";

import { themeConfig } from "@/themes";

// Theme provider props
interface ThemeProviderProps {
  children: React.ReactNode;
}

// Create the theme using Mantine v8's createTheme
const theme = createTheme(themeConfig);

// Set up color scheme manager with localStorage persistence
const colorSchemeManager = localStorageColorSchemeManager({
  key: 'winedge-color-scheme'
});

// Theme provider component following Mantine v8 best practices
export function ThemeProvider({ children }: ThemeProviderProps) {
  return (
    <MantineProvider 
      theme={theme}
      colorSchemeManager={colorSchemeManager}
      defaultColorScheme="auto"
    >
      {children}
    </MantineProvider>
  );
}