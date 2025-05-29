export interface TaskMetrics {
  processingFps?: number;
  objectsCounted?: number;
  totalFrames?: number;
  processedFrames?: number;
  avgConfidence?: number;
  detectionCounts?: Record<string, number>;
  cpuUsage?: number;
  memoryUsage?: number;
  lastUpdated?: string;
}