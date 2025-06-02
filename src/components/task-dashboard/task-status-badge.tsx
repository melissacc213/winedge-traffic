import type { BadgeProps } from "@mantine/core";
import { Badge } from "@mantine/core";

import type { TaskStatus } from "@/lib/validator/task";

interface TaskStatusBadgeProps {
  status: TaskStatus;
  size?: BadgeProps["size"];
}

export function TaskStatusBadge({ status, size = "md" }: TaskStatusBadgeProps) {
  const getColorAndLabel = (): {
    color: BadgeProps["color"];
    label: string;
  } => {
    switch (status) {
      case "pending":
        return { color: "gray", label: "Pending" };
      case "running":
        return { color: "blue", label: "Running" };
      case "completed":
        return { color: "green", label: "Completed" };
      case "failed":
        return { color: "red", label: "Failed" };
      case "stopped":
        return { color: "orange", label: "Stopped" };
      default:
        return { color: "gray", label: "Unknown" };
    }
  };

  const { color, label } = getColorAndLabel();

  return (
    <Badge color={color} size={size} radius="sm">
      {label}
    </Badge>
  );
}
