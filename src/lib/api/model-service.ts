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
    type: "onnx",
    size: 15840000,
    status: "active" as const,
    createdAt: "2025-01-15T10:30:00Z",
    description: "YOLO model for traffic object detection",
  },
  {
    id: "model_2",
    name: "Train Detection",
    type: "pt",
    size: 25360000,
    status: "active" as const,
    createdAt: "2025-02-10T14:20:00Z",
    description: "Custom model for train detection",
  },
  {
    id: "model_3",
    name: "Traffic Counter",
    type: "tflite",
    size: 8750000,
    status: "pending" as const,
    createdAt: "2025-05-18T09:15:00Z",
    description: "TensorFlow Lite model for traffic counting",
  },
];

function getMockModels() {
  return modelsListSchema.parse(MOCK_MODELS);
}
