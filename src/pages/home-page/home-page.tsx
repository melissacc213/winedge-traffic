import { Card,Container, Grid, Paper, Text, Title, useComputedColorScheme,useMantineTheme } from '@mantine/core';

export function HomePage() {
  const theme = useMantineTheme();
  const computedColorScheme = useComputedColorScheme();
  const isDark = computedColorScheme === 'dark';
  
  return (
    <Container className="py-8 max-w-6xl">
      <Paper withBorder p="xl" radius="md" className="mb-8">
        <Title order={1} mb="md" c="blue.5">
          Traffic AI Dashboard
        </Title>
        <Text>
          Welcome to the Traffic AI system. Use the sidebar to navigate through different sections.
        </Text>
      </Paper>

      <Grid>
        <Grid.Col span={{ base: 12, lg: 3, md: 6 }}>
          <Card shadow="sm" p="lg" radius="md" withBorder className="h-full">
            <Card.Section bg="blue.6" p="md">
              <Title order={3} c="white">Tasks</Title>
            </Card.Section>
            <Text mt="md">Manage and monitor traffic analysis tasks</Text>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, lg: 3, md: 6 }}>
          <Card shadow="sm" p="lg" radius="md" withBorder className="h-full">
            <Card.Section bg="blue.6" p="md">
              <Title order={3} c="white">Recipes</Title>
            </Card.Section>
            <Text mt="md">Configure and save analysis recipes</Text>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, lg: 3, md: 6 }}>
          <Card shadow="sm" p="lg" radius="md" withBorder className="h-full">
            <Card.Section bg="blue.6" p="md">
              <Title order={3} c="white">Models</Title>
            </Card.Section>
            <Text mt="md">Manage AI models used for traffic analysis</Text>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, lg: 3, md: 6 }}>
          <Card shadow="sm" p="lg" radius="md" withBorder className="h-full">
            <Card.Section bg="blue.6" p="md">
              <Title order={3} c="white">Users</Title>
            </Card.Section>
            <Text mt="md">Manage user access and permissions</Text>
          </Card>
        </Grid.Col>
      </Grid>
    </Container>
  );
}