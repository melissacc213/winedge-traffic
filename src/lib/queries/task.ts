import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { 
  Task, 
  TaskFilter, 
  TaskStats, 
  TaskSubmission, 
  TaskUpdate 
} from '../../types/task';

// Legacy mock task data - now using task service data
const LEGACY_MOCK_TASKS: Task[] = [
  {
    completedAt: '2023-05-01T09:15:00Z',
    createdAt: '2023-05-01T08:30:00Z',
    description: 'Analyze traffic patterns at the main intersection',
    duration: 2580,
    id: 'task-1',
    name: 'Downtown Traffic Analysis',
    priority: 'high',
    progress: 100,
    // 43 minutes
recipeId: 'recipe-1',
    
recipeName: 'Urban Traffic Flow Analysis', 
    resultType: 'trafficStatistics',
    resultsCount: 342,
    startedAt: '2023-05-01T08:32:00Z',
    status: 'completed',
    thumbnail: '/public/task-thumbnails/downtown-traffic.jpg',
    userId: 'user-1',
    userName: 'Admin User',
    videoId: 'video-1',
    videoName: 'City Center Intersection',
  },
  {
    createdAt: '2023-05-02T10:15:00Z',
    description: 'Monitor traffic flow in downtown area',
    id: 'task-2',
    name: 'Downtown Congestion Monitoring',
    priority: 'medium',
    progress: 68,
    recipeId: 'recipe-2',
    recipeName: 'Downtown Traffic Monitoring',
    resultType: 'trafficStatistics',
    startedAt: '2023-05-02T10:17:00Z',
    status: 'running',
    thumbnail: '/public/task-thumbnails/downtown-traffic.jpg',
    userId: 'user-1',
    userName: 'Admin User',
    videoId: 'video-2',
    videoName: 'Downtown Traffic',
  },
  {
    createdAt: '2023-05-03T14:20:00Z',
    description: 'Track high-speed trains on main railways',
    id: 'task-3',
    name: 'High-Speed Rail Analysis',
    priority: 'low',
    progress: 0,
    recipeId: 'recipe-3',
    recipeName: 'High-Speed Rail Monitoring',
    resultType: 'trainDetection',
    status: 'queued',
    thumbnail: '/public/task-thumbnails/railway.jpg',
    userId: 'user-2',
    userName: 'Analyst User',
    videoId: 'video-3',
    videoName: 'High-Speed Railway',
  },
  {
    completedAt: '2023-05-04T09:25:00Z',
    createdAt: '2023-05-04T09:00:00Z',
    description: 'Monitor train activities at subway platform',
    error: 'Processing error: insufficient GPU memory',
    id: 'task-4',
    name: 'Subway Platform Analysis',
    priority: 'high',
    progress: 45,
    recipeId: 'recipe-4',
    recipeName: 'Subway Station Monitoring',
    resultType: 'trainDetection',
    startedAt: '2023-05-04T09:05:00Z',
    status: 'failed',
    thumbnail: '/public/task-thumbnails/subway.jpg',
    userId: 'user-1',
    userName: 'Admin User',
    videoId: 'video-4',
    videoName: 'Subway Platform',
  },
  {
    completedAt: '2023-05-05T12:10:00Z',
    createdAt: '2023-05-05T11:30:00Z',
    description: 'Analyze traffic congestion at highway junction',
    duration: 2280,
    id: 'task-5',
    name: 'Highway Junction Congestion',
    priority: 'medium',
    progress: 100,
    // 38 minutes
recipeId: 'recipe-5',
    
recipeName: 'Traffic Congestion Analysis', 
    resultType: 'trafficStatistics',
    resultsCount: 156,
    startedAt: '2023-05-05T11:32:00Z',
    status: 'completed',
    thumbnail: '/public/task-thumbnails/highway-junction.jpg',
    userId: 'user-3',
    userName: 'Manager User',
    videoId: 'video-5',
    videoName: 'Highway Junction',
  },
  {
    completedAt: '2023-05-06T16:15:00Z',
    createdAt: '2023-05-06T16:00:00Z',
    description: 'Monitor train activity at railway crossing',
    id: 'task-6',
    name: 'Railway Crossing Safety',
    priority: 'low',
    progress: 22,
    recipeId: 'recipe-6',
    recipeName: 'Railway Crossing Monitoring',
    resultType: 'trainDetection',
    startedAt: '2023-05-06T16:05:00Z',
    status: 'cancelled',
    thumbnail: '/public/task-thumbnails/railway-crossing.jpg',
    userId: 'user-2',
    userName: 'Analyst User',
    videoId: 'video-6',
    videoName: 'Railway Crossing',
  },
  {
    completedAt: '2023-05-07T08:45:00Z',
    createdAt: '2023-05-07T08:00:00Z',
    description: 'Analyze traffic patterns during rush hour',
    duration: 2400,
    id: 'task-7',
    name: 'Rush Hour Traffic Monitoring',
    priority: 'medium',
    progress: 100,
    // 40 minutes
recipeId: 'recipe-7',
    
recipeName: 'Rush Hour Traffic Analysis', 
    resultType: 'trafficStatistics',
    resultsCount: 87,
    startedAt: '2023-05-07T08:05:00Z',
    status: 'completed',
    thumbnail: '/public/task-thumbnails/rush-hour.jpg',
    userId: 'user-1',
    userName: 'Admin User',
    videoId: 'video-7',
    videoName: 'Rush Hour Traffic',
  },
  {
    createdAt: '2023-05-08T07:30:00Z',
    description: 'Track freight trains across rail network',
    id: 'task-8',
    name: 'Freight Train Monitoring',
    priority: 'high',
    progress: 32,
    recipeId: 'recipe-8',
    recipeName: 'Freight Train Tracking',
    resultType: 'trainDetection',
    startedAt: '2023-05-08T07:35:00Z',
    status: 'running',
    thumbnail: '/public/task-thumbnails/freight-train.jpg',
    userId: 'user-3',
    userName: 'Manager User',
    videoId: 'video-8',
    videoName: 'Freight Railway',
  },
  {
    completedAt: '2023-06-10T10:05:00Z',
    createdAt: '2023-06-10T09:15:00Z',
    description: 'Analyze traffic density in urban zones',
    duration: 2700,
    id: 'task-9',
    name: 'Urban Traffic Density Study',
    priority: 'medium',
    progress: 100,
    // 45 minutes
recipeId: 'recipe-9',
    
recipeName: 'Urban Traffic Density Analysis', 
    resultType: 'trafficStatistics',
    resultsCount: 243,
    startedAt: '2023-06-10T09:20:00Z',
    status: 'completed',
    thumbnail: '/public/task-thumbnails/urban-traffic.jpg',
    userId: 'user-1',
    userName: 'Admin User',
    videoId: 'video-9',
    videoName: 'Urban Zone Traffic',
  },
  {
    completedAt: '2023-06-15T13:15:00Z',
    createdAt: '2023-06-15T12:30:00Z',
    description: 'Verify commuter train schedules',
    duration: 2400,
    id: 'task-10',
    name: 'Commuter Train Schedule Audit',
    priority: 'high',
    progress: 100,
    // 40 minutes
recipeId: 'recipe-10',
    
recipeName: 'Commuter Train Schedule Verification', 
    resultType: 'trainDetection',
    resultsCount: 78,
    startedAt: '2023-06-15T12:35:00Z',
    status: 'completed',
    thumbnail: '/public/task-thumbnails/commuter-train.jpg',
    userId: 'user-2',
    userName: 'Analyst User',
    videoId: 'video-10',
    videoName: 'Commuter Station',
  },
  {
    createdAt: '2023-06-20T08:45:00Z',
    description: 'Analyze traffic flow by lane',
    id: 'task-11',
    name: 'Highway Lane Flow Assessment',
    priority: 'medium',
    progress: 54,
    recipeId: 'recipe-11',
    recipeName: 'Highway Traffic Flow Analysis',
    resultType: 'trafficStatistics',
    startedAt: '2023-06-20T08:50:00Z',
    status: 'running',
    thumbnail: '/public/task-thumbnails/highway-lanes.jpg',
    userId: 'user-1',
    userName: 'Admin User',
    videoId: 'video-11',
    videoName: 'Highway Lanes',
  },
  {
    createdAt: '2023-06-25T10:20:00Z',
    description: 'Monitor maintenance trains on railways',
    id: 'task-12',
    name: 'Railway Maintenance Inspection',
    priority: 'low',
    progress: 0,
    recipeId: 'recipe-12',
    recipeName: 'Railway Maintenance Inspection',
    resultType: 'trainDetection',
    status: 'queued',
    thumbnail: '/public/task-thumbnails/maintenance-train.jpg',
    userId: 'user-3',
    userName: 'Manager User',
    videoId: 'video-12',
    videoName: 'Maintenance Rail',
  },
  {
    completedAt: '2023-07-05T09:55:00Z',
    createdAt: '2023-07-05T09:00:00Z',
    description: 'Monitor traffic patterns in school zones',
    duration: 3000,
    id: 'task-13',
    name: 'School Zone Traffic Study',
    priority: 'high',
    progress: 100,
    // 50 minutes
recipeId: 'recipe-13',
    
recipeName: 'School Zone Traffic Monitoring', 
    resultType: 'trafficStatistics',
    resultsCount: 187,
    startedAt: '2023-07-05T09:05:00Z',
    status: 'completed',
    thumbnail: '/public/task-thumbnails/school-zone.jpg',
    userId: 'user-1',
    userName: 'Admin User',
    videoId: 'video-13',
    videoName: 'School Zone',
  },
  {
    completedAt: '2023-07-10T14:45:00Z',
    createdAt: '2023-07-10T14:15:00Z',
    description: 'Analyze bullet train velocity',
    error: 'Processing error: tracking lost at high speed',
    id: 'task-14',
    name: 'Bullet Train Speed Study',
    priority: 'medium',
    progress: 76,
    recipeId: 'recipe-14',
    recipeName: 'Bullet Train Velocity Analysis',
    resultType: 'trainDetection',
    startedAt: '2023-07-10T14:20:00Z',
    status: 'failed',
    thumbnail: '/public/task-thumbnails/bullet-train.jpg',
    userId: 'user-2',
    userName: 'Analyst User',
    videoId: 'video-14',
    videoName: 'Bullet Train Line',
  },
  {
    completedAt: '2023-07-15T11:20:00Z',
    createdAt: '2023-07-15T10:30:00Z',
    description: 'Monitor traffic in city center grid',
    duration: 2700,
    id: 'task-15',
    name: 'City Center Traffic Management',
    priority: 'high',
    progress: 100,
    // 45 minutes
recipeId: 'recipe-15',
    
recipeName: 'City Center Traffic Management', 
    resultType: 'trafficStatistics',
    resultsCount: 312,
    startedAt: '2023-07-15T10:35:00Z',
    status: 'completed',
    thumbnail: '/public/task-thumbnails/city-center.jpg',
    userId: 'user-1',
    userName: 'Admin User',
    videoId: 'video-15',
    videoName: 'City Center Grid',
  },
  {
    createdAt: '2023-07-20T13:45:00Z',
    description: 'Monitor train movements at junction',
    id: 'task-16',
    name: 'Railway Junction Analysis',
    priority: 'medium',
    progress: 28,
    recipeId: 'recipe-16',
    recipeName: 'Railway Junction Analysis',
    resultType: 'trainDetection',
    startedAt: '2023-07-20T13:50:00Z',
    status: 'running',
    thumbnail: '/public/task-thumbnails/railway-junction.jpg',
    userId: 'user-3',
    userName: 'Manager User',
    videoId: 'video-16',
    videoName: 'Railway Junction',
  },
  {
    createdAt: '2023-07-25T08:00:00Z',
    description: 'Analyze congestion during peak hours',
    id: 'task-17',
    name: 'Peak Hour Traffic Analysis',
    priority: 'high',
    progress: 0,
    recipeId: 'recipe-17',
    recipeName: 'Peak Hour Congestion Analysis',
    resultType: 'trafficStatistics',
    status: 'queued',
    thumbnail: '/public/task-thumbnails/peak-hour.jpg',
    userId: 'user-1',
    userName: 'Admin User',
    videoId: 'video-17',
    videoName: 'Peak Hour Traffic',
  },
  {
    completedAt: '2023-08-01T09:45:00Z',
    createdAt: '2023-08-01T09:30:00Z',
    description: 'Analyze safety at railway crossings',
    id: 'task-18',
    name: 'Railway Crossing Safety Study',
    priority: 'medium',
    progress: 15,
    recipeId: 'recipe-18',
    recipeName: 'Railway Crossing Safety Analysis',
    resultType: 'trainDetection',
    startedAt: '2023-08-01T09:35:00Z',
    status: 'cancelled',
    thumbnail: '/public/task-thumbnails/crossing-safety.jpg',
    userId: 'user-2',
    userName: 'Analyst User',
    videoId: 'video-18',
    videoName: 'Railway Crossing Safety',
  },
  {
    completedAt: '2023-08-05T11:50:00Z',
    createdAt: '2023-08-05T11:00:00Z',
    description: 'Monitor vehicle speeds on highway',
    duration: 2700,
    id: 'task-19',
    name: 'Highway Speed Zone Analysis',
    priority: 'low',
    progress: 100,
    // 45 minutes
recipeId: 'recipe-19',
    
recipeName: 'Highway Traffic Speed Analysis', 
    resultType: 'trafficStatistics',
    resultsCount: 203,
    startedAt: '2023-08-05T11:05:00Z',
    status: 'completed',
    thumbnail: '/public/task-thumbnails/highway-speed.jpg',
    userId: 'user-1',
    userName: 'Admin User',
    videoId: 'video-19',
    videoName: 'Highway Speed Zone',
  },
  {
    createdAt: '2023-08-10T14:30:00Z',
    description: 'Track cargo train movements',
    id: 'task-20',
    name: 'Cargo Train Monitoring',
    priority: 'medium',
    progress: 42,
    recipeId: 'recipe-20',
    recipeName: 'Cargo Train Monitoring',
    resultType: 'trainDetection',
    startedAt: '2023-08-10T14:35:00Z',
    status: 'running',
    thumbnail: '/public/task-thumbnails/cargo-train.jpg',
    userId: 'user-3',
    userName: 'Manager User',
    videoId: 'video-20',
    videoName: 'Cargo Rail',
  },
  {
    completedAt: '2023-08-15T07:50:00Z',
    createdAt: '2023-08-15T07:00:00Z',
    description: 'Analyze morning rush hour traffic',
    duration: 2700,
    id: 'task-21',
    name: 'Morning Rush Analysis',
    priority: 'high',
    progress: 100,
    // 45 minutes
recipeId: 'recipe-1',
    
recipeName: 'Urban Traffic Flow Analysis', 
    resultType: 'trafficStatistics',
    resultsCount: 287,
    startedAt: '2023-08-15T07:05:00Z',
    status: 'completed',
    thumbnail: '/public/task-thumbnails/morning-rush.jpg',
    userId: 'user-1',
    userName: 'Admin User',
    videoId: 'video-1',
    videoName: 'Morning Rush Traffic',
  },
  {
    createdAt: '2023-08-20T10:15:00Z',
    description: 'Track express train schedules',
    id: 'task-22',
    name: 'Express Train Monitoring',
    priority: 'medium',
    progress: 0,
    recipeId: 'recipe-3',
    recipeName: 'High-Speed Rail Monitoring',
    resultType: 'trainDetection',
    status: 'queued',
    thumbnail: '/public/task-thumbnails/express-train.jpg',
    userId: 'user-2',
    userName: 'Analyst User',
    videoId: 'video-3',
    videoName: 'Express Train',
  },
  {
    createdAt: '2023-08-25T09:30:00Z',
    description: 'Analyze traffic volume at intersection',
    id: 'task-23',
    name: 'Intersection Volume Study',
    priority: 'high',
    progress: 58,
    recipeId: 'recipe-2',
    recipeName: 'Downtown Traffic Monitoring',
    resultType: 'trafficStatistics',
    startedAt: '2023-08-25T09:35:00Z',
    status: 'running',
    thumbnail: '/public/task-thumbnails/intersection.jpg',
    userId: 'user-1',
    userName: 'Admin User',
    videoId: 'video-2',
    videoName: 'Busy Intersection',
  },
  {
    completedAt: '2023-09-01T14:10:00Z',
    createdAt: '2023-09-01T13:45:00Z',
    description: 'Analyze commuter train patterns',
    error: 'Processing error: data corruption',
    id: 'task-24',
    name: 'Commuter Rail Analysis',
    priority: 'medium',
    progress: 67,
    recipeId: 'recipe-10',
    recipeName: 'Commuter Train Schedule Verification',
    resultType: 'trainDetection',
    startedAt: '2023-09-01T13:50:00Z',
    status: 'failed',
    thumbnail: '/public/task-thumbnails/commuter-rail.jpg',
    userId: 'user-3',
    userName: 'Manager User',
    videoId: 'video-10',
    videoName: 'Commuter Rail',
  },
  {
    completedAt: '2023-09-05T17:55:00Z',
    createdAt: '2023-09-05T17:00:00Z',
    description: 'Analyze evening rush hour patterns',
    duration: 3000,
    id: 'task-25',
    name: 'Evening Peak Analysis',
    priority: 'high',
    progress: 100,
    // 50 minutes
recipeId: 'recipe-17',
    
recipeName: 'Peak Hour Congestion Analysis', 
    resultType: 'trafficStatistics',
    resultsCount: 326,
    startedAt: '2023-09-05T17:05:00Z',
    status: 'completed',
    thumbnail: '/public/task-thumbnails/evening-peak.jpg',
    userId: 'user-1',
    userName: 'Admin User',
    videoId: 'video-17',
    videoName: 'Evening Peak Traffic',
  }
];

