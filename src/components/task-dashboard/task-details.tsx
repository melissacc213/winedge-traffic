import { useEffect } from 'react';
import { 
  Card, 
  Grid, 
  Text, 
  Group, 
  Stack, 
  Badge, 
  Button,
  ActionIcon,
  Tooltip,
  Loader,
  Center
} from '@mantine/core';
import { modals } from '../../lib/modal';
import { notifications } from '@mantine/notifications';
import { 
  IconArrowLeft, 
  IconPlayerStop, 
  IconTrash,
  IconRefresh,
  IconClock,
  IconDeviceDesktopAnalytics
} from '@tabler/icons-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTask, useStopTask, useDeleteTask } from '../../lib/queries/task';
import { useTaskStore } from '../../lib/store/task-store';
import { TaskStatusBadge } from './task-status-badge';
import { TaskProgress } from './task-progress';
import { TaskVideoStream } from '../task-video-stream';
import { TaskMetricsCard } from './task-metrics-card';
import { formatDistanceToNow } from '../../lib/utils';

export function TaskDetails() {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const { selectTask } = useTaskStore();
  const { data: task, isLoading, error, refetch } = useTask(taskId || '');
  const { mutate: stopTask, isPending: isStoppingTask } = useStopTask();
  const { mutate: deleteTask, isPending: isDeletingTask } = useDeleteTask();
  
  useEffect(() => {
    if (task) {
      selectTask(task.id);
    }
    
    return () => {
      selectTask(null);
    };
  }, [task, selectTask]);
  
  const handleBack = () => {
    navigate('/tasks');
  };
  
  const handleStopTask = () => {
    if (!task) return;
    
    modals.openConfirmModal({
      title: 'Stop task',
      children: (
        <Text size="sm">
          Are you sure you want to stop "{task.name}"? This will halt all processing.
        </Text>
      ),
      labels: { confirm: 'Stop task', cancel: 'Cancel' },
      confirmProps: { color: 'yellow' },
      onConfirm: () => {
        stopTask(task.id, {
          onSuccess: () => {
            notifications.show({
              title: 'Task stopped',
              message: `Task "${task.name}" has been stopped successfully`,
              color: 'yellow'
            });
          },
          onError: (error) => {
            notifications.show({
              title: 'Error stopping task',
              message: error instanceof Error ? error.message : 'An error occurred',
              color: 'red'
            });
          }
        });
      }
    });
  };
  
  const handleDeleteTask = () => {
    if (!task) return;
    
    modals.openConfirmModal({
      title: 'Delete task',
      children: (
        <Text size="sm">
          Are you sure you want to delete "{task.name}"? This cannot be undone.
        </Text>
      ),
      labels: { confirm: 'Delete task', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: () => {
        deleteTask(task.id, {
          onSuccess: () => {
            notifications.show({
              title: 'Task deleted',
              message: `Task "${task.name}" has been deleted successfully`,
              color: 'green'
            });
            navigate('/tasks');
          },
          onError: (error) => {
            notifications.show({
              title: 'Error deleting task',
              message: error instanceof Error ? error.message : 'An error occurred',
              color: 'red'
            });
          }
        });
      }
    });
  };
  
  if (isLoading) {
    return (
      <Center style={{ height: 300 }}>
        <Loader size="md" />
      </Center>
    );
  }
  
  if (error || !task) {
    return (
      <Center style={{ height: 300, flexDirection: 'column' }}>
        <Text c="red" mb="md">
          {error instanceof Error ? error.message : 'Task not found'}
        </Text>
        <Button variant="outline" leftSection={<IconArrowLeft size={16} />} onClick={handleBack}>
          Back to Tasks
        </Button>
      </Center>
    );
  }
  
  return (
    <div>
      <Group justify="space-between" mb="xl">
        <Group>
          <Button 
            variant="subtle" 
            leftSection={<IconArrowLeft size={16} />} 
            onClick={handleBack}
          >
            Back to Tasks
          </Button>
          
          <Tooltip label="Refresh task data">
            <ActionIcon 
              variant="subtle" 
              aria-label="Refresh" 
              onClick={() => refetch()}
            >
              <IconRefresh size={16} />
            </ActionIcon>
          </Tooltip>
        </Group>
        
        <Group>
          {task.status === 'running' && (
            <Button
              color="yellow"
              leftSection={<IconPlayerStop size={16} />}
              onClick={handleStopTask}
              loading={isStoppingTask}
              disabled={isStoppingTask}
            >
              Stop Task
            </Button>
          )}
          
          <Button
            color="red"
            variant="outline"
            leftSection={<IconTrash size={16} />}
            onClick={handleDeleteTask}
            loading={isDeletingTask}
            disabled={isDeletingTask || task.status === 'running'}
          >
            Delete Task
          </Button>
        </Group>
      </Group>
      
      <Card mb="xl" withBorder padding="lg">
        <Group justify="space-between" mb="md">
          <div>
            <Text fw={700} size="xl">{task.name}</Text>
            {task.description && (
              <Text c="dimmed">{task.description}</Text>
            )}
          </div>
          
          <TaskStatusBadge status={task.status} />
        </Group>
        
        <Grid>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Stack gap="xs">
              <Group>
                <Text fw={500}>Recipe ID:</Text>
                <Text>{task.recipeId}</Text>
              </Group>
              
              <Group>
                <Text fw={500}>Task Type:</Text>
                <Badge color="blue" radius="sm" style={{ textTransform: 'capitalize' }}>
                  {task.taskType}
                </Badge>
              </Group>
              
              <Group>
                <IconClock size={16} />
                <Text size="sm">
                  Created {formatDistanceToNow(new Date(task.createdAt))} ago
                </Text>
              </Group>
              
              {task.startTime && (
                <Group>
                  <IconClock size={16} />
                  <Text size="sm">
                    Started {formatDistanceToNow(new Date(task.startTime))} ago
                  </Text>
                </Group>
              )}
              
              {task.endTime && (
                <Group>
                  <IconClock size={16} />
                  <Text size="sm">
                    Ended {formatDistanceToNow(new Date(task.endTime))} ago
                  </Text>
                </Group>
              )}
              
              {task.error && (
                <Text c="red" mt="xs">
                  Error: {task.error}
                </Text>
              )}
            </Stack>
          </Grid.Col>
          
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Card withBorder h="100%">
              <Group mb="sm">
                <IconDeviceDesktopAnalytics size={20} />
                <Text fw={500}>Progress</Text>
              </Group>
              
              <TaskProgress 
                progress={task.progress} 
                status={task.status} 
                size="lg" 
              />
              
              {task.metrics && task.metrics.processingFps && (
                <Group mt="md">
                  <Text size="sm" fw={500}>Processing Speed:</Text>
                  <Text size="sm">{task.metrics.processingFps.toFixed(1)} FPS</Text>
                </Group>
              )}
              
              {task.metrics && task.metrics.objectsCounted && (
                <Group mt="xs">
                  <Text size="sm" fw={500}>Objects Counted:</Text>
                  <Text size="sm">{task.metrics.objectsCounted}</Text>
                </Group>
              )}
            </Card>
          </Grid.Col>
        </Grid>
      </Card>
      
      <Grid gutter="xl">
        <Grid.Col span={{ base: 12, md: 7 }}>
          <TaskVideoStream task={task} />
        </Grid.Col>
        
        <Grid.Col span={{ base: 12, md: 5 }}>
          <TaskMetricsCard metrics={task.metrics} />
        </Grid.Col>
      </Grid>
    </div>
  );
}