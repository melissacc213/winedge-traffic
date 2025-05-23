import { create } from "zustand";
import type { Region, TaskType, RecipeStatus } from "../../types/recipe";
import type { RecipeResponse } from "../validator/recipe";

// Recipe form values interface
export interface RecipeFormValues {
  // Basic info
  name: string;
  description: string;

  // Task type
  taskType: TaskType;
  sceneType?: string;

  // Video
  videoId?: string;
  videoFile?: File | null;
  videoUrl?: string;
  videoName?: string;
  extractedFrame?: string | null;
  extractedFrameTime?: number | null;

  // Regions
  regions: Region[];

  // Model config
  modelId: string;
  modelName?: string;
  confidenceThreshold: number;
  classFilter?: string[];
  inferenceStep?: number;
}

// Initial form state
const initialFormState: RecipeFormValues = {
  // Basic info
  name: "",
  description: "",

  // Task type
  taskType: "" as TaskType,
  sceneType: "",

  // Video
  videoId: "",
  videoFile: null,
  videoUrl: "",
  videoName: "",
  extractedFrame: null,
  extractedFrameTime: null,

  // Regions
  regions: [] as Region[],

  // Model config
  modelId: "",
  modelName: "",
  confidenceThreshold: 0.5,
  classFilter: ["car", "truck", "bus", "person"],
  inferenceStep: 3,
};

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
  
  // Task type
  setTaskType: (taskType: TaskType) => void;
  
  // Video
  setVideo: (videoId: string, file?: File | null) => void;

  // Regions
  addRegion: (region: Region) => void;
  updateRegion: (region: Region) => void;
  deleteRegion: (regionId: string) => void;
  
  // Model configuration
  setModel: (modelId: string, modelName?: string) => void;
  setConfidenceThreshold: (threshold: number) => void;
  setClassFilter: (classes: string[]) => void;
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

  // Form data for recipe creation
  formValues: initialFormState,

  // List actions
  setRecipes: (recipes) => set({ recipes }),
  addRecipe: (recipe) => set((state) => ({ 
    recipes: [...state.recipes, recipe] 
  })),
  removeRecipe: (id) => set((state) => ({
    recipes: state.recipes.filter(recipe => recipe.id !== id)
  })),
  updateRecipe: (id, data) => set((state) => ({
    recipes: state.recipes.map(recipe => 
      recipe.id === id ? { ...recipe, ...data } : recipe
    )
  })),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  // Creation step actions
  nextStep: () =>
    set((state) => ({
      activeStep: Math.min(state.activeStep + 1, 3), // Now we have 4 total steps
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
    }),

  setIsSaving: (isSaving) => set({ isSaving }),
  
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
        videoId,
        videoFile: file,
        videoName: file?.name || "",
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
      },
      isDirty: true,
    })),
}));