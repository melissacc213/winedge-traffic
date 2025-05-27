import { create } from 'zustand';

export interface Model {
  id: string;
  name: string;
  type: string;
  size: number;
  status: 'active' | 'pending' | 'failed' | 'processing' | 'available' | 'error';
  createdAt?: string;
  description?: string;
  error?: string;
  uploadedAt?: string;
  parameters?: Record<string, string>;
}

interface ModelState {
  models: Model[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchModels: () => Promise<void>;
  addModel: (model: Model) => void;
  removeModel: (id: string) => void;
  updateModel: (id: string, data: Partial<Model>) => void;
}

// Mock data
const MOCK_MODELS: Model[] = [
  {
    id: 'model_1',
    name: 'Traffic Detection YOLOv8',
    type: 'onnx',
    size: 15840000,
    status: 'active',
    createdAt: '2025-01-15T10:30:00Z',
    description: 'YOLO model for traffic object detection',
  },
  {
    id: 'model_2',
    name: 'Train Detection',
    type: 'pt',
    size: 25360000,
    status: 'active',
    createdAt: '2025-02-10T14:20:00Z',
    description: 'Custom model for train detection',
  },
  {
    id: 'model_3',
    name: 'Traffic Counter',
    type: 'tflite',
    size: 8750000,
    status: 'pending',
    createdAt: '2025-05-18T09:15:00Z',
    description: 'TensorFlow Lite model for traffic counting',
  },
];

interface UploadProgress {
  progress: number;
  status: 'uploading' | 'processing' | 'error';
  error?: string;
}

interface ModelState {
  models: Model[];
  isLoading: boolean;
  error: string | null;
  uploadProgress: Record<string, UploadProgress>;
  
  // Actions
  fetchModels: () => Promise<void>;
  setModels: (models: Model[]) => void;
  addModel: (model: Model) => void;
  removeModel: (id: string) => void;
  updateModel: (id: string, data: Partial<Model>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setUploadProgress: (id: string, progress: Partial<UploadProgress>) => void;
  clearUploadProgress: (id: string) => void;
}

export const useModelStore = create<ModelState>((set, get) => ({
  models: [],
  isLoading: false,
  error: null,
  uploadProgress: {},
  
  fetchModels: async () => {
    set({ isLoading: true, error: null });
    try {
      // Simulate API fetch
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, this would be an API call
      set({ models: MOCK_MODELS, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch models', 
        isLoading: false 
      });
    }
  },
  
  addModel: (model: Model) => {
    set(state => ({
      models: [...state.models, model],
    }));
  },
  
  removeModel: (id: string) => {
    set(state => ({
      models: state.models.filter(model => model.id !== id),
    }));
  },
  
  updateModel: (id: string, data: Partial<Model>) => {
    set(state => ({
      models: state.models.map(model => 
        model.id === id ? { ...model, ...data } : model
      ),
    }));
  },
  
  setModels: (models) => set({ models }),
  
  setLoading: (isLoading) => set({ isLoading }),
  
  setError: (error) => set({ error }),
  
  setUploadProgress: (id, progress) => set(state => ({
    uploadProgress: {
      ...state.uploadProgress,
      [id]: { ...state.uploadProgress[id], ...progress }
    }
  })),
  
  clearUploadProgress: (id) => set(state => {
    const newProgress = { ...state.uploadProgress };
    delete newProgress[id];
    return { uploadProgress: newProgress };
  }),
}));