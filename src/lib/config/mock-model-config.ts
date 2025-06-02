import type { ModelConfig, ModelLabel } from "@/types/model";

// Mock labels for different task types
const trafficLabels: ModelLabel[] = [
  {
    area_threshold: 1024,
    color: "#FF6B6B",
    confidence: 0.75,
    enabled: true,
    height_threshold: 32,
    id: "1",
    name: "car",
    width_threshold: 32,
  },
  {
    area_threshold: 2304,
    color: "#4ECDC4",
    confidence: 0.8,
    enabled: true,
    height_threshold: 48,
    id: "2",
    name: "truck",
    width_threshold: 48,
  },
  {
    area_threshold: 4096,
    color: "#45B7D1",
    confidence: 0.7,
    enabled: true,
    height_threshold: 64,
    id: "3",
    name: "bus",
    width_threshold: 64,
  },
  {
    area_threshold: 576,
    color: "#FFA07A",
    confidence: 0.65,
    enabled: true,
    height_threshold: 24,
    id: "4",
    name: "motorcycle",
    width_threshold: 24,
  },
  {
    area_threshold: 400,
    color: "#98D8C8",
    confidence: 0.6,
    enabled: true,
    height_threshold: 20,
    id: "5",
    name: "bicycle",
    width_threshold: 20,
  },
  {
    area_threshold: 512,
    color: "#DDA0DD",
    confidence: 0.7,
    enabled: true,
    height_threshold: 32,
    id: "6",
    name: "person",
    width_threshold: 16,
  },
  {
    area_threshold: 288,
    color: "#F7DC6F",
    confidence: 0.85,
    enabled: false,
    height_threshold: 24,
    id: "7",
    name: "traffic_light",
    width_threshold: 12,
  },
  {
    area_threshold: 400,
    color: "#BB8FCE",
    confidence: 0.9,
    enabled: false,
    height_threshold: 20,
    id: "8",
    name: "stop_sign",
    width_threshold: 20,
  },
];

const trainLabels: ModelLabel[] = [
  {
    area_threshold: 8000,
    color: "#FF6B6B",
    confidence: 0.85,
    enabled: true,
    height_threshold: 80,
    id: "1",
    name: "locomotive",
    width_threshold: 100,
  },
  {
    area_threshold: 4800,
    color: "#4ECDC4",
    confidence: 0.8,
    enabled: true,
    height_threshold: 60,
    id: "2",
    name: "passenger_car",
    width_threshold: 80,
  },
  {
    area_threshold: 4800,
    color: "#45B7D1",
    confidence: 0.8,
    enabled: true,
    height_threshold: 60,
    id: "3",
    name: "freight_car",
    width_threshold: 80,
  },
  {
    area_threshold: 800,
    color: "#FFA07A",
    confidence: 0.75,
    enabled: true,
    height_threshold: 20,
    id: "4",
    name: "track",
    width_threshold: 40,
  },
  {
    area_threshold: 450,
    color: "#98D8C8",
    confidence: 0.9,
    enabled: true,
    height_threshold: 30,
    id: "5",
    name: "signal",
    width_threshold: 15,
  },
];

// Mock model configurations for different scenarios
export const mockModelConfigs = {
  default: {
    description: "General purpose object detection model",
    labels: trafficLabels.slice(0, 5),
    name: "Object Detection Model",
    task: "object_detection",
    version: "1.0.0", // First 5 labels only
  },
  trafficDetection: {
    description: "Advanced traffic object detection model with support for multiple vehicle types and pedestrians",
    labels: trafficLabels,
    name: "Traffic Detection Model v2.1",
    task: "trafficStatistics",
    version: "2.1.0",
  },
  trainDetection: {
    description: "Specialized model for detecting trains and railway infrastructure",
    labels: trainLabels,
    name: "Railway Detection Model v1.0",
    task: "trainDetection",
    version: "1.0.0",
  },
};

/**
 * Get mock model configuration based on model name or task type
 */
export function getMockModelConfig(
  model?: { name?: string; description?: string; type?: string },
  taskType?: string
): ModelConfig {
  // Try to determine the type of model from its name or type
  const modelName = model?.name?.toLowerCase() || "";
  const modelType = model?.type?.toLowerCase() || "";
  const task = taskType?.toLowerCase() || "";

  // Check for train/railway related models
  if (
    modelName.includes("train") ||
    modelName.includes("railway") ||
    modelType.includes("train") ||
    task.includes("train")
  ) {
    return {
      ...mockModelConfigs.trainDetection,
      description: model?.description || mockModelConfigs.trainDetection.description,
      name: model?.name || mockModelConfigs.trainDetection.name,
    };
  }

  // Check for traffic related models
  if (
    modelName.includes("traffic") ||
    modelName.includes("vehicle") ||
    modelType.includes("traffic") ||
    task.includes("traffic")
  ) {
    return {
      ...mockModelConfigs.trafficDetection,
      description: model?.description || mockModelConfigs.trafficDetection.description,
      name: model?.name || mockModelConfigs.trafficDetection.name,
    };
  }

  // Default configuration
  return {
    ...mockModelConfigs.default,
    description: model?.description || mockModelConfigs.default.description,
    name: model?.name || mockModelConfigs.default.name,
  };
}

/**
 * Generate random model configuration for testing
 */
export function generateRandomModelConfig(): ModelConfig {
  const configs = Object.values(mockModelConfigs);
  const randomConfig = configs[Math.floor(Math.random() * configs.length)];
  
  // Randomize some values
  const labels = randomConfig.labels.map((label, index) => ({
    ...label,
    confidence: Math.round((0.5 + Math.random() * 0.4) * 100) / 100,
    // 0.5 to 0.9
enabled: Math.random() > 0.2, 
    id: `${Date.now()}-${index}`, // 80% chance of being enabled
  }));

  return {
    ...randomConfig,
    labels,
    name: `${randomConfig.name} (Copy)`,
  };
}