export interface ModelLabel {
  id: string;
  name: string;
  color: string;
  confidence?: number;
  widthThreshold?: number;  // For UI consistency
  heightThreshold?: number; // For UI consistency
  areaThreshold?: number;   // For UI consistency
  width_threshold?: number;  // For API payload
  height_threshold?: number; // For API payload
  area_threshold?: number;   // For API payload
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
    hyperparameter: Record<string, unknown>;
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