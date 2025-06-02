import type { AxiosRequestConfig } from "axios";

import type { CreateTaskRequest } from "../../types/task-creation";
import { clients } from "../api";
import { taskSchema, tasksListSchema } from "../validator/task";

export const taskService = {
  async createTask(
    taskData: CreateTaskRequest,
    config?: AxiosRequestConfig<unknown>
  ) {
    // In production, this would call the actual API
    // const { data } = await clients.v1.private.post('/tasks', taskData, config);
    // return taskSchema.parse(data);

    // Mock implementation for development
    const taskId = `task-${Date.now()}`;
    const newTask = {
      createdAt: new Date().toISOString(),
      description: taskData.description,
      id: taskId,
      name: taskData.name,
      progress: 0,
      recipeId: taskData.recipeId,
      status: "pending" as const,
      taskType: taskData.taskType,
      videoStreamUrl: `wss://example.com/ws/tasks/${taskId}/stream`,
      videoUrl: taskData.localPath,
    };

    MOCK_TASKS.push(newTask);
    return taskSchema.parse(newTask);
  },

  async deleteTask(taskId: string, config?: AxiosRequestConfig<unknown>) {
    // In production, this would call the actual API
    // await clients.v1.private.delete(`/tasks/${taskId}`, config);

    // Mock implementation for development
    const index = MOCK_TASKS.findIndex((task) => task.id === taskId);
    if (index !== -1) {
      MOCK_TASKS.splice(index, 1);
    }
  },

  async getTask(id: string, config?: AxiosRequestConfig<unknown>) {
    // In production, this would call the actual API
    // const { data } = await clients.v1.private.get(`/tasks/${id}`, config);
    // return taskSchema.parse(data);

    // Mock implementation for development
    console.log('TaskService.getTask - Looking for task ID:', id);
    console.log('TaskService.getTask - Available task IDs:', MOCK_TASKS.map(t => t.id));
    
    // First try exact match
    let task = MOCK_TASKS.find((task) => task.id === id);
    
    // If not found and ID is numeric, try with "task-" prefix
    if (!task && /^\d+$/.test(id)) {
      const convertedId = `task-${id}`;
      console.log('TaskService.getTask - Trying converted ID:', convertedId);
      task = MOCK_TASKS.find((task) => task.id === convertedId);
    }
    
    // If still not found and ID starts with "task-", try just the number
    if (!task && id.startsWith('task-')) {
      const numericId = id.replace('task-', '');
      console.log('TaskService.getTask - Trying numeric ID:', numericId);
      task = MOCK_TASKS.find((task) => task.id === numericId);
    }
    
    if (!task) {
      console.error('TaskService.getTask - Task not found:', id);
      console.error('TaskService.getTask - Tried variations:', [id, `task-${id}`, id.replace('task-', '')]);
      throw new Error("Task not found");
    }
    
    console.log('TaskService.getTask - Found task:', task.name, 'with ID:', task.id);
    return taskSchema.parse(task);
  },

  // Alias for getTask
async getTaskById(taskId: string, config?: AxiosRequestConfig<unknown>) {
    return this.getTask(taskId, config);
  },

  
async getTasks(config?: AxiosRequestConfig<unknown>) {
    // In production, this would call the actual API
    // const { data } = await clients.v1.private.get('/tasks', config);
    // return tasksListSchema.parse(data);

    // Mock implementation for development
    return getMockTasks();
  },

  
async startTask(taskId: string, config?: AxiosRequestConfig<unknown>) {
    // In production, this would call the actual API
    // const { data } = await clients.v1.private.post(`/tasks/${taskId}/start`, undefined, config);
    // return taskSchema.parse(data);

    // Mock implementation for development
    const task = MOCK_TASKS.find((t) => t.id === taskId);
    if (!task) throw new Error("Task not found");

    const updatedTask = {
      ...task,
      progress: 5,
      startTime: new Date().toISOString(),
      status: "running" as const,
    };

    // Update the mock task
    const index = MOCK_TASKS.findIndex((t) => t.id === taskId);
    if (index !== -1) {
      MOCK_TASKS[index] = updatedTask;
    }

    return taskSchema.parse(updatedTask);
  },

  
async stopTask(taskId: string, config?: AxiosRequestConfig<unknown>) {
    // In production, this would call the actual API
    // await clients.v1.private.post(`/tasks/${taskId}/stop`, undefined, config);
    // const { data } = await clients.v1.private.get(`/tasks/${taskId}`, config);
    // return taskSchema.parse(data);

    // Mock implementation for development
    const task = MOCK_TASKS.find((task) => task.id === taskId);
    if (!task) throw new Error("Task not found");

    const updatedTask = {
      ...task,
      endTime: new Date().toISOString(),
      status: "stopped",
    };

    // Update the mock task
    const index = MOCK_TASKS.findIndex((t) => t.id === taskId);
    if (index !== -1) {
      MOCK_TASKS[index] = updatedTask;
    }

    return taskSchema.parse(updatedTask);
  },

  
  async updateTask(
    taskId: string,
    updateData: Partial<CreateTaskRequest>,
    config?: AxiosRequestConfig<unknown>
  ) {
    // In production, this would call the actual API
    // const { data } = await clients.v1.private.patch(`/tasks/${taskId}`, updateData, config);
    // return taskSchema.parse(data);

    // Mock implementation for development
    const task = MOCK_TASKS.find((t) => t.id === taskId);
    if (!task) throw new Error("Task not found");

    const updatedTask = {
      ...task,
      ...updateData,
      updatedAt: new Date().toISOString(),
    };

    // Update the mock task
    const index = MOCK_TASKS.findIndex((t) => t.id === taskId);
    if (index !== -1) {
      MOCK_TASKS[index] = updatedTask;
    }

    return taskSchema.parse(updatedTask);
  },
};

