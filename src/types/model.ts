export interface ModelLabel {
  id: string;
  name: string;
  color: string;
  confidence?: number;
  width_threshold?: number;
  height_threshold?: number;
  enabled?: boolean;
}

export interface ModelConfig {
  id?: number;
  name: string;
  description?: string;
  created_time?: string;
  updated_time?: string;
  task: string;
  algorithm?: {
    id: number;
    hyperparameter: Record<string, any>;
  };
  deployment?: {
    name: string;
    vendor: string;
  };
  labels: ModelLabel[];
}

export interface ModelParseResult {
  success: boolean;
  config?: ModelConfig;
  error?: string;
  labelFile?: string[];
}