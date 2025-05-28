import { Stack, Title, Text } from '@mantine/core';
import { PageLayout } from '@/components/page-layout/page-layout';
import { TaskCreationForm } from '@/components/task-creation';

export function TaskCreationDemoPage() {
  return (
    <PageLayout>
      <Stack gap="lg">
        <div>
          <Title order={2}>建立新任務</Title>
          <Text size="sm" c="dimmed" mt="xs">
            選擇任務類型和配方來建立新的分析任務
          </Text>
        </div>
        
        <TaskCreationForm />
      </Stack>
    </PageLayout>
  );
}