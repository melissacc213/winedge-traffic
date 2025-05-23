import { Group, Paper, Text, Title } from '@mantine/core';
import { ReactNode } from 'react';
import { PageHeaderSkeleton } from '../ui';

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  rightSection?: ReactNode;
  isLoading?: boolean;
}

export function PageHeader({ title, description, icon, rightSection, isLoading = false }: PageHeaderProps) {
  if (isLoading) {
    return (
      <Paper p="md" withBorder mb="lg">
        <PageHeaderSkeleton 
          withIcon={!!icon} 
          withRightSection={!!rightSection} 
        />
      </Paper>
    );
  }

  return (
    <Paper p="md" withBorder mb="lg">
      <Group justify="space-between" mb={description ? 30 : 0}>
        <Group>
          {icon && <div className="flex items-center justify-center">{icon}</div>}
          <div>
            <Title order={2}>{title}</Title>
            {description && (
              <Text c="dimmed" size="sm">
                {description}
              </Text>
            )}
          </div>
        </Group>
        {rightSection && <div>{rightSection}</div>}
      </Group>
    </Paper>
  );
}