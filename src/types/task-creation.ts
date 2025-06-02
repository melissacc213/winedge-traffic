import type { Region,TaskType } from "./recipe";

export interface Recipe {
  id: string;
  name: string;
  description?: string;
  taskType: TaskType;
  status: "active" | "inactive" | "error";
  regions: Region[];
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
