import { useEffect } from 'react';
import '@mantine/core/styles.css'; // Import Mantine styles
import { Notifications } from '@mantine/notifications';
import '@mantine/notifications/styles.css'; // Import Notifications styles
import '@mantine/dates/styles.css'; // Import Dates styles (includes ColorPicker)
import '@mantine/dropzone/styles.css'; // Import Dropzone styles
import { ModalsProvider } from '@mantine/modals';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@/lib/i18n';
import { RouterProvider } from '@/providers/router-provider';
import { ThemeProvider, useTheme } from '@/providers/theme-provider';
import { ModalProvider } from '@/components/modal-provider';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// MantineWrapper component to apply the theme and render app content
function MantineWrapper() {
  const { colorScheme } = useTheme();
  
  // Apply theme classes
  useEffect(() => {
    if (colorScheme === "dark") {
      document.documentElement.classList.add("mantine-dark-theme");
      document.documentElement.classList.remove("mantine-light-theme");
    } else {
      document.documentElement.classList.add("mantine-light-theme");
      document.documentElement.classList.remove("mantine-dark-theme");
    }
    
    // Update the data attribute that Mantine uses
    document.documentElement.setAttribute('data-mantine-color-scheme', colorScheme);
  }, [colorScheme]);
  
  return (
    <>
      <Notifications position="top-right" />
      <ModalsProvider>
        <ModalProvider />
        <RouterProvider />
      </ModalsProvider>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <MantineWrapper />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;