// Get mock task statistics based on tasks
const getMockTaskStats = (tasks: Task[] = LEGACY_MOCK_TASKS): TaskStats => {
  const stats: TaskStats = {
    cancelled: 0,
    completed: 0,
    failed: 0,
    queued: 0,
    running: 0,
    total: tasks.length
  };

  tasks.forEach(task => {
    if (task.status === 'queued') stats.queued++;
    if (task.status === 'running') stats.running++;
    if (task.status === 'completed') stats.completed++;
    if (task.status === 'failed') stats.failed++;
    if (task.status === 'cancelled') stats.cancelled++;
  });

  return stats;
};

// Filter mock tasks based on criteria
const filterMockTasks = (tasks: Task[], filter?: TaskFilter): Task[] => {
  if (!filter) return tasks;
  
  return tasks.filter(task => {
    // Filter by status
    if (filter.status && filter.status.length > 0 && !filter.status.includes(task.status)) {
      return false;
    }
    
    // Filter by priority
    if (filter.priority && filter.priority.length > 0 && !filter.priority.includes(task.priority)) {
      return false;
    }
    
    // Filter by date range
    if (filter.dateRange) {
      const taskDate = new Date(task.createdAt);
      if (taskDate < filter.dateRange.from || taskDate > filter.dateRange.to) {
        return false;
      }
    }
    
    // Filter by search term (name, description, or recipe name)
    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      const nameMatch = task.name.toLowerCase().includes(searchLower);
      const descMatch = task.description?.toLowerCase().includes(searchLower) || false;
      const recipeMatch = task.recipeName?.toLowerCase().includes(searchLower) || false;
      
      if (!nameMatch && !descMatch && !recipeMatch) {
        return false;
      }
    }
    
    // Filter by user ID
    if (filter.userId && task.userId !== filter.userId) {
      return false;
    }
    
    return true;
  });
};

