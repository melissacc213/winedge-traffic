import { Center, Loader, Stack, Text } from '@mantine/core';

interface PageLoaderProps {
  message?: string;
}

export function PageLoader({ message = "Loading..." }: PageLoaderProps) {
  return (
    <Center style={{ height: "100vh" }}>
      <Stack align="center" gap="md">
        <Loader size="lg" variant="dots" />
        <Text size="sm" c="dimmed">
          {message}
        </Text>
      </Stack>
    </Center>
  );
}