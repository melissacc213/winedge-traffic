import type { TaskType } from "./recipe";

export interface Recipe {
  id: string;
  name: string;
  description?: string;
  taskType: TaskType;
  status: "active" | "inactive" | "error";
  regions: Array<{
    id: string;
    name: string;
    points: Array<{ x: number; y: number }>;
  }>;
  modelId: string;
  confidenceThreshold: number;
  createdAt: string;
}

export interface CreateTaskRequest {
  name: string;
  description?: string;
  priority: "low" | "medium" | "high";
  recipeId: string;
  localPath: string;
  taskType: TaskType;
}
