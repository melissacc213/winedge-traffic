import { Alert, Group, Text } from '@mantine/core';
import { Icons } from '../icons';
import { USE_MOCK_API } from '@/lib/config/mock-config';

export function MockBanner() {
  if (!USE_MOCK_API) return null;

  return (
    <Alert
      variant="light"
      color="orange"
      icon={<Icons.AlertTriangle size={16} />}
      styles={{
        root: {
          position: 'fixed',
          bottom: 20,
          right: 20,
          zIndex: 1000,
          maxWidth: 300,
        },
      }}
    >
      <Group gap="xs">
        <Text size="sm" fw={500}>Mock Mode Active</Text>
      </Group>
      <Text size="xs" c="dimmed">
        Using mock data for authentication and API calls
      </Text>
    </Alert>
  );
}