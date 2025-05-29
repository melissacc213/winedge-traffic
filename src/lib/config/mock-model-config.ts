import type { ModelConfig, ModelLabel } from "@/types/model";

// Mock labels for different task types
const trafficLabels: ModelLabel[] = [
  {
    id: "1",
    name: "car",
    color: "#FF6B6B",
    confidence: 0.75,
    width_threshold: 32,
    height_threshold: 32,
    area_threshold: 1024,
    enabled: true,
  },
  {
    id: "2",
    name: "truck",
    color: "#4ECDC4",
    confidence: 0.8,
    width_threshold: 48,
    height_threshold: 48,
    area_threshold: 2304,
    enabled: true,
  },
  {
    id: "3",
    name: "bus",
    color: "#45B7D1",
    confidence: 0.7,
    width_threshold: 64,
    height_threshold: 64,
    area_threshold: 4096,
    enabled: true,
  },
  {
    id: "4",
    name: "motorcycle",
    color: "#FFA07A",
    confidence: 0.65,
    width_threshold: 24,
    height_threshold: 24,
    area_threshold: 576,
    enabled: true,
  },
  {
    id: "5",
    name: "bicycle",
    color: "#98D8C8",
    confidence: 0.6,
    width_threshold: 20,
    height_threshold: 20,
    area_threshold: 400,
    enabled: true,
  },
  {
    id: "6",
    name: "person",
    color: "#DDA0DD",
    confidence: 0.7,
    width_threshold: 16,
    height_threshold: 32,
    area_threshold: 512,
    enabled: true,
  },
  {
    id: "7",
    name: "traffic_light",
    color: "#F7DC6F",
    confidence: 0.85,
    width_threshold: 12,
    height_threshold: 24,
    area_threshold: 288,
    enabled: false,
  },
  {
    id: "8",
    name: "stop_sign",
    color: "#BB8FCE",
    confidence: 0.9,
    width_threshold: 20,
    height_threshold: 20,
    area_threshold: 400,
    enabled: false,
  },
];

const trainLabels: ModelLabel[] = [
  {
    id: "1",
    name: "locomotive",
    color: "#FF6B6B",
    confidence: 0.85,
    width_threshold: 100,
    height_threshold: 80,
    area_threshold: 8000,
    enabled: true,
  },
  {
    id: "2",
    name: "passenger_car",
    color: "#4ECDC4",
    confidence: 0.8,
    width_threshold: 80,
    height_threshold: 60,
    area_threshold: 4800,
    enabled: true,
  },
  {
    id: "3",
    name: "freight_car",
    color: "#45B7D1",
    confidence: 0.8,
    width_threshold: 80,
    height_threshold: 60,
    area_threshold: 4800,
    enabled: true,
  },
  {
    id: "4",
    name: "track",
    color: "#FFA07A",
    confidence: 0.75,
    width_threshold: 40,
    height_threshold: 20,
    area_threshold: 800,
    enabled: true,
  },
  {
    id: "5",
    name: "signal",
    color: "#98D8C8",
    confidence: 0.9,
    width_threshold: 15,
    height_threshold: 30,
    area_threshold: 450,
    enabled: true,
  },
];

// Mock model configurations for different scenarios
export const mockModelConfigs = {
  trafficDetection: {
    name: "Traffic Detection Model v2.1",
    description: "Advanced traffic object detection model with support for multiple vehicle types and pedestrians",
    task: "trafficStatistics",
    version: "2.1.0",
    labels: trafficLabels,
  },
  trainDetection: {
    name: "Railway Detection Model v1.0",
    description: "Specialized model for detecting trains and railway infrastructure",
    task: "trainDetection",
    version: "1.0.0",
    labels: trainLabels,
  },
  default: {
    name: "Object Detection Model",
    description: "General purpose object detection model",
    task: "object_detection",
    version: "1.0.0",
    labels: trafficLabels.slice(0, 5), // First 5 labels only
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
      name: model?.name || mockModelConfigs.trainDetection.name,
      description: model?.description || mockModelConfigs.trainDetection.description,
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
      name: model?.name || mockModelConfigs.trafficDetection.name,
      description: model?.description || mockModelConfigs.trafficDetection.description,
    };
  }

  // Default configuration
  return {
    ...mockModelConfigs.default,
    name: model?.name || mockModelConfigs.default.name,
    description: model?.description || mockModelConfigs.default.description,
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
    id: `${Date.now()}-${index}`,
    confidence: Math.round((0.5 + Math.random() * 0.4) * 100) / 100, // 0.5 to 0.9
    enabled: Math.random() > 0.2, // 80% chance of being enabled
  }));

  return {
    ...randomConfig,
    name: `${randomConfig.name} (Copy)`,
    labels,
  };
}