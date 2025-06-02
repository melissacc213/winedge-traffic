import { create } from "zustand";

import { getMockModelConfig } from "@/lib/config/mock-model-config";

import type { ModelLabel } from "../../types/model";
import type { Region, RegionConnection,TaskType } from "../../types/recipe";
import type { RecipeResponse } from "../validator/recipe";

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
  
  classFilter: ["car", "truck", "bus", "person"],
  
confidenceThreshold: 0.5,

  
  
connections: [] as RegionConnection[],
  

description: "",
  

extractedFrame: null,

  
  

extractedFrameFilename: "",
  


extractedFrameTime: null,
  


inferenceStep: 3,
  


modelConfig: undefined,
  


// Model config
modelId: "",
  



modelName: "",

  
  


// Basic info
name: "",
  




// Regions
regions: [] as Region[],

  
  






roadType: "",

  
  






// ROI for train detection
roi: undefined,
  







sceneType: "",
  





// Task type
taskType: "",
  




videoFile: null,
  


// Video
videoId: "",
  
videoName: "",
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
  
  // UI state for recipe creation - start at step 0, which is now task type with video
activeStep: 0,
  

addRecipe: (recipe) =>
    set((state) => ({
      recipes: [...state.recipes, recipe],
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

  
  



clearModelData: () =>
    set((state) => ({
      formValues: {
        ...state.formValues,
        classFilter: ["car", "truck", "bus", "person"],
        confidenceThreshold: 0.5,
        inferenceStep: 3,
        modelConfig: undefined,
        modelId: "",
        modelName: "",
      },
      stepCompleted: {
        ...state.stepCompleted,
        step2: false,
      },
    })),
  



clearRegionsData: () =>
    set((state) => ({
      formValues: {
        ...state.formValues,
        connections: [],
        regions: [],
        roi: undefined,
      },
      stepCompleted: {
        ...state.stepCompleted,
        step1: false,
      },
    })),
  



// Clear functions for going back
clearVideoData: () =>
    set((state) => ({
      formValues: {
        ...state.formValues,
        extractedFrame: null,
        extractedFrameFilename: "",
        extractedFrameTime: null,
        videoFile: null,
        videoId: "",
        videoName: "",
      },
      stepCompleted: {
        ...state.stepCompleted,
        step0: false,
      },
    })),
  




deleteRegion: (regionId) =>
    set((state) => ({
      formValues: {
        ...state.formValues,
        // Also remove connections related to this region
connections:
          state.formValues.connections?.filter(
            (conn) =>
              conn.sourceId !== regionId && conn.destinationId !== regionId
          ) || [],
        
        regions: state.formValues.regions.filter((r) => r.id !== regionId),
      },
      isDirty: true,
    })),

  
  




error: null,

  
  




// Form data for recipe creation
formValues: initialFormState,
  





// Generate API payload based on task type
generateAPIPayload: () => {
    const state = useRecipeStore.getState();
    const { formValues } = state;

    if (!formValues.modelConfig || !formValues.extractedFrameFilename) {
      return null;
    }

    // Prepare models array from modelConfig labels
    const models = formValues.modelConfig.labels.map((label) => ({
      color: label.color || "#FF0000",
      confidence: label.confidence || formValues.modelConfig!.confidence,
      height_threshold: label.heightThreshold || 200,
      label: label.name,
      width_threshold: label.widthThreshold || 100,
    }));

    if (formValues.taskType === "trainDetection") {
      // Train detection requires ROI
      if (!formValues.roi) {
        return null;
      }

      const payload: TrainTypePayload = {
        frame: formValues.extractedFrameFilename,
        kind: "train",
        model_id: parseInt(formValues.modelId, 10),
        models,
        roi: [
          formValues.roi.x1,
          formValues.roi.y1,
          formValues.roi.x2,
          formValues.roi.y2,
        ],
      };

      return payload;
    } else if (formValues.taskType === "trafficStatistics") {
      // Traffic statistics requires polygons and routes
      if (!formValues.regions || formValues.regions.length === 0) {
        return null;
      }

      const payload: IntersectionTypePayload = {
        frame: formValues.extractedFrameFilename,
        kind: "intersection",
        model_id: parseInt(formValues.modelId, 10),
        models,
        polygons: formValues.regions.map((region) => ({
          id: region.id,
          points: region.points,
        })),
        routes:
          formValues.connections?.map((conn) => ({
            from: conn.sourceId,
            to: conn.destinationId,
          })) || [],
        subtype: formValues.roadType || "Cross",
      };

      return payload;
    }

    return null;
  },
  






isDirty: false,
  






isLoading: false,
  






isSaving: false,
  






// Load recipe data for editing
loadRecipeForEdit: (recipeId: string) => {
    // In production, this would fetch from API
    // For now, we'll use mock data or find from existing recipes
    const state = useRecipeStore.getState();
    const existingRecipe = state.recipes.find((r) => r.id === recipeId);

    if (existingRecipe) {
      // Convert API response back to form values
      set({
        activeStep: 0,
        formValues: {
          classFilter: ["car", "truck", "bus", "person"],
          confidenceThreshold: 0.7,
          connections: [],
          description: existingRecipe.description || "",
          extractedFrame: JSON.stringify({
            filename: "frame_capture.jpg",
            imageDataUrl: "/api/placeholder/800/600",
            timestamp: 45.5,
          }),
          extractedFrameFilename: "frame_capture.jpg",
          extractedFrameTime: 45.5,
          inferenceStep: 3,
          modelConfig: {
            confidence: 0.7,
            labels: getMockModelConfig(
              { name: "YOLOv8 Traffic Model", type: "object_detection" },
              existingRecipe.taskType
            ).labels,
            modelId: "1",
          },
          modelId: "1",
          modelName: "YOLOv8 Traffic Model",
          name: existingRecipe.name,
          regions:
            existingRecipe.taskType === "trafficStatistics"
              ? [
                  {
                    color: "#FF6B6B",
                    id: "region-1",
                    name: "北向車道",
                    points: [
                      { x: 100, y: 300 },
                      { x: 700, y: 300 },
                    ],
                    type: "counting_line",
                  },
                  {
                    color: "#4ECDC4",
                    id: "region-2",
                    name: "南向車道",
                    points: [
                      { x: 100, y: 400 },
                      { x: 700, y: 400 },
                    ],
                    type: "counting_line",
                  },
                ]
              : [],
          roadType:
            existingRecipe.taskType === "trafficStatistics" ? "Cross" : "",
          roi:
            existingRecipe.taskType === "trainDetection"
              ? {
                  x1: 50,
                  x2: 750,
                  y1: 50,
                  y2: 550,
                }
              : undefined,
          sceneType: "",
          taskType: existingRecipe.taskType as TaskType,
          videoId: "video_123",
          videoName: "traffic_sample.mp4",
        },
        isDirty: false, // Start at regions step for editing
        stepCompleted: {
          step0: true, // Task type already selected
          step1: true, // Regions configured
          step2: true, // Model configured
        },
      });
    }
  },

  
  






markStepCompleted: (step, completed) =>
    set((state) => ({
      stepCompleted: {
        ...state.stepCompleted,
        [`step${step}`]: completed,
      },
    })),

  





// Creation step actions
nextStep: () =>
    set((state) => ({
      activeStep: Math.min(state.activeStep + 1, 2), // 3 total steps (0-2)
    })),

  





previousStep: () =>
    set((state) => ({
      activeStep: Math.max(state.activeStep - 1, 0),
    })),

  




// Recipe list state
recipes: [],

  




removeRecipe: (id) =>
    set((state) => ({
      recipes: state.recipes.filter((recipe) => recipe.id !== id),
    })),

  




resetForm: () =>
    set({
      activeStep: 0,
      formValues: initialFormState,
      isDirty: false,
      stepCompleted: {
        step0: false,
        step1: false,
        step2: false,
      },
    }),

  




setActiveStep: (step) => set({ activeStep: step }),

  
  




setClassFilter: (classes) =>
    set((state) => ({
      formValues: {
        ...state.formValues,
        classFilter: classes,
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

  
  





setError: (error) => set({ error }),

  






setExtractedFrame: (frame, time, filename = "") =>
    set((state) => ({
      formValues: {
        ...state.formValues,
        extractedFrame: frame,
        extractedFrameFilename: filename || "frame.jpg",
        extractedFrameTime: time,
      },
      isDirty: true,
    })),

  
  







setIsSaving: (isSaving) => set({ isSaving }),

  









setLoading: (isLoading) => set({ isLoading }),

  









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

  










setModelConfig: (config) =>
    set((state) => ({
      formValues: {
        ...state.formValues,
        modelConfig: config,
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

  






// List actions
setRecipes: (recipes) => set({ recipes }),

  





setRoadType: (roadType) =>
    set((state) => ({
      formValues: { ...state.formValues, roadType },
      isDirty: true,
    })),

  




// Task type
setTaskType: (taskType) =>
    set((state) => ({
      formValues: { ...state.formValues, taskType },
      isDirty: true,
    })),

  





// Video
setVideo: (videoId, file = null) =>
    set((state) => ({
      formValues: {
        ...state.formValues,
        videoFile: file,
        videoId,
        videoName: file?.name || "",
      },
      isDirty: true,
    })),

  
  






stepCompleted: {
    step0: false,
    step1: false,
    step2: false,
  },

  






updateConnections: (connections) =>
    set((state) => ({
      formValues: {
        ...state.formValues,
        connections,
      },
      isDirty: true,
    })),

  



updateForm: (values) =>
    set((state) => ({
      formValues: { ...state.formValues, ...values },
      isDirty: true,
    })),

  
  
updateRecipe: (id, data) =>
    set((state) => ({
      recipes: state.recipes.map((recipe) =>
        recipe.id === id ? { ...recipe, ...data } : recipe
      ),
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
}));
