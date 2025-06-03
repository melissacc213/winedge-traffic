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

export const taskPrioritySchema = z.enum(['low', 'medium', 'high']);

export const taskSchema = z.object({
  createdAt: z.string(),
  description: z.string().optional(),
  endTime: z.string().optional(),
  error: z.string().optional(),
  id: z.string(),
  localPath: z.string().optional(),
  metrics: z.record(z.any()).optional(),
  name: z.string(),
  priority: taskPrioritySchema.optional().default('medium'),
  progress: z.number().min(0).max(100),
  recipeId: z.string(),
  recipeName: z.string().optional(),
  resultType: taskTypeSchema.optional(),
  startTime: z.string().optional(),
  startedAt: z.string().optional(),
  completedAt: z.string().optional(),
  status: taskStatusSchema,
  taskType: taskTypeSchema,
  userId: z.string().optional().default('user-1'),
  userName: z.string().optional(),
  videoId: z.string().optional(),
  videoName: z.string().optional(),
  videoStreamUrl: z.string().optional(),
  videoUrl: z.string().optional(),
  resultsCount: z.number().optional(),
  thumbnail: z.string().optional(),
  duration: z.number().optional()
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