// Get all tasks query
export function useTasks(filter?: TaskFilter) {
  return useQuery({
    queryFn: async () => {
      // Use task service for consistency
      const { taskService } = await import('../api/task-service');
      const tasks = await taskService.getTasks();
      return filterMockTasks(tasks, filter);
    },
    queryKey: ['tasks', filter]
  });
}

// Get task statistics
export function useTaskStats() {
  return useQuery({
    queryFn: async () => {
      // Use task service for consistency
      const { taskService } = await import('../api/task-service');
      const tasks = await taskService.getTasks();
      return getMockTaskStats(tasks);
    },
    queryKey: ['taskStats']
  });
}

// Get a single task by ID
export function useTask(id: string) {
  return useQuery({
    enabled: !!id,
    queryFn: async () => {
      if (!id) return null;
      
      // Use task service for consistency
      const { taskService } = await import('../api/task-service');
      return await taskService.getTask(id);
    },
    queryKey: ['task', id]
  });
}

// Create a new task
export function useCreateTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (taskSubmission: TaskSubmission) => {
      // Use task service for consistency
      const { taskService } = await import('../api/task-service');
      
      const createTaskRequest = {
        name: taskSubmission.name,
        description: taskSubmission.description,
        priority: taskSubmission.priority,
        recipeId: taskSubmission.recipeId,
        localPath: taskSubmission.videoId || '',
        taskType: 'trafficStatistics' as const, // Default, will be updated based on recipe
      };
      
      return await taskService.createTask(createTaskRequest);
    },
    onSuccess: () => {
      // Invalidate tasks query to refetch data
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['taskStats'] });
    }
  });
}

