import { useCallback } from "react";
import { useTranslation } from "react-i18next";

import { useCancelTask, useDeleteTask,useTasks } from "../../lib/queries/task";
import type { TaskFilter } from "../../types/task";
import { TaskTable } from "./task-table";

// TaskList component props
interface TaskListProps {
  filter?: TaskFilter;
}

export function TaskList({ filter }: TaskListProps) {
  const { t } = useTranslation(["tasks", "common"]);
  const { data: tasks = [], isLoading } = useTasks(filter);
  const cancelTaskMutation = useCancelTask();
  const deleteTaskMutation = useDeleteTask();
  
  // Task actions
  const handleCancelTask = useCallback((taskId: string) => {
    if (window.confirm(t("common:confirm.cancelTask"))) {
      cancelTaskMutation.mutate(taskId);
    }
  }, [cancelTaskMutation, t]);

  const handleDeleteTask = useCallback((taskId: string) => {
    if (window.confirm(t("common:confirm.deleteTask"))) {
      deleteTaskMutation.mutate(taskId);
    }
  }, [deleteTaskMutation, t]);

  return (
    <TaskTable 
      tasks={tasks} 
      isLoading={isLoading} 
      onCancel={handleCancelTask} 
      onDelete={handleDeleteTask} 
    />
  );
}