import type { TaskProgress, TaskLog, TaskStreamFrame, TaskSummary } from "@/types/task-websocket";

// Mock progress data examples
export const mockProgressData: TaskProgress[] = [
  {
    taskId: "task-123",
    progress: 25.5,
    currentFrame: 2550,
    totalFrames: 10000,
    fps: 23.8,
    eta: 315, // 5 minutes 15 seconds
    processingSpeed: 1.2,
    cpuUsage: 65,
    memoryUsage: 78,
    gpuUsage: 82,
    detections: {
      car: 1234,
      truck: 456,
      bus: 89,
      person: 234,
      motorcycle: 67,
    },
    timestamp: new Date().toISOString(),
  },
  {
    taskId: "task-123",
    progress: 50.0,
    currentFrame: 5000,
    totalFrames: 10000,
    fps: 24.2,
    eta: 206, // 3 minutes 26 seconds
    processingSpeed: 1.15,
    cpuUsage: 72,
    memoryUsage: 81,
    gpuUsage: 85,
    detections: {
      car: 2468,
      truck: 912,
      bus: 178,
      person: 468,
      motorcycle: 134,
    },
    timestamp: new Date().toISOString(),
  },
  {
    taskId: "task-123",
    progress: 75.0,
    currentFrame: 7500,
    totalFrames: 10000,
    fps: 25.1,
    eta: 100, // 1 minute 40 seconds
    processingSpeed: 1.25,
    cpuUsage: 68,
    memoryUsage: 79,
    gpuUsage: 88,
    detections: {
      car: 3702,
      truck: 1368,
      bus: 267,
      person: 702,
      motorcycle: 201,
    },
    timestamp: new Date().toISOString(),
  },
];

// Mock log data examples
export const mockLogData: TaskLog[] = [
  {
    id: "log-001",
    type: "info",
    message: "Task started successfully",
    timestamp: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
  },
  {
    id: "log-002",
    type: "info",
    message: "Model loaded: YOLOv8-traffic-detection",
    timestamp: new Date(Date.now() - 295000).toISOString(),
  },
  {
    id: "log-003",
    type: "info",
    message: "Processing frame batch 1-100",
    timestamp: new Date(Date.now() - 280000).toISOString(),
    details: {
      batchStart: 1,
      batchEnd: 100,
      avgConfidence: 0.82,
    },
  },
  {
    id: "log-004",
    type: "success",
    message: "Region analysis completed for North Lane",
    timestamp: new Date(Date.now() - 270000).toISOString(),
    details: {
      regionId: "north-lane",
      objectCount: 45,
    },
  },
  {
    id: "log-005",
    type: "warning",
    message: "High memory usage detected (85%)",
    timestamp: new Date(Date.now() - 240000).toISOString(),
    details: {
      memoryUsage: 85,
      threshold: 80,
    },
  },
  {
    id: "log-006",
    type: "info",
    message: "Checkpoint saved at frame 2500",
    timestamp: new Date(Date.now() - 180000).toISOString(),
    details: {
      frame: 2500,
      checkpointSize: "15.2 MB",
    },
  },
  {
    id: "log-007",
    type: "error",
    message: "Temporary connection loss to inference server",
    timestamp: new Date(Date.now() - 120000).toISOString(),
    details: {
      server: "inference-01",
      retryAttempt: 1,
    },
  },
  {
    id: "log-008",
    type: "success",
    message: "Connection restored, resuming processing",
    timestamp: new Date(Date.now() - 115000).toISOString(),
  },
  {
    id: "log-009",
    type: "info",
    message: "Processing frame batch 5000-5100",
    timestamp: new Date(Date.now() - 60000).toISOString(),
    details: {
      batchStart: 5000,
      batchEnd: 5100,
      avgConfidence: 0.79,
    },
  },
  {
    id: "log-010",
    type: "info",
    message: "Traffic flow calculation in progress",
    timestamp: new Date(Date.now() - 30000).toISOString(),
  },
];

