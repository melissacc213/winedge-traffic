import { create } from "zustand";
import type { Region, TaskType, RegionConnection } from "../../types/recipe";
import type { RecipeResponse } from "../validator/recipe";
import type { ModelLabel } from "../../types/model";
import { getMockModelConfig } from "@/lib/config/mock-model-config";

// API payload types
export interface TrainTypePayload {
  models: Array<{
    confidence: number;
    width_threshold: number;
    height_threshold: number;
    color: string;
    label: string;
  }>;
  kind: "train";
  frame: string;
  roi: [number, number, number, number]; // [x1, y1, x2, y2]
  model_id: number;
}

export interface IntersectionTypePayload {
  models: Array<{
    confidence: number;
    width_threshold: number;
    height_threshold: number;
    color: string;
    label: string;
  }>;
  kind: "intersection";
  subtype: string; // e.g., "Cross"
  frame: string;
  polygons: Array<{
    id: string;
    points: Array<{ x: number; y: number }>;
  }>;
  routes: Array<{
    from: string;
    to: string;
  }>;
  model_id: number;
}

// Recipe form values interface
export interface RecipeFormValues {
  // Basic info
  name: string;
  description: string;

  // Task type
  taskType: TaskType | "";
  sceneType?: string;
  roadType?: string; // For intersection subtype (e.g., "Cross")

  // Video
  videoId?: string;
  videoFile?: File | null;
  videoName?: string;
  extractedFrame?: string | null;
  extractedFrameTime?: number | null;
  extractedFrameFilename?: string; // For API payload

  // Regions
  regions: Region[];
  connections?: RegionConnection[];

  // ROI for train detection (bounding box)
  roi?: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  };

  // Model config
  modelId: string;
  modelName?: string;
  confidenceThreshold: number;
  classFilter?: string[];
  inferenceStep?: number;

  // Model configuration with labels
  modelConfig?: {
    modelId: string;
    confidence: number;
    labels: ModelLabel[];
  };
}

// Initial form state
const initialFormState: RecipeFormValues = {
  // Basic info
  name: "",
  description: "",

  // Task type
  taskType: "",
  sceneType: "",
  roadType: "",

  // Video
  videoId: "",
  videoFile: null,
  videoName: "",
  extractedFrame: null,
  extractedFrameTime: null,
  extractedFrameFilename: "",

  // Regions
  regions: [] as Region[],
  connections: [] as RegionConnection[],

  // ROI for train detection
  roi: undefined,

  // Model config
  modelId: "",
  modelName: "",
  confidenceThreshold: 0.5,
  classFilter: ["car", "truck", "bus", "person"],
  inferenceStep: 3,
  modelConfig: undefined,
};

// Step completion state
interface StepCompletionState {
  step0: boolean; // Task type and video
  step1: boolean; // Region setup
  step2: boolean; // Model config
}

// Recipe state interface
interface RecipeState {
  // Recipe list state
  recipes: RecipeResponse[];
  isLoading: boolean;
  error: string | null;

  // UI state for recipe creation
  activeStep: number;
  isDirty: boolean;
  isSaving: boolean;
  stepCompleted: StepCompletionState;

  // Form data for recipe creation
  formValues: RecipeFormValues;

