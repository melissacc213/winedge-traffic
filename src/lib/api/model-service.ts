import type { AxiosRequestConfig } from "axios";

import type { Model } from "../validator/model";
import { modelSchema, modelsListSchema } from "../validator/model";
import { clients } from "./index";

interface CreateModelRequest {
  name: string;
  type: string;
  size: number;
  description: string;
  parameters?: Record<string, string>;
}

export const modelService = {
  async createModel(data: CreateModelRequest, config?: AxiosRequestConfig<unknown>): Promise<Model> {
    // In production, this would call the actual API
    // const { data: responseData } = await clients.v1.private.post('/models', data, config);
    // return modelSchema.parse(responseData);

    // Mock implementation for development
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const newModel = {
      createdAt: new Date().toISOString(),
      description: data.description,
      id: `model_${Date.now()}`,
      name: data.name,
      parameters: data.parameters,
      size: data.size,
      status: "active" as const,
      type: data.type,
    };

    MOCK_MODELS.push(newModel);
    return modelSchema.parse(newModel);
  },

  async deleteModel(id: string, config?: AxiosRequestConfig<unknown>) {
    // In production, this would call the actual API
    // await clients.v1.private.delete(`/models/${id}`, config);

    // Mock implementation for development
    const index = MOCK_MODELS.findIndex((model) => model.id === id);
    if (index !== -1) {
      MOCK_MODELS.splice(index, 1);
    }
  },

  async getModel(id: string, config?: AxiosRequestConfig<unknown>) {
    // In production, this would call the actual API
    // const { data } = await clients.v1.private.get(`/models/${id}`, config);
    // return modelSchema.parse(data);

    // Mock implementation for development
    const model = MOCK_MODELS.find((model) => model.id === id);
    if (!model) throw new Error("Model not found");
    return modelSchema.parse(model);
  },

  async getModels(config?: AxiosRequestConfig<unknown>) {
    // In production, this would call the actual API
    // const { data } = await clients.v1.private.get('/models', config);
    // return modelsListSchema.parse(data);

    // Mock implementation for development
    return getMockModels();
  },

  async uploadModel(
    file: File,
    onUploadProgress?: (progressEvent: any) => void
  ) {
    // In production, this would call the actual API
    // const formData = new FormData();
    // formData.append('file', file);
    // const { data } = await clients.v1.private.post('/models/upload', formData, {
    //   headers: { 'Content-Type': 'multipart/form-data' },
    //   onUploadProgress,
    // });
    // return modelSchema.parse(data);

    // Mock implementation for development
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const newModel = {
      createdAt: new Date().toISOString(),
      description: "Uploaded model",
      id: `model_${Date.now()}`,
      name: file.name.split(".")[0],
      size: file.size,
      status: "active" as const,
      type: file.name.split(".").pop() || "unknown",
    };

    MOCK_MODELS.push(newModel);
    return modelSchema.parse(newModel);
  },
};

// Mock data for development
export const MOCK_MODELS = [
  {
    createdAt: "2025-01-15T10:30:00Z",
    description: "Advanced YOLO v8 model optimized for real-time traffic object detection. Supports detection of cars, trucks, buses, motorcycles, bicycles, and pedestrians with high accuracy.",
    format: "onnx",
    id: "model_1",
    name: "Traffic Detection YOLOv8",
    parameters: {
      classes: "6",
      framework: "PyTorch",
      input_size: "640x640",
      precision: "FP16",
    },
    size: 15840000,
    status: "active" as const,
    task: "trafficStatistics",
    type: "object_detection",
    uploadedAt: "2025-01-15T10:35:00Z",
    version: "2.1.0",
  },
  {
    createdAt: "2025-02-10T14:20:00Z",
    description: "Specialized model for railway and train detection. Detects locomotives, passenger cars, freight cars, railway tracks, and signals with optimized performance for railway environments.",
    format: "pt",
    id: "model_2",
    name: "Railway Detection Model v1.5",
    parameters: {
      classes: "5",
      framework: "PyTorch",
      input_size: "800x800",
      precision: "FP32",
    },
    size: 25360000,
    status: "available" as const,
    task: "trainDetection",
    type: "object_detection",
    uploadedAt: "2025-02-10T14:25:00Z",
    version: "1.5.0",
  },
  {
    createdAt: "2025-05-18T09:15:00Z",
    description: "Lightweight TensorFlow Lite model optimized for edge devices. Designed for efficient traffic counting with minimal computational requirements.",
    format: "tflite",
    id: "model_3",
    name: "Traffic Counter Lite",
    parameters: {
      classes: "4",
      framework: "TensorFlow",
      input_size: "416x416",
      precision: "INT8",
    },
    size: 8750000,
    status: "pending" as const,
    task: "trafficStatistics",
    type: "object_detection",
    uploadedAt: "2025-05-18T09:20:00Z",
    version: "1.0.0",
  },
];

function getMockModels() {
  return modelsListSchema.parse(MOCK_MODELS);
}
