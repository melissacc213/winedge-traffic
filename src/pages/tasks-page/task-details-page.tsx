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
import { PageLayout } from "@/components/page-layout/page-layout";
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
import { formatDistanceToNow } from "@/lib/utils";
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
      const updatedTask = await taskService.startTask(task.id);
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
      <PageLayout
        title={t("tasks:taskDetails")}
        description={t("tasks:taskDetailsDescription")}
      >
        <Center style={{ height: 300 }}>
          <Loader size="md" />
        </Center>
      </PageLayout>
    );
  }

  if (error || !task) {
    return (
      <PageLayout
        title={t("tasks:taskDetails")}
        description={t("tasks:taskDetailsDescription")}
      >
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
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title={task.name}
      description={task.description || t("tasks:taskDetailsDescription")}
      actions={
        <Group>
          {/* <Tooltip label={t('tasks:refreshTaskData')}>
            <ActionIcon
              variant="subtle"
              aria-label="Refresh"
              onClick={() => refetch()}
            >
              <Icons.Refresh size={16} />
            </ActionIcon>
          </Tooltip> */}

          {(task.status === "pending" || task.status === "failed") && (
            <Button
              color="green"
              leftSection={<Icons.PlayerPlay size={16} />}
              onClick={handleStartTask}
              loading={isStartingTask}
              disabled={isStartingTask}
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
              disabled={isStoppingTask}
            >
              {t("tasks:stopTask")}
            </Button>
          )}

          <Button
            color="red"
            variant="outline"
            leftSection={<Icons.Trash size={16} />}
            onClick={handleDeleteTask}
            loading={isDeletingTask}
            disabled={isDeletingTask || task.status === "running"}
          >
            {t("tasks:deleteTask")}
          </Button>
        </Group>
      }
    >
      <Stack gap="lg">
        {/* Task Status and Info Card */}
        <Card p="lg" radius="md" withBorder>
          <Group justify="space-between" mb="md">
            <div>
              <Title order={3}>{t("tasks:taskInformation")}</Title>
            </div>
            <TaskStatusBadge status={task.status} />
          </Group>

          <Grid>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Stack gap="xs">
                <Group>
                  <Text fw={500}>{t("tasks:recipeId")}:</Text>
                  <Text>{task.recipeId}</Text>
                </Group>

                <Group>
                  <Text fw={500}>{t("tasks:taskType")}:</Text>
                  <Badge
                    color="blue"
                    radius="sm"
                    style={{ textTransform: "capitalize" }}
                  >
                    {t(
                      `tasks:taskTypes.${task.resultType || "trafficStatistics"}`
                    )}
                  </Badge>
                </Group>

                <Group>
                  <Icons.Clock size={16} />
                  <Text size="sm">
                    {t("tasks:createdAgo", {
                      time: formatDistanceToNow(new Date(task.createdAt)),
                    })}
                  </Text>
                </Group>

                {task.startedAt && (
                  <Group>
                    <Icons.Clock size={16} />
                    <Text size="sm">
                      {t("tasks:startedAgo", {
                        time: formatDistanceToNow(new Date(task.startedAt)),
                      })}
                    </Text>
                  </Group>
                )}

                {task.completedAt && (
                  <Group>
                    <Icons.Clock size={16} />
                    <Text size="sm">
                      {t("tasks:endedAgo", {
                        time: formatDistanceToNow(new Date(task.completedAt)),
                      })}
                    </Text>
                  </Group>
                )}

                {task.error && (
                  <Text c="red" mt="xs">
                    {t("tasks:error")}: {task.error}
                  </Text>
                )}
              </Stack>
            </Grid.Col>

            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Paper
                p="md"
                radius="md"
                withBorder
                h="100%"
                style={{
                  backgroundColor: isDark
                    ? theme.colors.dark[7]
                    : theme.colors.gray[0],
                }}
              >
                <Group mb="sm">
                  <Icons.ChartBar size={20} />
                  <Text fw={500}>{t("tasks:progress")}</Text>
                </Group>

                <TaskProgress
                  progress={task.progress}
                  status={task.status}
                  size="lg"
                />

                {mockMetrics && mockMetrics.processingFps && (
                  <Group mt="md">
                    <Text size="sm" fw={500}>
                      {t("tasks:processingSpeed")}:
                    </Text>
                    <Text size="sm">
                      {mockMetrics.processingFps.toFixed(1)} FPS
                    </Text>
                  </Group>
                )}

                {mockMetrics && mockMetrics.objectsCounted && (
                  <Group mt="xs">
                    <Text size="sm" fw={500}>
                      {t("tasks:objectsCounted")}:
                    </Text>
                    <Text size="sm">{mockMetrics.objectsCounted}</Text>
                  </Group>
                )}
              </Paper>
            </Grid.Col>
          </Grid>
        </Card>

        {/* Video Stream and Metrics */}
        <Grid gutter="lg">
          <Grid.Col span={{ base: 12, md: task.status === "running" ? 7 : 12 }}>
            {/* Show video stream when task is running */}
            {task.status === "running" ? (
              <TaskVideoStream task={task} />
            ) : (
              <Card p="lg" radius="md" withBorder>
                <Center style={{ height: 400, flexDirection: "column" }}>
                  <Icons.Video size={64} style={{ opacity: 0.3 }} />
                  <Text size="lg" c="dimmed" mt="md">
                    {task.status === "pending" &&
                      t("tasks:videoWillAppearWhenStarted")}
                    {task.status === "failed" && t("tasks:taskFailedNoVideo")}
                    {task.status === "completed" &&
                      t("tasks:taskCompletedVideoEnded")}
                    {task.status === "stopped" &&
                      t("tasks:taskStoppedVideoEnded")}
                  </Text>
                </Center>
              </Card>
            )}
          </Grid.Col>

          {task.status === "running" && mockMetrics && (
            <Grid.Col span={{ base: 12, md: 5 }}>
              <TaskMetricsCard metrics={mockMetrics} />
            </Grid.Col>
          )}
        </Grid>
      </Stack>
    </PageLayout>
  );
}