// Mock stream frame data
export const mockStreamFrame: TaskStreamFrame = {
  taskId: "task-123",
  frameNumber: 2500,
  timestamp: new Date().toISOString(),
  imageData: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=",
  detections: [
    {
      id: "det-001",
      type: "car",
      confidence: 0.92,
      bbox: { x: 150, y: 200, width: 120, height: 80 },
      attributes: { color: "red", size: "medium" },
    },
    {
      id: "det-002",
      type: "truck",
      confidence: 0.88,
      bbox: { x: 300, y: 180, width: 180, height: 120 },
      attributes: { color: "blue", size: "large" },
    },
    {
      id: "det-003",
      type: "person",
      confidence: 0.76,
      bbox: { x: 50, y: 250, width: 30, height: 80 },
    },
  ],
  regions: [
    {
      id: "north-lane",
      name: "North Traffic Lane",
      type: "counting_line",
      count: 45,
      active: true,
    },
    {
      id: "south-lane",
      name: "South Traffic Lane", 
      type: "counting_line",
      count: 32,
      active: true,
    },
    {
      id: "crosswalk",
      name: "Pedestrian Crosswalk",
      type: "region",
      count: 5,
      active: false,
    },
  ],
};

// Mock task completion summary
export const mockTaskSummary: TaskSummary = {
  totalFramesProcessed: 10000,
  totalObjectsDetected: 15420,
  processingTime: 420, // 7 minutes
  averageFps: 23.8,
  detectionsByType: {
    car: 8940,
    truck: 3200,
    bus: 680,
    person: 1890,
    motorcycle: 710,
  },
  peakMemoryUsage: 85,
  peakCpuUsage: 78,
};

// WebSocket message examples for testing
export const mockWebSocketMessages = {
  // Connection established
  connected: {
    type: "connected",
    taskId: "task-123",
  },

  // Progress update
  progress: {
    type: "progress",
    data: mockProgressData[0],
  },

  // Log message
  log: {
    type: "log",
    data: mockLogData[0],
  },

  // Frame data
  frame: {
    type: "frame",
    data: mockStreamFrame,
  },

  // Error message
  error: {
    type: "error",
    error: "Inference server connection timeout",
    code: "INFERENCE_TIMEOUT",
  },

  // Task completion
  complete: {
    type: "complete",
    taskId: "task-123",
    summary: mockTaskSummary,
  },

  // Disconnection
  disconnected: {
    type: "disconnected",
    taskId: "task-123",
    reason: "Task completed successfully",
  },
};

// Helper functions for generating realistic mock data
export function generateRandomProgress(currentProgress: number): TaskProgress {
  const increment = Math.random() * 2 + 0.5; // 0.5% to 2.5% increment
  const newProgress = Math.min(currentProgress + increment, 100);
  
  return {
    taskId: "task-123",
    progress: newProgress,
    currentFrame: Math.floor(newProgress * 100),
    totalFrames: 10000,
    fps: 20 + Math.random() * 10, // 20-30 FPS
    eta: Math.floor((100 - newProgress) * 10), // Rough ETA calculation
    processingSpeed: 0.8 + Math.random() * 0.8, // 0.8x to 1.6x
    cpuUsage: 40 + Math.random() * 40, // 40-80%
    memoryUsage: 50 + Math.random() * 30, // 50-80%
    gpuUsage: 60 + Math.random() * 30, // 60-90%
    detections: {
      car: Math.floor(newProgress * 50) + Math.floor(Math.random() * 100),
      truck: Math.floor(newProgress * 20) + Math.floor(Math.random() * 50),
      bus: Math.floor(newProgress * 5) + Math.floor(Math.random() * 20),
      person: Math.floor(newProgress * 15) + Math.floor(Math.random() * 30),
      motorcycle: Math.floor(newProgress * 8) + Math.floor(Math.random() * 15),
    },
    timestamp: new Date().toISOString(),
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
    id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    type,
    message,
    timestamp: new Date().toISOString(),
    details: Math.random() > 0.6 ? {
      frame: Math.floor(Math.random() * 10000),
      confidence: (Math.random() * 0.3 + 0.7).toFixed(2), // 0.70-1.00
      objects: Math.floor(Math.random() * 50),
    } : undefined,
  };
}