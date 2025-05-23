import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { 
  Task, 
  TaskStats, 
  TaskFilter, 
  TaskSubmission, 
  TaskUpdate 
} from '../../types/task';

// Mock task data
const MOCK_TASKS: Task[] = [
  {
    id: 'task-1',
    name: 'Downtown Traffic Analysis',
    description: 'Analyze traffic patterns at the main intersection',
    status: 'completed',
    priority: 'high',
    progress: 100,
    createdAt: '2023-05-01T08:30:00Z',
    startedAt: '2023-05-01T08:32:00Z',
    completedAt: '2023-05-01T09:15:00Z',
    duration: 2580, // 43 minutes
    recipeId: 'recipe-1',
    recipeName: 'Urban Traffic Flow Analysis',
    resultType: 'trafficStatistics',
    videoId: 'video-1',
    videoName: 'City Center Intersection',
    resultsCount: 342,
    thumbnail: '/public/task-thumbnails/downtown-traffic.jpg',
    userId: 'user-1',
    userName: 'Admin User',
  },
  {
    id: 'task-2',
    name: 'Downtown Congestion Monitoring',
    description: 'Monitor traffic flow in downtown area',
    status: 'running',
    priority: 'medium',
    progress: 68,
    createdAt: '2023-05-02T10:15:00Z',
    startedAt: '2023-05-02T10:17:00Z',
    recipeId: 'recipe-2',
    recipeName: 'Downtown Traffic Monitoring',
    resultType: 'trafficStatistics',
    videoId: 'video-2',
    videoName: 'Downtown Traffic',
    thumbnail: '/public/task-thumbnails/downtown-traffic.jpg',
    userId: 'user-1',
    userName: 'Admin User',
  },
  {
    id: 'task-3',
    name: 'High-Speed Rail Analysis',
    description: 'Track high-speed trains on main railways',
    status: 'queued',
    priority: 'low',
    progress: 0,
    createdAt: '2023-05-03T14:20:00Z',
    recipeId: 'recipe-3',
    recipeName: 'High-Speed Rail Monitoring',
    resultType: 'trainDetection',
    videoId: 'video-3',
    videoName: 'High-Speed Railway',
    thumbnail: '/public/task-thumbnails/railway.jpg',
    userId: 'user-2',
    userName: 'Analyst User',
  },
  {
    id: 'task-4',
    name: 'Subway Platform Analysis',
    description: 'Monitor train activities at subway platform',
    status: 'failed',
    priority: 'high',
    progress: 45,
    createdAt: '2023-05-04T09:00:00Z',
    startedAt: '2023-05-04T09:05:00Z',
    completedAt: '2023-05-04T09:25:00Z',
    recipeId: 'recipe-4',
    recipeName: 'Subway Station Monitoring',
    resultType: 'trainDetection',
    videoId: 'video-4',
    videoName: 'Subway Platform',
    error: 'Processing error: insufficient GPU memory',
    thumbnail: '/public/task-thumbnails/subway.jpg',
    userId: 'user-1',
    userName: 'Admin User',
  },
  {
    id: 'task-5',
    name: 'Highway Junction Congestion',
    description: 'Analyze traffic congestion at highway junction',
    status: 'completed',
    priority: 'medium',
    progress: 100,
    createdAt: '2023-05-05T11:30:00Z',
    startedAt: '2023-05-05T11:32:00Z',
    completedAt: '2023-05-05T12:10:00Z',
    duration: 2280, // 38 minutes
    recipeId: 'recipe-5',
    recipeName: 'Traffic Congestion Analysis',
    resultType: 'trafficStatistics',
    videoId: 'video-5',
    videoName: 'Highway Junction',
    resultsCount: 156,
    thumbnail: '/public/task-thumbnails/highway-junction.jpg',
    userId: 'user-3',
    userName: 'Manager User',
  },
  {
    id: 'task-6',
    name: 'Railway Crossing Safety',
    description: 'Monitor train activity at railway crossing',
    status: 'cancelled',
    priority: 'low',
    progress: 22,
    createdAt: '2023-05-06T16:00:00Z',
    startedAt: '2023-05-06T16:05:00Z',
    completedAt: '2023-05-06T16:15:00Z',
    recipeId: 'recipe-6',
    recipeName: 'Railway Crossing Monitoring',
    resultType: 'trainDetection',
    videoId: 'video-6',
    videoName: 'Railway Crossing',
    thumbnail: '/public/task-thumbnails/railway-crossing.jpg',
    userId: 'user-2',
    userName: 'Analyst User',
  },
  {
    id: 'task-7',
    name: 'Rush Hour Traffic Monitoring',
    description: 'Analyze traffic patterns during rush hour',
    status: 'completed',
    priority: 'medium',
    progress: 100,
    createdAt: '2023-05-07T08:00:00Z',
    startedAt: '2023-05-07T08:05:00Z',
    completedAt: '2023-05-07T08:45:00Z',
    duration: 2400, // 40 minutes
    recipeId: 'recipe-7',
    recipeName: 'Rush Hour Traffic Analysis',
    resultType: 'trafficStatistics',
    videoId: 'video-7',
    videoName: 'Rush Hour Traffic',
    resultsCount: 87,
    thumbnail: '/public/task-thumbnails/rush-hour.jpg',
    userId: 'user-1',
    userName: 'Admin User',
  },
  {
    id: 'task-8',
    name: 'Freight Train Monitoring',
    description: 'Track freight trains across rail network',
    status: 'running',
    priority: 'high',
    progress: 32,
    createdAt: '2023-05-08T07:30:00Z',
    startedAt: '2023-05-08T07:35:00Z',
    recipeId: 'recipe-8',
    recipeName: 'Freight Train Tracking',
    resultType: 'trainDetection',
    videoId: 'video-8',
    videoName: 'Freight Railway',
    thumbnail: '/public/task-thumbnails/freight-train.jpg',
    userId: 'user-3',
    userName: 'Manager User',
  },
  {
    id: 'task-9',
    name: 'Urban Traffic Density Study',
    description: 'Analyze traffic density in urban zones',
    status: 'completed',
    priority: 'medium',
    progress: 100,
    createdAt: '2023-06-10T09:15:00Z',
    startedAt: '2023-06-10T09:20:00Z',
    completedAt: '2023-06-10T10:05:00Z',
    duration: 2700, // 45 minutes
    recipeId: 'recipe-9',
    recipeName: 'Urban Traffic Density Analysis',
    resultType: 'trafficStatistics',
    videoId: 'video-9',
    videoName: 'Urban Zone Traffic',
    resultsCount: 243,
    thumbnail: '/public/task-thumbnails/urban-traffic.jpg',
    userId: 'user-1',
    userName: 'Admin User',
  },
  {
    id: 'task-10',
    name: 'Commuter Train Schedule Audit',
    description: 'Verify commuter train schedules',
    status: 'completed',
    priority: 'high',
    progress: 100,
    createdAt: '2023-06-15T12:30:00Z',
    startedAt: '2023-06-15T12:35:00Z',
    completedAt: '2023-06-15T13:15:00Z',
    duration: 2400, // 40 minutes
    recipeId: 'recipe-10',
    recipeName: 'Commuter Train Schedule Verification',
    resultType: 'trainDetection',
    videoId: 'video-10',
    videoName: 'Commuter Station',
    resultsCount: 78,
    thumbnail: '/public/task-thumbnails/commuter-train.jpg',
    userId: 'user-2',
    userName: 'Analyst User',
  },
  {
    id: 'task-11',
    name: 'Highway Lane Flow Assessment',
    description: 'Analyze traffic flow by lane',
    status: 'running',
    priority: 'medium',
    progress: 54,
    createdAt: '2023-06-20T08:45:00Z',
    startedAt: '2023-06-20T08:50:00Z',
    recipeId: 'recipe-11',
    recipeName: 'Highway Traffic Flow Analysis',
    resultType: 'trafficStatistics',
    videoId: 'video-11',
    videoName: 'Highway Lanes',
    thumbnail: '/public/task-thumbnails/highway-lanes.jpg',
    userId: 'user-1',
    userName: 'Admin User',
  },
  {
    id: 'task-12',
    name: 'Railway Maintenance Inspection',
    description: 'Monitor maintenance trains on railways',
    status: 'queued',
    priority: 'low',
    progress: 0,
    createdAt: '2023-06-25T10:20:00Z',
    recipeId: 'recipe-12',
    recipeName: 'Railway Maintenance Inspection',
    resultType: 'trainDetection',
    videoId: 'video-12',
    videoName: 'Maintenance Rail',
    thumbnail: '/public/task-thumbnails/maintenance-train.jpg',
    userId: 'user-3',
    userName: 'Manager User',
  },
  {
    id: 'task-13',
    name: 'School Zone Traffic Study',
    description: 'Monitor traffic patterns in school zones',
    status: 'completed',
    priority: 'high',
    progress: 100,
    createdAt: '2023-07-05T09:00:00Z',
    startedAt: '2023-07-05T09:05:00Z',
    completedAt: '2023-07-05T09:55:00Z',
    duration: 3000, // 50 minutes
    recipeId: 'recipe-13',
    recipeName: 'School Zone Traffic Monitoring',
    resultType: 'trafficStatistics',
    videoId: 'video-13',
    videoName: 'School Zone',
    resultsCount: 187,
    thumbnail: '/public/task-thumbnails/school-zone.jpg',
    userId: 'user-1',
    userName: 'Admin User',
  },
  {
    id: 'task-14',
    name: 'Bullet Train Speed Study',
    description: 'Analyze bullet train velocity',
    status: 'failed',
    priority: 'medium',
    progress: 76,
    createdAt: '2023-07-10T14:15:00Z',
    startedAt: '2023-07-10T14:20:00Z',
    completedAt: '2023-07-10T14:45:00Z',
    recipeId: 'recipe-14',
    recipeName: 'Bullet Train Velocity Analysis',
    resultType: 'trainDetection',
    videoId: 'video-14',
    videoName: 'Bullet Train Line',
    error: 'Processing error: tracking lost at high speed',
    thumbnail: '/public/task-thumbnails/bullet-train.jpg',
    userId: 'user-2',
    userName: 'Analyst User',
  },
  {
    id: 'task-15',
    name: 'City Center Traffic Management',
    description: 'Monitor traffic in city center grid',
    status: 'completed',
    priority: 'high',
    progress: 100,
    createdAt: '2023-07-15T10:30:00Z',
    startedAt: '2023-07-15T10:35:00Z',
    completedAt: '2023-07-15T11:20:00Z',
    duration: 2700, // 45 minutes
    recipeId: 'recipe-15',
    recipeName: 'City Center Traffic Management',
    resultType: 'trafficStatistics',
    videoId: 'video-15',
    videoName: 'City Center Grid',
    resultsCount: 312,
    thumbnail: '/public/task-thumbnails/city-center.jpg',
    userId: 'user-1',
    userName: 'Admin User',
  },
  {
    id: 'task-16',
    name: 'Railway Junction Analysis',
    description: 'Monitor train movements at junction',
    status: 'running',
    priority: 'medium',
    progress: 28,
    createdAt: '2023-07-20T13:45:00Z',
    startedAt: '2023-07-20T13:50:00Z',
    recipeId: 'recipe-16',
    recipeName: 'Railway Junction Analysis',
    resultType: 'trainDetection',
    videoId: 'video-16',
    videoName: 'Railway Junction',
    thumbnail: '/public/task-thumbnails/railway-junction.jpg',
    userId: 'user-3',
    userName: 'Manager User',
  },
  {
    id: 'task-17',
    name: 'Peak Hour Traffic Analysis',
    description: 'Analyze congestion during peak hours',
    status: 'queued',
    priority: 'high',
    progress: 0,
    createdAt: '2023-07-25T08:00:00Z',
    recipeId: 'recipe-17',
    recipeName: 'Peak Hour Congestion Analysis',
    resultType: 'trafficStatistics',
    videoId: 'video-17',
    videoName: 'Peak Hour Traffic',
    thumbnail: '/public/task-thumbnails/peak-hour.jpg',
    userId: 'user-1',
    userName: 'Admin User',
  },
  {
    id: 'task-18',
    name: 'Railway Crossing Safety Study',
    description: 'Analyze safety at railway crossings',
    status: 'cancelled',
    priority: 'medium',
    progress: 15,
    createdAt: '2023-08-01T09:30:00Z',
    startedAt: '2023-08-01T09:35:00Z',
    completedAt: '2023-08-01T09:45:00Z',
    recipeId: 'recipe-18',
    recipeName: 'Railway Crossing Safety Analysis',
    resultType: 'trainDetection',
    videoId: 'video-18',
    videoName: 'Railway Crossing Safety',
    thumbnail: '/public/task-thumbnails/crossing-safety.jpg',
    userId: 'user-2',
    userName: 'Analyst User',
  },
  {
    id: 'task-19',
    name: 'Highway Speed Zone Analysis',
    description: 'Monitor vehicle speeds on highway',
    status: 'completed',
    priority: 'low',
    progress: 100,
    createdAt: '2023-08-05T11:00:00Z',
    startedAt: '2023-08-05T11:05:00Z',
    completedAt: '2023-08-05T11:50:00Z',
    duration: 2700, // 45 minutes
    recipeId: 'recipe-19',
    recipeName: 'Highway Traffic Speed Analysis',
    resultType: 'trafficStatistics',
    videoId: 'video-19',
    videoName: 'Highway Speed Zone',
    resultsCount: 203,
    thumbnail: '/public/task-thumbnails/highway-speed.jpg',
    userId: 'user-1',
    userName: 'Admin User',
  },
  {
    id: 'task-20',
    name: 'Cargo Train Monitoring',
    description: 'Track cargo train movements',
    status: 'running',
    priority: 'medium',
    progress: 42,
    createdAt: '2023-08-10T14:30:00Z',
    startedAt: '2023-08-10T14:35:00Z',
    recipeId: 'recipe-20',
    recipeName: 'Cargo Train Monitoring',
    resultType: 'trainDetection',
    videoId: 'video-20',
    videoName: 'Cargo Rail',
    thumbnail: '/public/task-thumbnails/cargo-train.jpg',
    userId: 'user-3',
    userName: 'Manager User',
  },
  {
    id: 'task-21',
    name: 'Morning Rush Analysis',
    description: 'Analyze morning rush hour traffic',
    status: 'completed',
    priority: 'high',
    progress: 100,
    createdAt: '2023-08-15T07:00:00Z',
    startedAt: '2023-08-15T07:05:00Z',
    completedAt: '2023-08-15T07:50:00Z',
    duration: 2700, // 45 minutes
    recipeId: 'recipe-1',
    recipeName: 'Urban Traffic Flow Analysis',
    resultType: 'trafficStatistics',
    videoId: 'video-1',
    videoName: 'Morning Rush Traffic',
    resultsCount: 287,
    thumbnail: '/public/task-thumbnails/morning-rush.jpg',
    userId: 'user-1',
    userName: 'Admin User',
  },
  {
    id: 'task-22',
    name: 'Express Train Monitoring',
    description: 'Track express train schedules',
    status: 'queued',
    priority: 'medium',
    progress: 0,
    createdAt: '2023-08-20T10:15:00Z',
    recipeId: 'recipe-3',
    recipeName: 'High-Speed Rail Monitoring',
    resultType: 'trainDetection',
    videoId: 'video-3',
    videoName: 'Express Train',
    thumbnail: '/public/task-thumbnails/express-train.jpg',
    userId: 'user-2',
    userName: 'Analyst User',
  },
  {
    id: 'task-23',
    name: 'Intersection Volume Study',
    description: 'Analyze traffic volume at intersection',
    status: 'running',
    priority: 'high',
    progress: 58,
    createdAt: '2023-08-25T09:30:00Z',
    startedAt: '2023-08-25T09:35:00Z',
    recipeId: 'recipe-2',
    recipeName: 'Downtown Traffic Monitoring',
    resultType: 'trafficStatistics',
    videoId: 'video-2',
    videoName: 'Busy Intersection',
    thumbnail: '/public/task-thumbnails/intersection.jpg',
    userId: 'user-1',
    userName: 'Admin User',
  },
  {
    id: 'task-24',
    name: 'Commuter Rail Analysis',
    description: 'Analyze commuter train patterns',
    status: 'failed',
    priority: 'medium',
    progress: 67,
    createdAt: '2023-09-01T13:45:00Z',
    startedAt: '2023-09-01T13:50:00Z',
    completedAt: '2023-09-01T14:10:00Z',
    recipeId: 'recipe-10',
    recipeName: 'Commuter Train Schedule Verification',
    resultType: 'trainDetection',
    videoId: 'video-10',
    videoName: 'Commuter Rail',
    error: 'Processing error: data corruption',
    thumbnail: '/public/task-thumbnails/commuter-rail.jpg',
    userId: 'user-3',
    userName: 'Manager User',
  },
  {
    id: 'task-25',
    name: 'Evening Peak Analysis',
    description: 'Analyze evening rush hour patterns',
    status: 'completed',
    priority: 'high',
    progress: 100,
    createdAt: '2023-09-05T17:00:00Z',
    startedAt: '2023-09-05T17:05:00Z',
    completedAt: '2023-09-05T17:55:00Z',
    duration: 3000, // 50 minutes
    recipeId: 'recipe-17',
    recipeName: 'Peak Hour Congestion Analysis',
    resultType: 'trafficStatistics',
    videoId: 'video-17',
    videoName: 'Evening Peak Traffic',
    resultsCount: 326,
    thumbnail: '/public/task-thumbnails/evening-peak.jpg',
    userId: 'user-1',
    userName: 'Admin User',
  }
];

