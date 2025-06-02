import '@mantine/core/styles.css'; // Import Mantine styles
import '@mantine/notifications/styles.css'; // Import Notifications styles
import '@mantine/dates/styles.css'; // Import Dates styles (includes ColorPicker)
import '@mantine/dropzone/styles.css'; // Import Dropzone styles
import '@/lib/i18n';

import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { ModalProvider } from '@/components/modal-provider';
import { RouterProvider } from '@/providers/router-provider';
import { ThemeProvider } from '@/providers/theme-provider';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// MantineWrapper component to render app content
function MantineWrapper() {
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