  // List actions
  setRecipes: (recipes: RecipeResponse[]) => void;
  addRecipe: (recipe: RecipeResponse) => void;
  removeRecipe: (id: string) => void;
  updateRecipe: (id: string, data: Partial<RecipeResponse>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Creation step actions
  nextStep: () => void;
  previousStep: () => void;
  setActiveStep: (step: number) => void;
  updateForm: (values: Partial<RecipeFormValues>) => void;
  resetForm: () => void;
  setIsSaving: (saving: boolean) => void;
  markStepCompleted: (step: number, completed: boolean) => void;

  // Task type
  setTaskType: (taskType: TaskType | "") => void;
  setRoadType: (roadType: string) => void;

  // Video
  setVideo: (videoId: string, file?: File | null) => void;
  setExtractedFrame: (
    frame: string | null,
    time: number | null,
    filename?: string
  ) => void;
  clearVideoData: () => void;

  // Regions
  addRegion: (region: Region) => void;
  updateRegion: (region: Region) => void;
  deleteRegion: (regionId: string) => void;
  updateConnections: (connections: RegionConnection[]) => void;
  setROI: (roi: RecipeFormValues["roi"]) => void;
  clearRegionsData: () => void;

  // Model configuration
  setModel: (modelId: string, modelName?: string) => void;

  // Edit mode
  loadRecipeForEdit: (recipeId: string) => void;
  setConfidenceThreshold: (threshold: number) => void;
  setClassFilter: (classes: string[]) => void;
  setModelConfig: (config: RecipeFormValues["modelConfig"]) => void;
  clearModelData: () => void;

  // API payload generation
  generateAPIPayload: () => TrainTypePayload | IntersectionTypePayload | null;
}

export const useRecipeStore = create<RecipeState>((set) => ({
  // Recipe list state
  recipes: [],
  isLoading: false,
  error: null,

  // UI state for recipe creation - start at step 0, which is now task type with video
  activeStep: 0,
  isDirty: false,
  isSaving: false,
  stepCompleted: {
    step0: false,
    step1: false,
    step2: false,
  },

  // Form data for recipe creation
  formValues: initialFormState,

  // List actions
  setRecipes: (recipes) => set({ recipes }),
  addRecipe: (recipe) =>
    set((state) => ({
      recipes: [...state.recipes, recipe],
    })),
  removeRecipe: (id) =>
    set((state) => ({
      recipes: state.recipes.filter((recipe) => recipe.id !== id),
    })),
  updateRecipe: (id, data) =>
    set((state) => ({
      recipes: state.recipes.map((recipe) =>
        recipe.id === id ? { ...recipe, ...data } : recipe
      ),
    })),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  // Creation step actions
  nextStep: () =>
    set((state) => ({
      activeStep: Math.min(state.activeStep + 1, 2), // 3 total steps (0-2)
    })),

  previousStep: () =>
    set((state) => ({
      activeStep: Math.max(state.activeStep - 1, 0),
    })),

  setActiveStep: (step) => set({ activeStep: step }),

  updateForm: (values) =>
    set((state) => ({
      formValues: { ...state.formValues, ...values },
      isDirty: true,
    })),

  resetForm: () =>
    set({
      formValues: initialFormState,
      isDirty: false,
      activeStep: 0,
      stepCompleted: {
        step0: false,
        step1: false,
        step2: false,
      },
    }),

  setIsSaving: (isSaving) => set({ isSaving }),

  markStepCompleted: (step, completed) =>
    set((state) => ({
      stepCompleted: {
        ...state.stepCompleted,
        [`step${step}`]: completed,
      },
    })),

  // Task type
  setTaskType: (taskType) =>
    set((state) => ({
      formValues: { ...state.formValues, taskType },
      isDirty: true,
    })),

  setRoadType: (roadType) =>
    set((state) => ({
      formValues: { ...state.formValues, roadType },
      isDirty: true,
    })),

  // Video
  setVideo: (videoId, file = null) =>
    set((state) => ({
      formValues: {
        ...state.formValues,
        videoId,
        videoFile: file,
        videoName: file?.name || "",
      },
      isDirty: true,
    })),

  setExtractedFrame: (frame, time, filename = "") =>
    set((state) => ({
      formValues: {
        ...state.formValues,
        extractedFrame: frame,
        extractedFrameTime: time,
        extractedFrameFilename: filename || "frame.jpg",
      },
      isDirty: true,
    })),

  // Model configuration
  setModel: (modelId, modelName = "") =>
    set((state) => ({
      formValues: {
        ...state.formValues,
        modelId,
        modelName,
      },
      isDirty: true,
    })),

  setConfidenceThreshold: (threshold) =>
    set((state) => ({
      formValues: {
        ...state.formValues,
        confidenceThreshold: threshold,
      },
      isDirty: true,
    })),

  setClassFilter: (classes) =>
    set((state) => ({
      formValues: {
        ...state.formValues,
        classFilter: classes,
      },
      isDirty: true,
    })),

  setModelConfig: (config) =>
    set((state) => ({
      formValues: {
        ...state.formValues,
        modelConfig: config,
      },
      isDirty: true,
    })),

  // Regions
  addRegion: (region) =>
    set((state) => ({
      formValues: {
        ...state.formValues,
        regions: [...state.formValues.regions, region],
      },
      isDirty: true,
    })),

  updateRegion: (region) =>
    set((state) => ({
      formValues: {
        ...state.formValues,
        regions: state.formValues.regions.map((r) =>
          r.id === region.id ? region : r
        ),
      },
      isDirty: true,
    })),

  deleteRegion: (regionId) =>
    set((state) => ({
      formValues: {
        ...state.formValues,
        regions: state.formValues.regions.filter((r) => r.id !== regionId),
        // Also remove connections related to this region
        connections:
          state.formValues.connections?.filter(
            (conn) =>
              conn.sourceId !== regionId && conn.destinationId !== regionId
          ) || [],
      },
      isDirty: true,
    })),

  updateConnections: (connections) =>
    set((state) => ({
      formValues: {
        ...state.formValues,
        connections,
      },
      isDirty: true,
    })),

  setROI: (roi) =>
    set((state) => ({
      formValues: {
        ...state.formValues,
        roi,
      },
      isDirty: true,
    })),

  // Clear functions for going back
  clearVideoData: () =>
    set((state) => ({
      formValues: {
        ...state.formValues,
        videoId: "",
        videoFile: null,
        videoName: "",
        extractedFrame: null,
        extractedFrameTime: null,
        extractedFrameFilename: "",
      },
      stepCompleted: {
        ...state.stepCompleted,
        step0: false,
      },
    })),

  clearRegionsData: () =>
    set((state) => ({
      formValues: {
        ...state.formValues,
        regions: [],
        connections: [],
        roi: undefined,
      },
      stepCompleted: {
        ...state.stepCompleted,
        step1: false,
      },
    })),

  clearModelData: () =>
    set((state) => ({
      formValues: {
        ...state.formValues,
        modelId: "",
        modelName: "",
        modelConfig: undefined,
        confidenceThreshold: 0.5,
        classFilter: ["car", "truck", "bus", "person"],
        inferenceStep: 3,
      },
      stepCompleted: {
        ...state.stepCompleted,
        step2: false,
      },
    })),

  // Generate API payload based on task type
  generateAPIPayload: () => {
    const state = useRecipeStore.getState();
    const { formValues } = state;

    if (!formValues.modelConfig || !formValues.extractedFrameFilename) {
      return null;
    }

    // Prepare models array from modelConfig labels
    const models = formValues.modelConfig.labels.map((label) => ({
      confidence: label.confidence || formValues.modelConfig!.confidence,
      width_threshold: label.widthThreshold || 100,
      height_threshold: label.heightThreshold || 200,
      color: label.color || "#FF0000",
      label: label.name,
    }));

    if (formValues.taskType === "trainDetection") {
      // Train detection requires ROI
      if (!formValues.roi) {
        return null;
      }

      const payload: TrainTypePayload = {
        models,
        kind: "train",
        frame: formValues.extractedFrameFilename,
        roi: [
          formValues.roi.x1,
          formValues.roi.y1,
          formValues.roi.x2,
          formValues.roi.y2,
        ],
        model_id: parseInt(formValues.modelId, 10),
      };

      return payload;
    } else if (formValues.taskType === "trafficStatistics") {
      // Traffic statistics requires polygons and routes
      if (!formValues.regions || formValues.regions.length === 0) {
        return null;
      }

      const payload: IntersectionTypePayload = {
        models,
        kind: "intersection",
        subtype: formValues.roadType || "Cross",
        frame: formValues.extractedFrameFilename,
        polygons: formValues.regions.map((region) => ({
          id: region.id,
          points: region.points,
        })),
        routes:
          formValues.connections?.map((conn) => ({
            from: conn.sourceId,
            to: conn.destinationId,
          })) || [],
        model_id: parseInt(formValues.modelId, 10),
      };

      return payload;
    }

    return null;
  },

  // Load recipe data for editing
  loadRecipeForEdit: (recipeId: string) => {
    // In production, this would fetch from API
    // For now, we'll use mock data or find from existing recipes
    const state = useRecipeStore.getState();
    const existingRecipe = state.recipes.find((r) => r.id === recipeId);

    if (existingRecipe) {
      // Convert API response back to form values
      set({
        formValues: {
          name: existingRecipe.name,
          description: existingRecipe.description || "",
          taskType: existingRecipe.taskType as TaskType,
          sceneType: "",
          roadType:
            existingRecipe.taskType === "trafficStatistics" ? "Cross" : "",
          videoId: "video_123",
          videoName: "traffic_sample.mp4",
          extractedFrame: JSON.stringify({
            imageDataUrl: "/api/placeholder/800/600",
            timestamp: 45.5,
            filename: "frame_capture.jpg",
          }),
          extractedFrameTime: 45.5,
          extractedFrameFilename: "frame_capture.jpg",
          regions:
            existingRecipe.taskType === "trafficStatistics"
              ? [
                  {
                    id: "region-1",
                    name: "北向車道",
                    points: [
                      { x: 100, y: 300 },
                      { x: 700, y: 300 },
                    ],
                    type: "counting_line",
                    color: "#FF6B6B",
                  },
                  {
                    id: "region-2",
                    name: "南向車道",
                    points: [
                      { x: 100, y: 400 },
                      { x: 700, y: 400 },
                    ],
                    type: "counting_line",
                    color: "#4ECDC4",
                  },
                ]
              : [],
          connections: [],
          roi:
            existingRecipe.taskType === "trainDetection"
              ? {
                  x1: 50,
                  y1: 50,
                  x2: 750,
                  y2: 550,
                }
              : undefined,
          modelId: "1",
          modelName: "YOLOv8 Traffic Model",
          confidenceThreshold: 0.7,
          classFilter: ["car", "truck", "bus", "person"],
          inferenceStep: 3,
          modelConfig: {
            modelId: "1",
            confidence: 0.7,
            labels: getMockModelConfig(
              { name: "YOLOv8 Traffic Model", type: "object_detection" },
              existingRecipe.taskType
            ).labels,
          },
        },
        isDirty: false,
        activeStep: 0, // Start at regions step for editing
        stepCompleted: {
          step0: true, // Task type already selected
          step1: true, // Regions configured
          step2: true, // Model configured
        },
      });
    }
  },
}));