// Mock data for development - unified structure
export const MOCK_TASKS = [
  {
    createdAt: "2023-05-10T14:25:00Z",
    description: "Analyzing traffic patterns at Main St intersection",
    endTime: "2023-05-10T15:15:00Z",
    id: "task-1",
    name: "Downtown Traffic Analysis",
    priority: "high" as const,
    progress: 100,
    recipeId: "recipe-1",
    recipeName: "市區主幹道交通流量監測",
    resultType: "trafficStatistics" as const,
    startTime: "2023-05-10T14:30:00Z",
    status: "completed" as const,
    taskType: "trafficStatistics" as const,
    userId: "user-1",
    userName: "Admin User",
    videoId: "video-1",
    videoName: "City Center Intersection",
    videoUrl: "/local/videos/traffic-sample.mp4",
    localPath: "/local/videos/traffic-sample.mp4",
    metrics: {
      detectionRate: 0.96,
      objectsCounted: 1245,
      processingFps: 24.7,
      totalObjects: {
        bus: 45,
        car: 876,
        motorcycle: 182,
        truck: 142,
      },
    },
  },
  {
    createdAt: "2023-05-20T09:40:00Z",
    description: "Monitoring vehicle flow on Highway 101",
    id: "task-2",
    name: "Highway Traffic Monitoring",
    priority: "medium" as const,
    progress: 68,
    recipeId: "recipe-2",
    recipeName: "十字路口車流分析",
    resultType: "trafficStatistics" as const,
    startTime: "2023-05-20T09:45:00Z",
    status: "running" as const,
    taskType: "trafficStatistics" as const,
    userId: "user-1",
    userName: "Admin User",
    videoId: "video-2",
    videoName: "Highway Traffic",
    videoUrl: "/local/videos/highway-sample.mp4",
    localPath: "/local/videos/highway-sample.mp4",
    metrics: {
      detectionRate: 0.92,
      objectsCounted: 876,
      processingFps: 22.8,
      totalObjects: {
        bus: 37,
        car: 652,
        truck: 187,
      },
    },
  },
  {
    createdAt: "2023-05-21T10:30:00Z",
    description: "Monitoring mall parking lot usage",
    id: "task-3",
    name: "Parking Lot Occupancy",
    priority: "low" as const,
    progress: 0,
    recipeId: "recipe-3",
    recipeName: "高速公路車流監測",
    resultType: "trafficStatistics" as const,
    status: "pending" as const,
    taskType: "trafficStatistics" as const,
    userId: "user-2",
    userName: "Analyst User",
    videoId: "video-3",
    videoName: "Parking Lot",
    videoUrl: "/local/videos/parking-lot.mp4",
    localPath: "/local/videos/parking-lot.mp4",
  },
  {
    createdAt: "2023-05-19T16:15:00Z",
    description: "Analyzing pedestrian patterns at busy crosswalk",
    endTime: "2023-05-19T16:35:00Z",
    error: "Model inference failed: GPU memory allocation error",
    id: "task-4",
    name: "Crosswalk Safety Analysis",
    priority: "high" as const,
    progress: 32,
    recipeId: "recipe-4",
    recipeName: "台北車站月台監測",
    resultType: "trainDetection" as const,
    startTime: "2023-05-19T16:20:00Z",
    status: "failed" as const,
    taskType: "trainDetection" as const,
    userId: "user-1",
    userName: "Admin User",
    videoId: "video-4",
    videoName: "Crosswalk",
    videoUrl: "/local/videos/crosswalk.mp4",
    localPath: "/local/videos/crosswalk.mp4",
  },
  {
    createdAt: "2023-05-18T11:55:00Z",
    description: "Monitoring traffic patterns in school safety zone",
    endTime: "2023-05-18T12:22:00Z",
    id: "task-5",
    name: "School Zone Traffic",
    priority: "medium" as const,
    progress: 45,
    recipeId: "recipe-5",
    recipeName: "鐵路平交道安全監測",
    resultType: "trainDetection" as const,
    startTime: "2023-05-18T12:00:00Z",
    status: "stopped" as const,
    taskType: "trainDetection" as const,
    userId: "user-3",
    userName: "Manager User",
    videoId: "video-5",
    videoName: "School Zone",
    videoUrl: "/local/videos/school-zone.mp4",
    localPath: "/local/videos/school-zone.mp4",
    metrics: {
      objectsCounted: 246,
      processingFps: 26.1,
      totalObjects: {
        bicycle: 59,
        car: 187,
      },
    },
  },
];

function getMockTasks() {
  return tasksListSchema.parse(MOCK_TASKS);
}
