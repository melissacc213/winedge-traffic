import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Grid,
  Text,
  Group,
  Stack,
  Button,
  ActionIcon,
  Tooltip,
  Loader,
  Center,
  Title,
  Badge,
  Paper,
} from "@mantine/core";
import { useTranslation } from "react-i18next";
import { modals } from "@/lib/modal";
import { notifications } from "@mantine/notifications";
import { Icons } from "@/components/icons";
import {
  useTask,
  useStopTask,
  useDeleteTask,
  useStartTask,
} from "@/lib/queries/task";
import { useTaskStore } from "@/lib/store/task-store";
import { TaskStatusBadge } from "@/components/task-dashboard/task-status-badge";
import { TaskProgress } from "@/components/task-dashboard/task-progress";
import { TaskVideoStream } from "@/components/task-video-stream";
import { TaskMetricsCard } from "@/components/task-dashboard/task-metrics-card";
import { CompactTaskControl } from "@/components/task-control";
import { formatDistanceToNow, getTaskTypeColor } from "@/lib/utils";
import { taskService } from "@/lib/api/task-service";
import { useTheme } from "@/providers/theme-provider";
import type { TaskMetrics } from "@/types/task-metrics";

export function TaskDetailsPage() {
  const { t } = useTranslation(["tasks", "common"]);
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const { theme, colorScheme } = useTheme();
  const isDark = colorScheme === "dark";
  const { selectTask } = useTaskStore();
  const { data: task, isLoading, error, refetch } = useTask(taskId || "");
  const { mutate: stopTask, isPending: isStoppingTask } = useStopTask();
  const { mutate: deleteTask, isPending: isDeletingTask } = useDeleteTask();
  const { mutate: startTaskMutation, isPending: isStartingTask } =
    useStartTask();

  // Generate mock metrics for running tasks
  const mockMetrics: TaskMetrics | undefined =
    task?.status === "running"
      ? {
          processingFps: 24.5 + Math.random() * 5,
          objectsCounted: Math.floor(Math.random() * 1000) + 100,
          totalFrames: 10000,
          processedFrames: Math.floor(task.progress * 100),
          avgConfidence: 0.75 + Math.random() * 0.2,
          detectionCounts: {
            car: Math.floor(Math.random() * 500) + 50,
            truck: Math.floor(Math.random() * 200) + 20,
            bus: Math.floor(Math.random() * 100) + 10,
            motorcycle: Math.floor(Math.random() * 150) + 15,
          },
          cpuUsage: 45 + Math.random() * 30,
          memoryUsage: 60 + Math.random() * 20,
          lastUpdated: new Date().toISOString(),
        }
      : undefined;

  useEffect(() => {
    if (task) {
      selectTask(task.id);
    }

    return () => {
      selectTask(null);
    };
  }, [task, selectTask]);

  const handleBack = () => {
    navigate("/tasks");
  };

  const handleStartTask = async () => {
    if (!task) return;

    try {
      await taskService.startTask(task.id);
      notifications.show({
        title: t("tasks:notifications.taskStarted"),
        message: t("tasks:notifications.taskStartedMessage", {
          name: task.name,
        }),
        color: "green",
      });
      refetch();
    } catch (error) {
      notifications.show({
        title: t("tasks:notifications.taskStartError"),
        message:
          error instanceof Error ? error.message : t("common:errorOccurred"),
        color: "red",
      });
    }
  };

  const handleRestartTask = async () => {
    if (!task) return;

    try {
      // In a real implementation, this would call a restart API endpoint
      await taskService.startTask(task.id);
      notifications.show({
        title: "Task Restarted",
        message: `${task.name} has been restarted`,
        color: "blue",
      });
      refetch();
    } catch (error) {
      notifications.show({
        title: "Restart Failed",
        message:
          error instanceof Error ? error.message : t("common:errorOccurred"),
        color: "red",
      });
    }
  };

  const handleStopTask = () => {
    if (!task) return;

    modals.openConfirmModal({
      title: t("tasks:modals.stopTask.title"),
      children: (
        <Text size="sm">
          {t("tasks:modals.stopTask.message", { name: task.name })}
        </Text>
      ),
      labels: {
        confirm: t("tasks:modals.stopTask.confirm"),
        cancel: t("common:cancel"),
      },
      confirmProps: { color: "yellow" },
      onConfirm: () => {
        stopTask(task.id, {
          onSuccess: () => {
            notifications.show({
              title: t("tasks:notifications.taskStopped"),
              message: t("tasks:notifications.taskStoppedMessage", {
                name: task.name,
              }),
              color: "yellow",
            });
          },
          onError: (error) => {
            notifications.show({
              title: t("tasks:notifications.taskStopError"),
              message:
                error instanceof Error
                  ? error.message
                  : t("common:errorOccurred"),
              color: "red",
            });
          },
        });
      },
    });
  };

  const handleDeleteTask = () => {
    if (!task) return;

    modals.openConfirmModal({
      title: t("tasks:modals.deleteTask.title"),
      children: (
        <Text size="sm">
          {t("tasks:modals.deleteTask.message", { name: task.name })}
        </Text>
      ),
      labels: {
        confirm: t("tasks:modals.deleteTask.confirm"),
        cancel: t("common:cancel"),
      },
      confirmProps: { color: "red" },
      onConfirm: () => {
        deleteTask(task.id, {
          onSuccess: () => {
            notifications.show({
              title: t("tasks:notifications.taskDeleted"),
              message: t("tasks:notifications.taskDeletedMessage", {
                name: task.name,
              }),
              color: "green",
            });
            navigate("/tasks");
          },
          onError: (error) => {
            notifications.show({
              title: t("tasks:notifications.taskDeleteError"),
              message:
                error instanceof Error
                  ? error.message
                  : t("common:errorOccurred"),
              color: "red",
            });
          },
        });
      },
    });
  };

  if (isLoading) {
    return (
      <div style={{ padding: '2rem' }}>
        <Center style={{ height: 300 }}>
          <Loader size="md" />
        </Center>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div style={{ padding: '2rem' }}>
        <Center style={{ height: 300, flexDirection: "column" }}>
          <Text c="red" mb="md">
            {error instanceof Error ? error.message : t("tasks:taskNotFound")}
          </Text>
          <Button
            variant="outline"
            leftSection={<Icons.ArrowLeft size={16} />}
            onClick={handleBack}
          >
            {t("tasks:backToTasks")}
          </Button>
        </Center>
      </div>
    );
  }

  return (
    <div style={{ padding: '1rem', maxWidth: '1200px', margin: '0 auto', minHeight: '100vh' }}>
      {/* Page Header */}
      <Paper 
        p="lg" 
        radius="md" 
        withBorder 
        mb="lg"
        style={{
          backgroundColor: isDark ? theme.colors.dark[8] : theme.white,
          borderColor: isDark ? theme.colors.dark[5] : theme.colors.gray[2],
        }}
      >
        <Stack gap="md">
          {/* Top Row: Navigation and Actions */}
          <Group justify="space-between" align="flex-start">
            <Group gap="md">
              <ActionIcon
                variant="subtle"
                color="gray"
                size="xl"
                onClick={handleBack}
              >
                <Icons.ArrowLeft size={24} />
              </ActionIcon>
              <div>
                <Group gap="sm" mb="xs">
                  <Title order={1} size="h2">{task.name}</Title>
                  <TaskStatusBadge status={task.status} size="lg" />
                </Group>
                <Group gap="md">
                  <Badge
                    size="md"
                    color={getTaskTypeColor(task.resultType || "trafficStatistics")}
                    variant="light"
                  >
                    {task.resultType === "trainDetection" ? "Train Detection" : "Traffic Statistics"}
                  </Badge>
                  <Text size="sm" c="dimmed">
                    Created {formatDistanceToNow(new Date(task.createdAt))} ago
                  </Text>
                  {task.startedAt && (
                    <Text size="sm" c="dimmed">
                      • Started {formatDistanceToNow(new Date(task.startedAt))} ago
                    </Text>
                  )}
                </Group>
                {task.description && (
                  <Text size="sm" c="dimmed" mt="xs" style={{ maxWidth: '600px' }}>
                    {task.description}
                  </Text>
                )}
              </div>
            </Group>
            
            <Group gap="sm">
              {(task.status === "pending" || task.status === "failed") && (
                <Button
                  color="green"
                  leftSection={<Icons.PlayerPlay size={16} />}
                  onClick={handleStartTask}
                  loading={isStartingTask}
                  size="md"
                >
                  {t("tasks:startTask")}
                </Button>
              )}
              
              {task.status === "running" && (
                <Button
                  color="yellow"
                  leftSection={<Icons.PlayerStop size={16} />}
                  onClick={handleStopTask}
                  loading={isStoppingTask}
                  size="md"
                >
                  {t("tasks:stopTask")}
                </Button>
              )}
              
              {(task.status === "completed" || task.status === "failed" || task.status === "stopped") && (
                <Button
                  color="blue"
                  variant="outline"
                  leftSection={<Icons.Refresh size={16} />}
                  onClick={handleRestartTask}
                  loading={isStartingTask}
                  size="md"
                >
                  Restart
                </Button>
              )}
              
              <Button
                color="red"
                variant="outline"
                leftSection={<Icons.Trash size={16} />}
                onClick={handleDeleteTask}
                loading={isDeletingTask}
                disabled={isDeletingTask || task.status === "running"}
                size="md"
              >
                {t("tasks:deleteTask")}
              </Button>
            </Group>
          </Group>
          
          {/* Progress Bar (for active tasks) */}
          {(task.status === "running" || task.progress > 0) && (
            <div>
              <Group justify="space-between" mb="xs">
                <Text size="sm" fw={500}>Progress</Text>
                <Text size="sm" c="dimmed" fw={500}>
                  {Math.round(task.progress * 100)}% complete
                </Text>
              </Group>
              <TaskProgress 
                progress={task.progress * 100} 
                status={task.status}
                size="lg"
                showLabel={false}
              />
            </div>
          )}
        </Stack>
      </Paper>
      
      {/* Main Content Grid */}
      <Grid gutter="lg">
        {/* Left Column: Video/Stream */}
        <Grid.Col span={{ base: 12, lg: task.status === "running" ? 8 : 12 }}>
          {task.status === "running" ? (
            <TaskVideoStream task={task} />
          ) : (
            <Card p="xl" radius="md" withBorder style={{ height: '500px' }}>
              <Center style={{ height: '100%', flexDirection: "column" }}>
                <Icons.Video size={72} style={{ opacity: 0.3 }} />
                <Text size="xl" fw={600} c="dimmed" mt="lg" ta="center">
                  {task.status === "pending" && "Video will appear when task starts"}
                  {task.status === "failed" && "Task failed - no video available"}
                  {task.status === "completed" && "Task completed - video stream ended"}
                  {task.status === "stopped" && "Task stopped - video stream ended"}
                </Text>
                <Text size="md" c="dimmed" mt="sm" ta="center" style={{ maxWidth: '500px' }}>
                  {task.status === "pending" && "Click the Start button above to begin processing"}
                  {task.status === "failed" && "Check the task logs for error details"}
                  {task.status === "completed" && "Task completed successfully. You can restart to run again."}
                  {task.status === "stopped" && "Task was manually stopped. You can restart to continue."}
                </Text>
              </Center>
            </Card>
          )}
        </Grid.Col>
        
        {/* Right Column: Metrics (only when running) */}
        {task.status === "running" && mockMetrics && (
          <Grid.Col span={{ base: 12, lg: 4 }}>
            <TaskMetricsCard metrics={mockMetrics} />
          </Grid.Col>
        )}
        
        {/* Task Information Panel (when not running) */}
        {task.status !== "running" && (
          <Grid.Col span={12}>
            <Card p="lg" radius="md" withBorder>
              <Stack gap="md">
                <Group justify="space-between" align="center">
                  <Title order={3}>Task Information</Title>
                  <Group gap="xs">
                    <Badge variant="light" color="gray">
                      ID: {task.id.slice(0, 8)}
                    </Badge>
                    {task.recipeId && (
                      <Badge variant="light" color="blue">
                        Recipe: {task.recipeId.slice(0, 8)}
                      </Badge>
                    )}
                  </Group>
                </Group>
                
                <Grid>
                  <Grid.Col span={6}>
                    <Stack gap="xs">
                      <Text size="sm" fw={500} c="dimmed">Status</Text>
                      <TaskStatusBadge status={task.status} size="md" />
                    </Stack>
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <Stack gap="xs">
                      <Text size="sm" fw={500} c="dimmed">Task Type</Text>
                      <Badge
                        size="md"
                        color={getTaskTypeColor(task.resultType || "trafficStatistics")}
                        variant="light"
                      >
                        {task.resultType === "trainDetection" ? "Train Detection" : "Traffic Statistics"}
                      </Badge>
                    </Stack>
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <Stack gap="xs">
                      <Text size="sm" fw={500} c="dimmed">Created</Text>
                      <Text size="sm">{new Date(task.createdAt).toLocaleString()}</Text>
                    </Stack>
                  </Grid.Col>
                  {task.startedAt && (
                    <Grid.Col span={6}>
                      <Stack gap="xs">
                        <Text size="sm" fw={500} c="dimmed">Started</Text>
                        <Text size="sm">{new Date(task.startedAt).toLocaleString()}</Text>
                      </Stack>
                    </Grid.Col>
                  )}
                  {task.completedAt && (
                    <Grid.Col span={6}>
                      <Stack gap="xs">
                        <Text size="sm" fw={500} c="dimmed">Completed</Text>
                        <Text size="sm">{new Date(task.completedAt).toLocaleString()}</Text>
                      </Stack>
                    </Grid.Col>
                  )}
                  <Grid.Col span={6}>
                    <Stack gap="xs">
                      <Text size="sm" fw={500} c="dimmed">Priority</Text>
                      <Badge
                        size="sm"
                        color={task.priority === "high" ? "red" : task.priority === "medium" ? "yellow" : "gray"}
                        variant="light"
                      >
                        {task.priority}
                      </Badge>
                    </Stack>
                  </Grid.Col>
                </Grid>
                
                {task.description && (
                  <div>
                    <Text size="sm" fw={500} c="dimmed" mb="xs">Description</Text>
                    <Text size="sm">{task.description}</Text>
                  </div>
                )}
              </Stack>
            </Card>
          </Grid.Col>
        )}
      </Grid>
    </div>
  );
}
