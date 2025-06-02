import type { TaskLog, TaskProgress, TaskStreamFrame, TaskSummary } from "@/types/task-websocket";

// Mock progress data examples
export const mockProgressData: TaskProgress[] = [
  {
    cpuUsage: 65,
    currentFrame: 2550,
    detections: {
      bus: 89,
      car: 1234,
      motorcycle: 67,
      person: 234,
      truck: 456,
    },
    eta: 315,
    fps: 23.8,
    gpuUsage: 82, 
    memoryUsage: 78,
    
// 5 minutes 15 seconds
processingSpeed: 1.2,
    

progress: 25.5,
    

taskId: "task-123",
    
timestamp: new Date().toISOString(),
    totalFrames: 10000,
  },
  {
    cpuUsage: 72,
    currentFrame: 5000,
    detections: {
      bus: 178,
      car: 2468,
      motorcycle: 134,
      person: 468,
      truck: 912,
    },
    eta: 206,
    fps: 24.2,
    gpuUsage: 85, 
    memoryUsage: 81,
    
// 3 minutes 26 seconds
processingSpeed: 1.15,
    

progress: 50.0,
    

taskId: "task-123",
    
timestamp: new Date().toISOString(),
    totalFrames: 10000,
  },
  {
    cpuUsage: 68,
    currentFrame: 7500,
    detections: {
      bus: 267,
      car: 3702,
      motorcycle: 201,
      person: 702,
      truck: 1368,
    },
    eta: 100,
    fps: 25.1,
    gpuUsage: 88, 
    memoryUsage: 79,
    
// 1 minute 40 seconds
processingSpeed: 1.25,
    

progress: 75.0,
    

taskId: "task-123",
    
timestamp: new Date().toISOString(),
    totalFrames: 10000,
  },
];

// Mock log data examples
export const mockLogData: TaskLog[] = [
  {
    id: "log-001",
    message: "Task started successfully",
    timestamp: new Date(Date.now() - 300000).toISOString(),
    type: "info", // 5 minutes ago
  },
  {
    id: "log-002",
    message: "Model loaded: YOLOv8-traffic-detection",
    timestamp: new Date(Date.now() - 295000).toISOString(),
    type: "info",
  },
  {
    details: {
      avgConfidence: 0.82,
      batchEnd: 100,
      batchStart: 1,
    },
    id: "log-003",
    message: "Processing frame batch 1-100",
    timestamp: new Date(Date.now() - 280000).toISOString(),
    type: "info",
  },
  {
    details: {
      objectCount: 45,
      regionId: "north-lane",
    },
    id: "log-004",
    message: "Region analysis completed for North Lane",
    timestamp: new Date(Date.now() - 270000).toISOString(),
    type: "success",
  },
  {
    details: {
      memoryUsage: 85,
      threshold: 80,
    },
    id: "log-005",
    message: "High memory usage detected (85%)",
    timestamp: new Date(Date.now() - 240000).toISOString(),
    type: "warning",
  },
  {
    details: {
      checkpointSize: "15.2 MB",
      frame: 2500,
    },
    id: "log-006",
    message: "Checkpoint saved at frame 2500",
    timestamp: new Date(Date.now() - 180000).toISOString(),
    type: "info",
  },
  {
    details: {
      retryAttempt: 1,
      server: "inference-01",
    },
    id: "log-007",
    message: "Temporary connection loss to inference server",
    timestamp: new Date(Date.now() - 120000).toISOString(),
    type: "error",
  },
  {
    id: "log-008",
    message: "Connection restored, resuming processing",
    timestamp: new Date(Date.now() - 115000).toISOString(),
    type: "success",
  },
  {
    details: {
      avgConfidence: 0.79,
      batchEnd: 5100,
      batchStart: 5000,
    },
    id: "log-009",
    message: "Processing frame batch 5000-5100",
    timestamp: new Date(Date.now() - 60000).toISOString(),
    type: "info",
  },
  {
    id: "log-010",
    message: "Traffic flow calculation in progress",
    timestamp: new Date(Date.now() - 30000).toISOString(),
    type: "info",
  },
];

