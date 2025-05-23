import type { AxiosRequestConfig } from 'axios';
import { clients } from '../api';
import { taskSchema, tasksListSchema } from '../validator/task';

export const taskService = {
  async getTasks(config?: AxiosRequestConfig<unknown>) {
    // In production, this would call the actual API
    // const { data } = await clients.v1.private.get('/tasks', config);
    // return tasksListSchema.parse(data);

    // Mock implementation for development
    return getMockTasks();
  },

  async getTask(id: string, config?: AxiosRequestConfig<unknown>) {
    // In production, this would call the actual API
    // const { data } = await clients.v1.private.get(`/tasks/${id}`, config);
    // return taskSchema.parse(data);

    // Mock implementation for development
    const task = MOCK_TASKS.find(task => task.id === id);
    if (!task) throw new Error('Task not found');
    return taskSchema.parse(task);
  },

  async startTask(recipeId: string, config?: AxiosRequestConfig<unknown>) {
    // In production, this would call the actual API
    // const { data } = await clients.v1.private.post(`/tasks/start`, { recipeId }, config);
    // return taskSchema.parse(data);

    // Mock implementation for development
    const mockTask = createMockTask(recipeId);
    return taskSchema.parse(mockTask);
  },

  async stopTask(taskId: string, config?: AxiosRequestConfig<unknown>) {
    // In production, this would call the actual API
    // await clients.v1.private.post(`/tasks/${taskId}/stop`, undefined, config);
    // const { data } = await clients.v1.private.get(`/tasks/${taskId}`, config);
    // return taskSchema.parse(data);

    // Mock implementation for development
    const task = MOCK_TASKS.find(task => task.id === taskId);
    if (!task) throw new Error('Task not found');
    
    const updatedTask = {
      ...task,
      status: 'stopped',
      endTime: new Date().toISOString()
    };
    
    // Update the mock task
    const index = MOCK_TASKS.findIndex(t => t.id === taskId);
    if (index !== -1) {
      MOCK_TASKS[index] = updatedTask;
    }
    
    return taskSchema.parse(updatedTask);
  },

  async deleteTask(taskId: string, config?: AxiosRequestConfig<unknown>) {
    // In production, this would call the actual API
    // await clients.v1.private.delete(`/tasks/${taskId}`, config);
    
    // Mock implementation for development
    const index = MOCK_TASKS.findIndex(task => task.id === taskId);
    if (index !== -1) {
      MOCK_TASKS.splice(index, 1);
    }
  }
};

// Mock data for development
export const MOCK_TASKS = [
  {
    id: 'task-1',
    name: 'Downtown Traffic Analysis',
    description: 'Analyzing traffic patterns at Main St intersection',
    recipeId: 'recipe-1',
    taskType: 'counting',
    status: 'completed',
    progress: 100,
    startTime: '2023-05-10T14:30:00Z',
    endTime: '2023-05-10T15:15:00Z',
    videoUrl: 'https://example.com/videos/traffic-sample.mp4',
    videoStreamUrl: 'wss://example.com/ws/tasks/task-1/stream',
    metrics: {
      objectsCounted: 1245,
      detectionRate: 0.96,
      processingFps: 24.7,
      totalObjects: {
        car: 876,
        truck: 142,
        bus: 45,
        motorcycle: 182
      }
    },
    createdAt: '2023-05-10T14:25:00Z'
  },
  {
    id: 'task-2',
    name: 'Highway Traffic Monitoring',
    description: 'Monitoring vehicle flow on Highway 101',
    recipeId: 'recipe-2',
    taskType: 'tracking',
    status: 'running',
    progress: 68,
    startTime: '2023-05-20T09:45:00Z',
    videoUrl: 'https://example.com/videos/highway-sample.mp4',
    videoStreamUrl: 'wss://example.com/ws/tasks/task-2/stream',
    metrics: {
      objectsCounted: 876,
      detectionRate: 0.92,
      processingFps: 22.8,
      totalObjects: {
        car: 652,
        truck: 187,
        bus: 37
      }
    },
    createdAt: '2023-05-20T09:40:00Z'
  },
  {
    id: 'task-3',
    name: 'Parking Lot Occupancy',
    description: 'Monitoring mall parking lot usage',
    recipeId: 'recipe-3',
    taskType: 'detection',
    status: 'pending',
    progress: 0,
    videoUrl: 'https://example.com/videos/parking-lot.mp4',
    videoStreamUrl: 'wss://example.com/ws/tasks/task-3/stream',
    createdAt: '2023-05-21T10:30:00Z'
  },
  {
    id: 'task-4',
    name: 'Crosswalk Safety Analysis',
    description: 'Analyzing pedestrian patterns at busy crosswalk',
    recipeId: 'recipe-4',
    taskType: 'detection',
    status: 'failed',
    progress: 32,
    startTime: '2023-05-19T16:20:00Z',
    endTime: '2023-05-19T16:35:00Z',
    videoUrl: 'https://example.com/videos/crosswalk.mp4',
    videoStreamUrl: 'wss://example.com/ws/tasks/task-4/stream',
    error: 'Model inference failed: GPU memory allocation error',
    createdAt: '2023-05-19T16:15:00Z'
  },
  {
    id: 'task-5',
    name: 'School Zone Traffic',
    description: 'Monitoring traffic patterns in school safety zone',
    recipeId: 'recipe-5',
    taskType: 'counting',
    status: 'stopped',
    progress: 45,
    startTime: '2023-05-18T12:00:00Z',
    endTime: '2023-05-18T12:22:00Z',
    videoUrl: 'https://example.com/videos/school-zone.mp4',
    videoStreamUrl: 'wss://example.com/ws/tasks/task-5/stream',
    metrics: {
      objectsCounted: 246,
      processingFps: 26.1,
      totalObjects: {
        car: 187,
        bicycle: 59
      }
    },
    createdAt: '2023-05-18T11:55:00Z'
  }
];

function getMockTasks() {
  return tasksListSchema.parse(MOCK_TASKS);
}

function createMockTask(recipeId: string) {
  const taskId = `task-${Date.now()}`;
  const newTask = {
    id: taskId,
    name: `Task ${taskId}`,
    description: 'Automatically created task',
    recipeId,
    taskType: 'detection',
    status: 'pending',
    progress: 0,
    videoUrl: 'https://example.com/videos/sample.mp4',
    videoStreamUrl: `wss://example.com/ws/tasks/${taskId}/stream`,
    createdAt: new Date().toISOString()
  };
  
  MOCK_TASKS.push(newTask);
  return newTask;
}