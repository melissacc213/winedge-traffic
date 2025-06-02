import type { Task } from "@/types/task";
import { TaskForm } from "./task-form";

interface TaskCreationFormProps {
  editTask?: Task;
}

export function TaskCreationForm({ editTask }: TaskCreationFormProps) {
  if (editTask) {
    return <TaskForm mode="edit" task={editTask} />;
  }
  
  return <TaskForm mode="create" />;
}