// Mock stream frame data
export const mockStreamFrame: TaskStreamFrame = {
  detections: [
    {
      attributes: { color: "red", size: "medium" },
      bbox: { height: 80, width: 120, x: 150, y: 200 },
      confidence: 0.92,
      id: "det-001",
      type: "car",
    },
    {
      attributes: { color: "blue", size: "large" },
      bbox: { height: 120, width: 180, x: 300, y: 180 },
      confidence: 0.88,
      id: "det-002",
      type: "truck",
    },
    {
      bbox: { height: 80, width: 30, x: 50, y: 250 },
      confidence: 0.76,
      id: "det-003",
      type: "person",
    },
  ],
  frameNumber: 2500,
  imageData: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=",
  regions: [
    {
      active: true,
      count: 45,
      id: "north-lane",
      name: "North Traffic Lane",
      type: "counting_line",
    },
    {
      active: true,
      count: 32, 
      id: "south-lane",
      name: "South Traffic Lane",
      type: "counting_line",
    },
    {
      active: false,
      count: 5,
      id: "crosswalk",
      name: "Pedestrian Crosswalk",
      type: "region",
    },
  ],
  taskId: "task-123",
  timestamp: new Date().toISOString(),
};

// Mock task completion summary
export const mockTaskSummary: TaskSummary = {
  // 7 minutes
averageFps: 23.8,
  
detectionsByType: {
    bus: 680,
    car: 8940,
    motorcycle: 710,
    person: 1890,
    truck: 3200,
  },
  
peakCpuUsage: 78, 
  peakMemoryUsage: 85,
  processingTime: 420,
  totalFramesProcessed: 10000,
  totalObjectsDetected: 15420,
};

// WebSocket message examples for testing
export const mockWebSocketMessages = {
  
  // Task completion
complete: {
    summary: mockTaskSummary,
    taskId: "task-123",
    type: "complete",
  },

  
  


// Connection established
connected: {
    taskId: "task-123",
    type: "connected",
  },

  
  




// Disconnection
disconnected: {
    reason: "Task completed successfully",
    taskId: "task-123",
    type: "disconnected",
  },

  
  




// Error message
error: {
    code: "INFERENCE_TIMEOUT",
    error: "Inference server connection timeout",
    type: "error",
  },

  
  




// Frame data
frame: {
    data: mockStreamFrame,
    type: "frame",
  },

  
  



// Log message
log: {
    data: mockLogData[0],
    type: "log",
  },

  
  
// Progress update
progress: {
    data: mockProgressData[0],
    type: "progress",
  },
};

// Helper functions for generating realistic mock data
export function generateRandomProgress(currentProgress: number): TaskProgress {
  const increment = Math.random() * 2 + 0.5; // 0.5% to 2.5% increment
  const newProgress = Math.min(currentProgress + increment, 100);
  
  return {
    // 0.8x to 1.6x
cpuUsage: 40 + Math.random() * 40,
    

currentFrame: Math.floor(newProgress * 100),
    


// 60-90%
detections: {
      bus: Math.floor(newProgress * 5) + Math.floor(Math.random() * 20),
      car: Math.floor(newProgress * 50) + Math.floor(Math.random() * 100),
      motorcycle: Math.floor(newProgress * 8) + Math.floor(Math.random() * 15),
      person: Math.floor(newProgress * 15) + Math.floor(Math.random() * 30),
      truck: Math.floor(newProgress * 20) + Math.floor(Math.random() * 50),
    },
    


// 20-30 FPS
eta: Math.floor((100 - newProgress) * 10),
    



fps: 20 + Math.random() * 10, 
    


// 50-80%
gpuUsage: 60 + Math.random() * 30, 
    


// 40-80%
memoryUsage: 50 + Math.random() * 30, 
    



// Rough ETA calculation
processingSpeed: 0.8 + Math.random() * 0.8, 
    




progress: newProgress, 
    




taskId: "task-123", 
    

timestamp: new Date().toISOString(),
    totalFrames: 10000,
  };
}

export function generateRandomLog(): TaskLog {
  const logTypes: TaskLog["type"][] = ["info", "warning", "error", "success"];
  const messages = [
    "Processing frame batch...",
    "Object detection completed",
    "Saving checkpoint...", 
    "Region analysis in progress",
    "Traffic flow calculated",
    "Model inference running",
    "Buffer cleared successfully",
    "Connection health check passed",
    "Memory optimization completed",
    "Frame preprocessing finished",
  ];

  const type = logTypes[Math.floor(Math.random() * logTypes.length)];
  const message = messages[Math.floor(Math.random() * messages.length)];

  return {
    details: Math.random() > 0.6 ? {
      confidence: (Math.random() * 0.3 + 0.7).toFixed(2),
      frame: Math.floor(Math.random() * 10000), // 0.70-1.00
      objects: Math.floor(Math.random() * 50),
    } : undefined,
    id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    message,
    timestamp: new Date().toISOString(),
    type,
  };
}