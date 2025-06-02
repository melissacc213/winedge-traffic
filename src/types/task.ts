// Task types
export type TaskStatus =
  | "pending"
  | "running"
  | "completed"
  | "failed"
  | "stopped";

// Task priority
export type TaskPriority = "low" | "medium" | "high";

// Task result types
export type TaskResultType =
  | "trafficStatistics"
  | "trainDetection";

// Basic task interface
export interface Task {
  id: string;
  name: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  progress: number; // 0-100
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  startTime?: string; // Alternative naming for startedAt
  endTime?: string; // Alternative naming for completedAt
  duration?: number; // in seconds
  recipeId: string;
  recipeName?: string;
  resultType: TaskResultType;
  taskType: TaskResultType; // Added for compatibility
  videoId?: string;
  videoName?: string;
  resultsCount?: number; // Number of objects detected/counted
  thumbnail?: string;
  error?: string;
  userId: string;
  userName?: string;
  metrics?: Record<string, any>; // Added for task metrics
}

// Task statistics interface
export interface TaskStats {
  total: number;
  queued: number;
  running: number;
  completed: number;
  failed: number;
  cancelled: number;
}

// Task filter interface
export interface TaskFilter {
  status?: TaskStatus[];
  priority?: TaskPriority[];
  dateRange?: {
    from: Date;
    to: Date;
  };
  search?: string;
  userId?: string;
}

// Task creation/submission parameters
export interface TaskSubmission {
  name: string;
  description?: string;
  priority: TaskPriority;
  recipeId: string;
  videoId?: string;
}

// Task update parameters
export interface TaskUpdate {
  id: string;
  status?: TaskStatus;
  progress?: number;
  error?: string;
}
