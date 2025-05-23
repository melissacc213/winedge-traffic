import { Menu, ActionIcon, Text } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { modals } from "../../lib/modal";
import {
  IconDots,
  IconPlayerPlay,
  IconPlayerStop,
  IconTrash,
  IconFileAnalytics,
  IconInfoCircle,
} from "@tabler/icons-react";
import { useStopTask, useDeleteTask } from "../../lib/queries/task";
import type { Task } from "@/lib/validator/task";

interface TaskActionMenuProps {
  task: Task;
  onViewDetails?: () => void;
  onViewMetrics?: () => void;
}

export function TaskActionMenu({
  task,
  onViewDetails,
  onViewMetrics,
}: TaskActionMenuProps) {
  const { mutate: stopTask, isPending: isStoppingTask } = useStopTask();
  const { mutate: deleteTask, isPending: isDeletingTask } = useDeleteTask();

  const handleStopTask = () => {
    modals.openConfirmModal({
      title: "Stop task",
      children: (
        <Text size="sm">
          Are you sure you want to stop "{task.name}"? This will halt all
          processing.
        </Text>
      ),
      labels: { confirm: "Stop task", cancel: "Cancel" },
      confirmProps: { color: "yellow" },
      onConfirm: () => {
        stopTask(task.id, {
          onSuccess: () => {
            notifications.show({
              title: "Task stopped",
              message: `Task "${task.name}" has been stopped successfully`,
              color: "yellow",
            });
          },
          onError: (error) => {
            notifications.show({
              title: "Error stopping task",
              message:
                error instanceof Error ? error.message : "An error occurred",
              color: "red",
            });
          },
        });
      },
    });
  };

  const handleDeleteTask = () => {
    modals.openConfirmModal({
      title: "Delete task",
      children: (
        <Text size="sm">
          Are you sure you want to delete "{task.name}"? This cannot be undone.
        </Text>
      ),
      labels: { confirm: "Delete task", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: () => {
        deleteTask(task.id, {
          onSuccess: () => {
            notifications.show({
              title: "Task deleted",
              message: `Task "${task.name}" has been deleted successfully`,
              color: "green",
            });
          },
          onError: (error) => {
            notifications.show({
              title: "Error deleting task",
              message:
                error instanceof Error ? error.message : "An error occurred",
              color: "red",
            });
          },
        });
      },
    });
  };

  return (
    <Menu shadow="md" width={200} position="bottom-end">
      <Menu.Target>
        <ActionIcon variant="subtle" aria-label="More options">
          <IconDots size={16} />
        </ActionIcon>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Label>Task actions</Menu.Label>

        {task.status === "pending" && (
          <Menu.Item
            leftSection={<IconPlayerPlay size={16} />}
            disabled={true} // In a real app, this would start a pending task
          >
            Start task
          </Menu.Item>
        )}

        {task.status === "running" && (
          <Menu.Item
            leftSection={<IconPlayerStop size={16} />}
            onClick={handleStopTask}
            disabled={isStoppingTask}
            color="yellow"
          >
            Stop task
          </Menu.Item>
        )}

        <Menu.Item
          leftSection={<IconInfoCircle size={16} />}
          onClick={onViewDetails}
        >
          View details
        </Menu.Item>

        <Menu.Item
          leftSection={<IconFileAnalytics size={16} />}
          onClick={onViewMetrics}
          disabled={!["completed", "cancelled"].includes(task.status)}
        >
          View metrics
        </Menu.Item>

        <Menu.Divider />

        <Menu.Item
          leftSection={<IconTrash size={16} />}
          onClick={handleDeleteTask}
          disabled={isDeletingTask || task.status === "running"}
          color="red"
        >
          Delete task
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
