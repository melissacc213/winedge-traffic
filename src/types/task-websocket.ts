// WebSocket message types for real-time task updates
export interface TaskProgress {
  taskId: string;
  progress: number; // 0-100
  currentFrame: number;
  totalFrames: number;
  fps: number;
  eta: number; // seconds remaining
  processingSpeed: number; // multiplier (e.g., 1.5x)
  cpuUsage: number; // 0-100
  memoryUsage: number; // 0-100
  gpuUsage: number; // 0-100
  detections: Record<string, number>; // object type -> count
  timestamp: string;
}

export interface TaskLog {
  id: string;
  type: "info" | "warning" | "error" | "success";
  message: string;
  timestamp: string;
  details?: Record<string, any>;
}

export interface TaskStreamFrame {
  taskId: string;
  frameNumber: number;
  timestamp: string;
  imageData: string; // base64 encoded image
  detections: Detection[];
  regions: RegionData[];
}

export interface Detection {
  id: string;
  type: string;
  confidence: number;
  bbox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  attributes?: Record<string, any>;
}

export interface RegionData {
  id: string;
  name: string;
  type: string;
  count: number;
  active: boolean;
}

// WebSocket event types
export type TaskWebSocketEvent =
  | { type: "connected"; taskId: string }
  | { type: "disconnected"; taskId: string; reason?: string }
  | { type: "progress"; data: TaskProgress }
  | { type: "log"; data: TaskLog }
  | { type: "frame"; data: TaskStreamFrame }
  | { type: "error"; error: string; code?: string }
  | { type: "complete"; taskId: string; summary?: TaskSummary };

export interface TaskSummary {
  totalFramesProcessed: number;
  totalObjectsDetected: number;
  processingTime: number; // seconds
  averageFps: number;
  detectionsByType: Record<string, number>;
  peakMemoryUsage: number;
  peakCpuUsage: number;
}

// WebSocket connection states
export type WebSocketState = "connecting" | "connected" | "disconnected" | "error";

// WebSocket client configuration
export interface TaskWebSocketConfig {
  url: string;
  taskId: string;
  reconnectAttempts?: number;
  reconnectDelay?: number;
  heartbeatInterval?: number;
}