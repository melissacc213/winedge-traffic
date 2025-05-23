import { useNavigate } from "react-router-dom";
import { Card, Group, Text, Stack, Badge, rem } from "@mantine/core";
import { IconClock, IconFileAnalytics } from "@tabler/icons-react";
import type { Task } from "../../types/task";
import { TaskActionMenu } from "./task-action-menu";
import { TaskStatusBadge } from "./task-status-badge";
import { TaskProgress } from "./task-progress";

interface TaskCardProps {
  task: Task;
}

export function TaskCard({ task }: TaskCardProps) {
  const navigate = useNavigate();
  const {
    id,
    name,
    description,
    resultType,
    status,
    progress,
    startedAt,
    resultsCount,
    createdAt,
  } = task;

  const handleViewDetails = () => {
    navigate(`/tasks/${id}`);
  };

  const handleViewMetrics = () => {
    navigate(`/tasks/${id}/metrics`);
  };

  // Format date to relative time
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return 'just now';
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) {
      return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
    }
    
    const diffInMonths = Math.floor(diffInDays / 30);
    return `${diffInMonths} month${diffInMonths === 1 ? '' : 's'} ago`;
  };

  return (
    <Card withBorder padding="lg" radius="md">
      <Card.Section withBorder inheritPadding py="xs">
        <Group justify="space-between">
          <Group>
            <Text fw={500}>{name}</Text>
            <TaskStatusBadge status={status} size="sm" />
          </Group>

          <TaskActionMenu
            task={task}
            onViewDetails={handleViewDetails}
            onViewMetrics={handleViewMetrics}
          />
        </Group>
      </Card.Section>

      <Stack gap="md" mt="md">
        {description && (
          <Text size="sm" c="dimmed" lineClamp={2}>
            {description}
          </Text>
        )}

        <TaskProgress progress={progress} status={status} />

        <Group gap="lg">
          <Badge
            color="blue"
            variant="light"
            radius="sm"
            size="lg"
            style={{ textTransform: "capitalize" }}
          >
            {resultType}
          </Badge>

          <Group gap={rem(4)}>
            <IconClock size={rem(16)} stroke={1.5} />
            <Text size="xs" c="dimmed">
              {startedAt
                ? `Started ${formatRelativeTime(startedAt)}`
                : `Created ${formatRelativeTime(createdAt)}`}
            </Text>
          </Group>
        </Group>

        {resultsCount && (
          <Group gap="xs">
            <IconFileAnalytics size={rem(16)} stroke={1.5} />
            <Text size="sm">
              <Text span fw={500}>
                {resultsCount}
              </Text>
              <Text span c="dimmed">
                {" "}
                objects detected
              </Text>
            </Text>
          </Group>
        )}
      </Stack>
    </Card>
  );
}