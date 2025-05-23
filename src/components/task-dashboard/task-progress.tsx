import type { TaskStatus } from "@/lib/validator/task";
import { Progress, Text, Group, rem } from "@mantine/core";

interface TaskProgressProps {
  progress: number;
  status: TaskStatus;
  showLabel?: boolean;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
}

export function TaskProgress({
  progress,
  status,
  showLabel = true,
  size = "md",
}: TaskProgressProps) {
  const getColorAndLabel = () => {
    switch (status) {
      case "pending":
        return { color: "gray", label: "Pending" };
      case "running":
        return { color: "blue", label: `Processing: ${progress}%` };
      case "completed":
        return { color: "green", label: "Completed" };
      case "failed":
        return { color: "red", label: `Failed at ${progress}%` };
      case "stopped":
        return { color: "yellow", label: `Stopped at ${progress}%` };
      default:
        return { color: "gray", label: `${progress}%` };
    }
  };

  const { color, label } = getColorAndLabel();

  return (
    <div>
      <Group
        justify="space-between"
        mb={rem(5)}
        style={{ display: showLabel ? "flex" : "none" }}
      >
        <Text size="xs" fw={500}>
          {label}
        </Text>
        <Text size="xs" c="dimmed">
          {progress}%
        </Text>
      </Group>
      <Progress
        value={progress}
        color={color}
        size={size}
        radius="sm"
        animated={status === "running"}
        striped={status === "running"}
      />
    </div>
  );
}
