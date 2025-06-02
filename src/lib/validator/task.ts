import z from 'zod';

import { taskTypeSchema } from './recipe';

export const taskStatusSchema = z.enum([
  'pending',
  'running',
  'completed',
  'failed',
  'stopped'
]);

export type TaskStatus = z.infer<typeof taskStatusSchema>;

export const taskSchema = z.object({
  createdAt: z.string(),
  description: z.string().optional(),
  endTime: z.string().optional(),
  error: z.string().optional(),
  id: z.string(),
  metrics: z.record(z.any()).optional(),
  name: z.string(),
  progress: z.number().min(0).max(100),
  recipeId: z.string(),
  startTime: z.string().optional(),
  status: taskStatusSchema,
  taskType: taskTypeSchema,
  videoStreamUrl: z.string().optional(),
  videoUrl: z.string().optional()
});

export type Task = z.infer<typeof taskSchema>;

export const tasksListSchema = z.array(taskSchema);
export type TasksListResponse = z.infer<typeof tasksListSchema>;

export interface TaskMetrics {
  objectsCounted?: number;
  detectionRate?: number;
  processingFps?: number;
  totalObjects?: Record<string, number>;
}