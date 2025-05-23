import { SimpleGrid, Text, Center, Loader, Button, Group } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconPlayerPlay } from "@tabler/icons-react";
import { useState } from "react";
import { useStartTask, useTasks } from "../../lib/queries/task";
import type { Task } from "../../types/task";
import { TaskCard } from "./task-card";
import { useRecipes } from "../../lib/queries/recipe";

export function TaskGrid() {
  const { data: tasks, isLoading, error } = useTasks();
  const [selectedRecipe, setSelectedRecipe] = useState<string | null>(null);
  const { data: recipes } = useRecipes();
  const { mutate: startTask, isPending: isStartingTask } = useStartTask();

  const handleStartTask = () => {
    if (!selectedRecipe) {
      notifications.show({
        title: "Recipe required",
        message: "Please select a recipe to start a task",
        color: "red",
      });
      return;
    }

    startTask(selectedRecipe, {
      onSuccess: () => {
        notifications.show({
          title: "Task started",
          message: "The task has been started successfully",
          color: "green",
        });
        setSelectedRecipe(null);
      },
      onError: (error) => {
        notifications.show({
          title: "Error starting task",
          message: error instanceof Error ? error.message : "An error occurred",
          color: "red",
        });
      },
    });
  };

  if (isLoading) {
    return (
      <Center style={{ height: 200 }}>
        <Loader size="md" />
      </Center>
    );
  }

  if (error) {
    return (
      <Center style={{ height: 200 }}>
        <Text c="red">
          Error loading tasks:{" "}
          {error instanceof Error ? error.message : "Unknown error"}
        </Text>
      </Center>
    );
  }

  if (!tasks || tasks.length === 0) {
    return (
      <Center style={{ height: 200, flexDirection: "column" }}>
        <Text c="dimmed" mb="md">
          No tasks found
        </Text>
        {recipes && recipes.length > 0 && (
          <Button
            leftSection={<IconPlayerPlay size={16} />}
            onClick={handleStartTask}
            disabled={isStartingTask || !selectedRecipe}
          >
            Start New Task
          </Button>
        )}
      </Center>
    );
  }

  // Group tasks by status for better organization
  const groupedTasks: Record<string, Task[]> = {
    running: tasks.filter((task) => task.status === "running"),
    pending: tasks.filter((task) => task.status === "pending"),
    completed: tasks.filter((task) => task.status === "completed"),
    stopped: tasks.filter((task) => task.status === "stopped"),
    failed: tasks.filter((task) => task.status === "failed"),
  };

  // Order for displaying tasks: running, queued, completed, cancelled, failed
  const displayOrder = ["running", "pending", "completed", "stopped", "failed"];
  const orderedTasks = displayOrder.flatMap(
    (status) => groupedTasks[status] || []
  );

  return (
    <div>
      <Group justify="flex-end" mb="md">
        {recipes && recipes.length > 0 && (
          <Button
            leftSection={<IconPlayerPlay size={16} />}
            onClick={handleStartTask}
            loading={isStartingTask}
            disabled={isStartingTask || !selectedRecipe}
          >
            Start New Task
          </Button>
        )}
      </Group>

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
        {orderedTasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </SimpleGrid>
    </div>
  );
}