// Start a task from recipe
export function useStartTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (recipeId: string) => {
      // Mock implementation
      const recipe = { id: recipeId, name: `Recipe ${recipeId}` };
      const newTask: Task = {
        createdAt: new Date().toISOString(),
        description: `Task created from recipe ${recipeId}`,
        id: `task-${Date.now()}`,
        name: `Task from ${recipe.name}`,
        priority: 'medium',
        progress: 0,
        recipeId: recipeId,
        recipeName: recipe.name,
        // Determine task type based on recipe ID to alternate between the two valid types
resultType: recipeId.includes('train') ? 'trainDetection' : 'trafficStatistics',
        
startedAt: new Date().toISOString(),
        
        status: 'running',
        userId: 'user-1', // Current user
        userName: 'Admin User'
      };
      
      console.log('Starting task from recipe:', newTask);
      return newTask;
    },
    onSuccess: () => {
      // Invalidate tasks query to refetch data
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['taskStats'] });
    }
  });
}

// Update a task
export function useUpdateTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (taskUpdate: TaskUpdate) => {
      // Use task service for consistency
      const { taskService } = await import('../api/task-service');
      
      const updateData = {
        ...(taskUpdate.status && { status: taskUpdate.status }),
        ...(taskUpdate.progress !== undefined && { progress: taskUpdate.progress }),
        ...(taskUpdate.error && { error: taskUpdate.error }),
      };
      
      return await taskService.updateTask(taskUpdate.id, updateData);
    },
    onSuccess: (data) => {
      // Invalidate both the tasks list and the specific task query
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task', data.id] });
      queryClient.invalidateQueries({ queryKey: ['taskStats'] });
    }
  });
}

// Cancel a task
export function useCancelTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (taskId: string) => {
      // Use task service for consistency
      const { taskService } = await import('../api/task-service');
      return await taskService.stopTask(taskId);
    },
    onSuccess: (data) => {
      // Invalidate both the tasks list and the specific task query
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task', data.id] });
      queryClient.invalidateQueries({ queryKey: ['taskStats'] });
    }
  });
}

// Delete a task
export function useDeleteTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (taskId: string) => {
      // Use task service for consistency
      const { taskService } = await import('../api/task-service');
      await taskService.deleteTask(taskId);
      return taskId;
    },
    onSuccess: (taskId) => {
      // Invalidate the tasks query to refetch data
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['taskStats'] });
    }
  });
}

// Stop a running task
export function useStopTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (taskId: string) => {
      // Use task service for consistency
      const { taskService } = await import('../api/task-service');
      return await taskService.stopTask(taskId);
    },
    onSuccess: (data) => {
      // Invalidate both the tasks list and the specific task query
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task', data.id] });
      queryClient.invalidateQueries({ queryKey: ['taskStats'] });
    }
  });
}