// Road types
export type RoadType = "straight" | "tJunction" | "crossroads";

export interface RegionPoint {
  x: number;
  y: number;
}

export interface Region {
  id: string;
  name: string;
  type: "countLine" | "areaOfInterest" | "exclusionZone";
  points: RegionPoint[];
  roadType?: RoadType;
  color?: string;
}

export interface RegionConnection {
  id: string;
  sourceId: string;
  destinationId: string;
}

// Recipe status
export type RecipeStatus = "active" | "inactive" | "error";

// Task types
export type TaskType = "trafficStatistics" | "trainDetection";

// Recipe form values interface
export interface Recipe {
  id: string;
  name: string;
  description?: string;
  taskType: TaskType;
  status: RecipeStatus;
  createdAt: string;
  updatedAt?: string;
  modelId: string;
  regions: Region[];
  confidenceThreshold: number;
  classFilter?: string[];
  inferenceStep?: number;
}

export interface RecipeFormValues {
  // Basic info
  name: string;
  description: string;

  // Task type
  taskType: TaskType | "";
  sceneType?: string;

  // Video
  videoId?: string;
  videoFile?: File | null;
  videoUrl?: string;
  videoName?: string;
  useSampleVideo?: boolean;
  extractedFrame?: string | null;
  extractedFrameTime?: number | null;

  // Regions
  regions: Region[];
  connections?: RegionConnection[];

  // Model config
  modelId: string;
  modelName?: string;
  confidenceThreshold: number;
  classFilter?: string[];
  inferenceStep?: number;
}

export interface FrameObject {
  id: string;
  type: string; // Allow any type of object (vehicle, person, train, etc.)
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface FrameData {
  imageDataUrl: string;
  frameTime: number;
  objects: FrameObject[];
}
