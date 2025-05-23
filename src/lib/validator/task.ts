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
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  recipeId: z.string(),
  taskType: taskTypeSchema,
  status: taskStatusSchema,
  progress: z.number().min(0).max(100),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  videoUrl: z.string().optional(),
  videoStreamUrl: z.string().optional(),
  metrics: z.record(z.any()).optional(),
  error: z.string().optional(),
  createdAt: z.string()
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