// Get mock task statistics based on tasks
const getMockTaskStats = (): TaskStats => {
  const stats: TaskStats = {
    total: MOCK_TASKS.length,
    queued: 0,
    running: 0,
    completed: 0,
    failed: 0,
    cancelled: 0
  };

  MOCK_TASKS.forEach(task => {
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
    queryKey: ['tasks', filter],
    queryFn: async () => {
      // Mock implementation
      return filterMockTasks(MOCK_TASKS, filter);
    }
  });
}

// Get task statistics
export function useTaskStats() {
  return useQuery({
    queryKey: ['taskStats'],
    queryFn: async () => {
      // Mock implementation
      return getMockTaskStats();
    }
  });
}

// Get a single task by ID
export function useTask(id: string) {
  return useQuery({
    queryKey: ['task', id],
    queryFn: async () => {
      if (!id) return null;
      
      // Mock implementation
      const task = MOCK_TASKS.find(t => t.id === id);
      if (!task) throw new Error('Task not found');
      return task;
    },
    enabled: !!id
  });
}

// Create a new task
export function useCreateTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (taskSubmission: TaskSubmission) => {
      // Mock implementation
      const newTask: Task = {
        id: `task-${Date.now()}`,
        name: taskSubmission.name,
        description: taskSubmission.description,
        status: 'queued',
        priority: taskSubmission.priority,
        progress: 0,
        createdAt: new Date().toISOString(),
        recipeId: taskSubmission.recipeId,
        resultType: 'trafficStatistics', // Updated to valid type
        videoId: taskSubmission.videoId,
        userId: 'user-1', // Current user
        userName: 'Admin User'
      };
      
      console.log('Creating task:', newTask);
      return newTask;
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
        id: `task-${Date.now()}`,
        name: `Task from ${recipe.name}`,
        description: `Task created from recipe ${recipeId}`,
        status: 'running',
        priority: 'medium',
        progress: 0,
        createdAt: new Date().toISOString(),
        startedAt: new Date().toISOString(),
        recipeId: recipeId,
        recipeName: recipe.name,
        // Determine task type based on recipe ID to alternate between the two valid types
        resultType: recipeId.includes('train') ? 'trainDetection' : 'trafficStatistics',
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
      // Mock implementation
      const task = MOCK_TASKS.find(t => t.id === taskUpdate.id);
      if (!task) throw new Error('Task not found');
      
      const updatedTask = { ...task };
      
      if (taskUpdate.status) updatedTask.status = taskUpdate.status;
      if (taskUpdate.progress !== undefined) updatedTask.progress = taskUpdate.progress;
      if (taskUpdate.error) updatedTask.error = taskUpdate.error;
      
      console.log('Updating task:', updatedTask);
      return updatedTask;
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
      // Mock implementation
      const task = MOCK_TASKS.find(t => t.id === taskId);
      if (!task) throw new Error('Task not found');
      
      const updatedTask = { 
        ...task,
        status: 'cancelled' as const,
        completedAt: new Date().toISOString()
      };
      
      console.log('Cancelling task:', updatedTask);
      return updatedTask;
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
      // Mock implementation
      console.log('Deleting task:', taskId);
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
      // Mock implementation
      const task = MOCK_TASKS.find(t => t.id === taskId);
      if (!task) throw new Error('Task not found');
      
      const updatedTask = { 
        ...task,
        status: 'cancelled' as const,
        progress: task.progress,
        completedAt: new Date().toISOString()
      };
      
      console.log('Stopping task:', updatedTask);
      return updatedTask;
    },
    onSuccess: (data) => {
      // Invalidate both the tasks list and the specific task query
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task', data.id] });
      queryClient.invalidateQueries({ queryKey: ['taskStats'] });
    }
  });
}