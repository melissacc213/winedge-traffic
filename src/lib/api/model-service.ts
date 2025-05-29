import type { AxiosRequestConfig } from "axios";
import { clients } from "./index";
import { modelSchema, modelsListSchema } from "../validator/model";
import type { Model } from "../validator/model";

interface CreateModelRequest {
  name: string;
  type: string;
  size: number;
  description: string;
  parameters?: Record<string, string>;
}

export const modelService = {
  async getModels(config?: AxiosRequestConfig<unknown>) {
    // In production, this would call the actual API
    // const { data } = await clients.v1.private.get('/models', config);
    // return modelsListSchema.parse(data);

    // Mock implementation for development
    return getMockModels();
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

  async createModel(data: CreateModelRequest, config?: AxiosRequestConfig<unknown>): Promise<Model> {
    // In production, this would call the actual API
    // const { data: responseData } = await clients.v1.private.post('/models', data, config);
    // return modelSchema.parse(responseData);

    // Mock implementation for development
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const newModel = {
      id: `model_${Date.now()}`,
      name: data.name,
      type: data.type,
      size: data.size,
      status: "active" as const,
      createdAt: new Date().toISOString(),
      description: data.description,
      parameters: data.parameters,
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
      id: `model_${Date.now()}`,
      name: file.name.split(".")[0],
      type: file.name.split(".").pop() || "unknown",
      size: file.size,
      status: "active" as const,
      createdAt: new Date().toISOString(),
      description: "Uploaded model",
    };

    MOCK_MODELS.push(newModel);
    return modelSchema.parse(newModel);
  },
};

// Mock data for development
export const MOCK_MODELS = [
  {
    id: "model_1",
    name: "Traffic Detection YOLOv8",
    type: "object_detection",
    format: "onnx",
    size: 15840000,
    status: "active" as const,
    createdAt: "2025-01-15T10:30:00Z",
    uploadedAt: "2025-01-15T10:35:00Z",
    description: "Advanced YOLO v8 model optimized for real-time traffic object detection. Supports detection of cars, trucks, buses, motorcycles, bicycles, and pedestrians with high accuracy.",
    version: "2.1.0",
    task: "trafficStatistics",
    parameters: {
      input_size: "640x640",
      classes: "6",
      precision: "FP16",
      framework: "PyTorch",
    },
  },
  {
    id: "model_2",
    name: "Railway Detection Model v1.5",
    type: "object_detection",
    format: "pt",
    size: 25360000,
    status: "available" as const,
    createdAt: "2025-02-10T14:20:00Z",
    uploadedAt: "2025-02-10T14:25:00Z",
    description: "Specialized model for railway and train detection. Detects locomotives, passenger cars, freight cars, railway tracks, and signals with optimized performance for railway environments.",
    version: "1.5.0",
    task: "trainDetection",
    parameters: {
      input_size: "800x800",
      classes: "5",
      precision: "FP32",
      framework: "PyTorch",
    },
  },
  {
    id: "model_3",
    name: "Traffic Counter Lite",
    type: "object_detection",
    format: "tflite",
    size: 8750000,
    status: "pending" as const,
    createdAt: "2025-05-18T09:15:00Z",
    uploadedAt: "2025-05-18T09:20:00Z",
    description: "Lightweight TensorFlow Lite model optimized for edge devices. Designed for efficient traffic counting with minimal computational requirements.",
    version: "1.0.0",
    task: "trafficStatistics",
    parameters: {
      input_size: "416x416",
      classes: "4",
      precision: "INT8",
      framework: "TensorFlow",
    },
  },
];

function getMockModels() {
  return modelsListSchema.parse(MOCK_MODELS);
}
