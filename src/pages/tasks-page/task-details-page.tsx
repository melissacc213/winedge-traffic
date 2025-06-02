import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Center,
  Group,
  Loader,
  Paper,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { useComputedColorScheme,useMantineTheme } from '@mantine/core';
import { notifications } from "@mantine/notifications";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate,useParams } from "react-router-dom";

import { Icons } from "@/components/icons";
import { TaskProgress } from "@/components/task-dashboard/task-progress";
import { TaskStatusBadge } from "@/components/task-dashboard/task-status-badge";
import { TaskVideoStream } from "@/components/task-video-stream";
import { taskService } from "@/lib/api/task-service";
import { modals } from "@/lib/modal";
import {
  useDeleteTask,
  useStartTask,
  useStopTask,
  useTask,
} from "@/lib/queries/task";
import { useTaskStore } from "@/lib/store/task-store";
import { formatDistanceToNow, getTaskTypeColor } from "@/lib/utils";

export function TaskDetailsPage() {
  const { t } = useTranslation(["tasks", "common"]);
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const theme = useMantineTheme();
  const computedColorScheme = useComputedColorScheme();
  const isDark = computedColorScheme === 'dark';
  const { selectTask } = useTaskStore();
  const { data: task, isLoading, error, refetch } = useTask(taskId || "");
  const { mutate: stopTask, isPending: isStoppingTask } = useStopTask();
  const { mutate: deleteTask, isPending: isDeletingTask } = useDeleteTask();
  const { isPending: isStartingTask } = useStartTask();

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
        color: "green",
        message: t("tasks:notifications.taskStartedMessage", {
          name: task.name,
        }),
        title: t("tasks:notifications.taskStarted"),
      });
      refetch();
    } catch (error) {
      notifications.show({
        color: "red",
        message:
          error instanceof Error ? error.message : t("common:errorOccurred"),
        title: t("tasks:notifications.taskStartError"),
      });
    }
  };

  const handleRestartTask = async () => {
    if (!task) return;

    try {
      // In a real implementation, this would call a restart API endpoint
      await taskService.startTask(task.id);
      notifications.show({
        color: "blue",
        message: `${task.name} has been restarted`,
        title: "Task Restarted",
      });
      refetch();
    } catch (error) {
      notifications.show({
        color: "red",
        message:
          error instanceof Error ? error.message : t("common:errorOccurred"),
        title: "Restart Failed",
      });
    }
  };

  const handleStopTask = () => {
    if (!task) return;

    modals.openConfirmModal({
      children: (
        <Text size="sm">
          {t("tasks:modals.stopTask.message", { name: task.name })}
        </Text>
      ),
      confirmProps: { color: "yellow" },
      labels: {
        cancel: t("common:cancel"),
        confirm: t("tasks:modals.stopTask.confirm"),
      },
      onConfirm: () => {
        stopTask(task.id, {
          onError: (error) => {
            notifications.show({
              color: "red",
              message:
                error instanceof Error
                  ? error.message
                  : t("common:errorOccurred"),
              title: t("tasks:notifications.taskStopError"),
            });
          },
          onSuccess: () => {
            notifications.show({
              color: "yellow",
              message: t("tasks:notifications.taskStoppedMessage", {
                name: task.name,
              }),
              title: t("tasks:notifications.taskStopped"),
            });
          },
        });
      },
      title: t("tasks:modals.stopTask.title"),
    });
  };

  const handleDeleteTask = () => {
    if (!task) return;

    modals.openConfirmModal({
      children: (
        <Text size="sm">
          {t("tasks:modals.deleteTask.message", { name: task.name })}
        </Text>
      ),
      confirmProps: { color: "red" },
      labels: {
        cancel: t("common:cancel"),
        confirm: t("tasks:modals.deleteTask.confirm"),
      },
      onConfirm: () => {
        deleteTask(task.id, {
          onError: (error) => {
            notifications.show({
              color: "red",
              message:
                error instanceof Error
                  ? error.message
                  : t("common:errorOccurred"),
              title: t("tasks:notifications.taskDeleteError"),
            });
          },
          onSuccess: () => {
            notifications.show({
              color: "green",
              message: t("tasks:notifications.taskDeletedMessage", {
                name: task.name,
              }),
              title: t("tasks:notifications.taskDeleted"),
            });
            navigate("/tasks");
          },
        });
      },
      title: t("tasks:modals.deleteTask.title"),
    });
  };

  if (isLoading) {
    return (
      <div style={{ padding: "2rem" }}>
        <Center style={{ height: 300 }}>
          <Loader size="md" />
        </Center>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div style={{ padding: "2rem" }}>
        <Center style={{ flexDirection: "column", height: 300 }}>
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
    <div
      style={{
        margin: "0 auto",
        maxWidth: "1200px",
        minHeight: "100vh",
        padding: "1rem",
      }}
    >
      {/* Page Header */}
      <Paper
        p="lg"
        radius="md"
        withBorder
        mb="lg"
        style={{
          backgroundColor: isDark
            ? theme.colors.dark?.[8] || theme.colors.gray[9]
            : theme.white,
          borderColor: isDark
            ? theme.colors.dark?.[5] || theme.colors.gray[6]
            : theme.colors.gray[2],
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
                  <Title order={1} size="h2">
                    {task.name}
                  </Title>
                  <TaskStatusBadge status={task.status} size="lg" />
                </Group>
                <Group gap="md">
                  <Badge
                    size="md"
                    color={getTaskTypeColor(
                      task.resultType || "trafficStatistics"
                    )}
                    variant="light"
                  >
                    {task.resultType === "trainDetection"
                      ? "Train Detection"
                      : "Traffic Statistics"}
                  </Badge>
                  <Text size="sm" c="dimmed">
                    Created {formatDistanceToNow(new Date(task.createdAt))} ago
                  </Text>
                  {task.startedAt && (
                    <Text size="sm" c="dimmed">
                      • Started {formatDistanceToNow(new Date(task.startedAt))}{" "}
                      ago
                    </Text>
                  )}
                </Group>
                {task.description && (
                  <Text
                    size="sm"
                    c="dimmed"
                    mt="xs"
                    style={{ maxWidth: "600px" }}
                  >
                    {task.description}
                  </Text>
                )}
              </div>
            </Group>

            <Group gap="sm">
              {task.status === "pending" && (
                <Button
                  variant="outline"
                  leftSection={<Icons.Edit size={16} />}
                  onClick={() => navigate(`/tasks/${taskId}/edit`)}
                  size="md"
                >
                  {t("tasks:action.edit")}
                </Button>
              )}

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

              {(task.status === "completed" ||
                task.status === "failed" ||
                task.status === "stopped") && (
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
                <Text size="sm" fw={500}>
                  Progress
                </Text>
                <Text size="sm" c="dimmed" fw={500}>
                  {Math.round(task.progress)}% complete
                </Text>
              </Group>
              <TaskProgress
                progress={task.progress}
                status={task.status}
                size="lg"
                showLabel={false}
              />
            </div>
          )}
        </Stack>
      </Paper>

      {/* Main Content - Full Width */}
      {task.status === "running" ? (
        <TaskVideoStream task={task} />
      ) : (
        <Card p="xl" radius="md" withBorder style={{ height: "500px" }}>
          <Center style={{ flexDirection: "column", height: "100%" }}>
            <Icons.Video size={72} style={{ opacity: 0.3 }} />
            <Text size="xl" fw={600} c="dimmed" mt="lg" ta="center">
              {task.status === "pending" &&
                "Video will appear when task starts"}
              {task.status === "failed" && "Task failed - no video available"}
              {task.status === "completed" &&
                "Task completed - video stream ended"}
              {task.status === "stopped" && "Task stopped - video stream ended"}
            </Text>
            <Text
              size="md"
              c="dimmed"
              mt="sm"
              ta="center"
              style={{ maxWidth: "500px" }}
            >
              {task.status === "pending" &&
                "Click the Start button above to begin processing"}
              {task.status === "failed" &&
                "Check the task logs for error details"}
              {task.status === "completed" &&
                "Task completed successfully. You can restart to run again."}
              {task.status === "stopped" &&
                "Task was manually stopped. You can restart to continue."}
            </Text>
          </Center>
        </Card>
      )}
    </div>
  );
}
