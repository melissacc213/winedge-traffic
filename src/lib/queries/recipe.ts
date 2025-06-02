import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { clients } from "../api";
import { recipeService } from "../api/recipe-service";
import { useRecipeStore } from "../store/recipe-store";
import type { RecipeFormValues } from "../validator/recipe";
import { recipeSchema, recipesListSchema } from "../validator/recipe";

// Mock data for development
export const MOCK_RECIPES = [
  {
    classFilter: ["car", "truck", "bus"],
    confidenceThreshold: 0.6,
    createdAt: "2023-04-01T12:00:00Z",
    description: "Track and analyze traffic patterns at the main city intersection",
    id: "recipe-1",
    modelId: "model-1",
    name: "Urban Traffic Flow Analysis",
    regions: [
      {
        id: "region-1",
        name: "North-South Line",
        points: [
          { x: 100, y: 200 },
          { x: 300, y: 200 },
          { x: 300, y: 220 },
          { x: 100, y: 220 },
        ],
        type: "countLine",
      },
      {
        id: "region-1b",
        name: "East-West Line",
        points: [
          { x: 150, y: 150 },
          { x: 150, y: 300 },
          { x: 170, y: 300 },
          { x: 170, y: 150 },
        ],
        type: "countLine",
      },
    ],
    status: "active",
    taskType: "trafficStatistics",
    videoId: "video-1",
  },
  {
    classFilter: ["car", "truck", "bus", "motorcycle"],
    confidenceThreshold: 0.5,
    createdAt: "2023-04-05T14:30:00Z",
    description: "Monitor traffic flow and congestion in downtown area",
    id: "recipe-2",
    modelId: "model-2",
    name: "Downtown Traffic Monitoring",
    regions: [
      {
        id: "region-2",
        name: "Main Avenue",
        points: [
          { x: 50, y: 50 },
          { x: 450, y: 50 },
          { x: 450, y: 350 },
          { x: 50, y: 350 },
        ],
        type: "areaOfInterest",
      },
    ],
    status: "active",
    taskType: "trafficStatistics",
    videoId: "video-2",
  },
  {
    classFilter: ["train", "locomotive", "cargo"],
    confidenceThreshold: 0.7,
    createdAt: "2023-05-10T09:15:00Z",
    description: "Track and monitor high-speed trains on dedicated railway",
    id: "recipe-3",
    modelId: "model-3",
    name: "High-Speed Rail Monitoring",
    regions: [
      {
        id: "region-3a",
        name: "Track Segment 1",
        points: [
          { x: 100, y: 100 },
          { x: 500, y: 100 },
          { x: 500, y: 300 },
          { x: 100, y: 300 },
        ],
        type: "areaOfInterest",
      },
      {
        id: "region-3b",
        name: "Speed Measurement Line",
        points: [
          { x: 200, y: 200 },
          { x: 400, y: 200 },
          { x: 400, y: 210 },
          { x: 200, y: 210 },
        ],
        type: "countLine",
      },
    ],
    status: "active",
    taskType: "trainDetection",
    videoId: "video-3",
  },
  {
    classFilter: ["subway", "passenger"],
    confidenceThreshold: 0.65,
    createdAt: "2023-05-20T16:45:00Z",
    description: "Track train arrivals and departures at subway platform",
    id: "recipe-4",
    modelId: "model-4",
    name: "Subway Station Monitoring",
    regions: [
      {
        id: "region-4",
        name: "Platform Area",
        points: [
          { x: 150, y: 150 },
          { x: 350, y: 150 },
          { x: 350, y: 250 },
          { x: 150, y: 250 },
        ],
        type: "areaOfInterest",
      },
    ],
    status: "inactive",
    taskType: "trainDetection",
    videoId: "video-4",
  },
  {
    classFilter: ["car", "truck", "bus", "motorcycle"],
    confidenceThreshold: 0.8,
    createdAt: "2023-06-05T10:20:00Z",
    description: "Monitor and predict traffic congestion in high-traffic areas",
    id: "recipe-5",
    modelId: "model-5",
    name: "Traffic Congestion Analysis",
    regions: [
      {
        id: "region-5",
        name: "Highway Junction",
        points: [
          { x: 200, y: 100 },
          { x: 300, y: 100 },
          { x: 300, y: 200 },
          { x: 200, y: 200 },
        ],
        type: "areaOfInterest",
      },
    ],
    status: "error",
    taskType: "trafficStatistics",
    videoId: "video-5",
  },
  {
    classFilter: ["train", "barrier"],
    confidenceThreshold: 0.6,
    createdAt: "2023-06-15T14:00:00Z",
    description: "Track train movements at railway crossing for safety",
    id: "recipe-6",
    modelId: "model-6",
    name: "Railway Crossing Monitoring",
    regions: [
      {
        id: "region-6a",
        name: "Track Zone",
        points: [
          { x: 100, y: 300 },
          { x: 500, y: 300 },
          { x: 500, y: 350 },
          { x: 100, y: 350 },
        ],
        type: "areaOfInterest",
      },
      {
        id: "region-6b",
        name: "Crossing Line",
        points: [
          { x: 250, y: 300 },
          { x: 250, y: 350 },
          { x: 260, y: 350 },
          { x: 260, y: 300 },
        ],
        type: "countLine",
      },
    ],
    status: "active",
    taskType: "trainDetection",
    videoId: "video-6",
  },
  {
    classFilter: ["car", "truck", "bus", "motorcycle"],
    confidenceThreshold: 0.7,
    createdAt: "2023-07-02T08:30:00Z",
    description: "Monitor and analyze traffic patterns during peak hours",
    id: "recipe-7",
    modelId: "model-7",
    name: "Rush Hour Traffic Analysis",
    regions: [
      {
        id: "region-7",
        name: "Main Intersection",
        points: [
          { x: 150, y: 250 },
          { x: 350, y: 250 },
          { x: 350, y: 400 },
          { x: 150, y: 400 },
        ],
        type: "areaOfInterest",
      },
    ],
    status: "inactive",
    taskType: "trafficStatistics",
    videoId: "video-7",
  },
  {
    classFilter: ["freight", "cargo", "locomotive"],
    confidenceThreshold: 0.75,
    createdAt: "2023-07-15T11:45:00Z",
    description: "Track and monitor freight trains across rail network",
    id: "recipe-8",
    modelId: "model-8",
    name: "Freight Train Tracking",
    regions: [
      {
        id: "region-8a",
        name: "Main Track",
        points: [
          { x: 100, y: 100 },
          { x: 400, y: 100 },
          { x: 400, y: 400 },
          { x: 100, y: 400 },
        ],
        type: "areaOfInterest",
      },
      {
        id: "region-8b",
        name: "Restricted Zone",
        points: [
          { x: 200, y: 200 },
          { x: 300, y: 200 },
          { x: 300, y: 300 },
          { x: 200, y: 300 },
        ],
        type: "exclusionZone",
      },
    ],
    status: "active",
    taskType: "trainDetection",
    videoId: "video-8",
  },
  {
    classFilter: ["car", "bus", "truck", "motorcycle", "bicycle"],
    confidenceThreshold: 0.65,
    createdAt: "2023-08-05T09:30:00Z",
    description: "Monitor and analyze traffic density in urban zones",
    id: "recipe-9",
    modelId: "model-9",
    name: "Urban Traffic Density Analysis",
    regions: [
      {
        id: "region-9",
        name: "Urban Zone",
        points: [
          { x: 120, y: 120 },
          { x: 380, y: 120 },
          { x: 380, y: 280 },
          { x: 120, y: 280 },
        ],
        type: "areaOfInterest",
      },
    ],
    status: "active",
    taskType: "trafficStatistics",
    videoId: "video-9",
  },
  {
    classFilter: ["commuter_train", "passenger"],
    confidenceThreshold: 0.75,
    createdAt: "2023-08-12T14:45:00Z",
    description: "Verify commuter train schedules against actual arrivals",
    id: "recipe-10",
    modelId: "model-10",
    name: "Commuter Train Schedule Verification",
    regions: [
      {
        id: "region-10",
        name: "Station Platform",
        points: [
          { x: 180, y: 180 },
          { x: 380, y: 180 },
          { x: 380, y: 280 },
          { x: 180, y: 280 },
        ],
        type: "areaOfInterest",
      },
    ],
    status: "active",
    taskType: "trainDetection",
    videoId: "video-10",
  },
  {
    classFilter: ["car", "truck", "bus", "motorcycle"],
    confidenceThreshold: 0.6,
    createdAt: "2023-08-20T10:15:00Z",
    description: "Analyze traffic flow patterns on major highway",
    id: "recipe-11",
    modelId: "model-11",
    name: "Highway Traffic Flow Analysis",
    regions: [
      {
        id: "region-11a",
        name: "Northbound Lane",
        points: [
          { x: 100, y: 150 },
          { x: 150, y: 150 },
          { x: 150, y: 350 },
          { x: 100, y: 350 },
        ],
        type: "areaOfInterest",
      },
      {
        id: "region-11b",
        name: "Southbound Lane",
        points: [
          { x: 200, y: 150 },
          { x: 250, y: 150 },
          { x: 250, y: 350 },
          { x: 200, y: 350 },
        ],
        type: "areaOfInterest",
      },
    ],
    status: "active",
    taskType: "trafficStatistics",
    videoId: "video-11",
  },
  {
    classFilter: ["maintenance_train", "equipment"],
    confidenceThreshold: 0.7,
    createdAt: "2023-09-01T08:30:00Z",
    description: "Track maintenance trains and equipment on railway",
    id: "recipe-12",
    modelId: "model-12",
    name: "Railway Maintenance Inspection",
    regions: [
      {
        id: "region-12",
        name: "Maintenance Section",
        points: [
          { x: 120, y: 200 },
          { x: 420, y: 200 },
          { x: 420, y: 250 },
          { x: 120, y: 250 },
        ],
        type: "areaOfInterest",
      },
    ],
    status: "active",
    taskType: "trainDetection",
    videoId: "video-12",
  },
  {
    classFilter: ["car", "bus", "bicycle", "pedestrian"],
    confidenceThreshold: 0.75,
    createdAt: "2023-09-10T09:00:00Z",
    description: "Monitor traffic patterns and speed in school zones",
    id: "recipe-13",
    modelId: "model-13",
    name: "School Zone Traffic Monitoring",
    regions: [
      {
        id: "region-13",
        name: "School Zone",
        points: [
          { x: 150, y: 150 },
          { x: 350, y: 150 },
          { x: 350, y: 300 },
          { x: 150, y: 300 },
        ],
        type: "areaOfInterest",
      },
    ],
    status: "active",
    taskType: "trafficStatistics",
    videoId: "video-13",
  },
  {
    classFilter: ["bullet_train"],
    confidenceThreshold: 0.8,
    createdAt: "2023-09-18T13:45:00Z",
    description: "Analyze high-speed bullet train velocity",
    id: "recipe-14",
    modelId: "model-14",
    name: "Bullet Train Velocity Analysis",
    regions: [
      {
        id: "region-14a",
        name: "Entry Point",
        points: [
          { x: 100, y: 200 },
          { x: 100, y: 250 },
        ],
        type: "countLine",
      },
      {
        id: "region-14b",
        name: "Exit Point",
        points: [
          { x: 400, y: 200 },
          { x: 400, y: 250 },
        ],
        type: "countLine",
      },
    ],
    status: "active",
    taskType: "trainDetection",
    videoId: "video-14",
  },
  {
    classFilter: ["car", "bus", "truck", "motorcycle", "bicycle", "pedestrian"],
    confidenceThreshold: 0.65,
    createdAt: "2023-10-05T10:30:00Z",
    description: "Monitor and manage traffic in city center area",
    id: "recipe-15",
    modelId: "model-15",
    name: "City Center Traffic Management",
    regions: [
      {
        id: "region-15",
        name: "City Center Grid",
        points: [
          { x: 100, y: 100 },
          { x: 400, y: 100 },
          { x: 400, y: 400 },
          { x: 100, y: 400 },
        ],
        type: "areaOfInterest",
      },
    ],
    status: "active",
    taskType: "trafficStatistics",
    videoId: "video-15",
  },
  {
    classFilter: ["passenger_train", "freight_train"],
    confidenceThreshold: 0.7,
    createdAt: "2023-10-15T14:20:00Z",
    description: "Monitor train movements at critical railway junction",
    id: "recipe-16",
    modelId: "model-16",
    name: "Railway Junction Analysis",
    regions: [
      {
        id: "region-16",
        name: "Junction Zone",
        points: [
          { x: 150, y: 150 },
          { x: 350, y: 150 },
          { x: 350, y: 300 },
          { x: 150, y: 300 },
        ],
        type: "areaOfInterest",
      },
    ],
    status: "active",
    taskType: "trainDetection",
    videoId: "video-16",
  },
  {
    classFilter: ["car", "bus", "truck"],
    confidenceThreshold: 0.65,
    createdAt: "2023-11-01T08:45:00Z",
    description: "Analyze traffic congestion during peak hours",
    id: "recipe-17",
    modelId: "model-17",
    name: "Peak Hour Congestion Analysis",
    regions: [
      {
        id: "region-17",
        name: "Congestion Zone",
        points: [
          { x: 120, y: 180 },
          { x: 380, y: 180 },
          { x: 380, y: 320 },
          { x: 120, y: 320 },
        ],
        type: "areaOfInterest",
      },
    ],
    status: "active",
    taskType: "trafficStatistics",
    videoId: "video-17",
  },
  {
    classFilter: ["train", "car", "truck", "pedestrian"],
    confidenceThreshold: 0.8,
    createdAt: "2023-11-10T13:30:00Z",
    description: "Monitor safety at railway crossings",
    id: "recipe-18",
    modelId: "model-18",
    name: "Railway Crossing Safety Analysis",
    regions: [
      {
        id: "region-18",
        name: "Crossing Area",
        points: [
          { x: 150, y: 150 },
          { x: 350, y: 150 },
          { x: 350, y: 250 },
          { x: 150, y: 250 },
        ],
        type: "areaOfInterest",
      },
    ],
    status: "active",
    taskType: "trainDetection",
    videoId: "video-18",
  },
  {
    classFilter: ["car", "truck", "motorcycle"],
    confidenceThreshold: 0.7,
    createdAt: "2023-11-20T09:15:00Z",
    description: "Monitor vehicle speeds on highway segments",
    id: "recipe-19",
    modelId: "model-19",
    name: "Highway Traffic Speed Analysis",
    regions: [
      {
        id: "region-19a",
        name: "Speed Zone Start",
        points: [
          { x: 100, y: 200 },
          { x: 150, y: 200 },
        ],
        type: "countLine",
      },
      {
        id: "region-19b",
        name: "Speed Zone End",
        points: [
          { x: 350, y: 200 },
          { x: 400, y: 200 },
        ],
        type: "countLine",
      },
    ],
    status: "active",
    taskType: "trafficStatistics",
    videoId: "video-19",
  },
  {
    classFilter: ["cargo_train", "freight_car"],
    confidenceThreshold: 0.75,
    createdAt: "2023-12-01T10:00:00Z",
    description: "Track and analyze cargo train movements",
    id: "recipe-20",
    modelId: "model-20",
    name: "Cargo Train Monitoring",
    regions: [
      {
        id: "region-20",
        name: "Cargo Loading Zone",
        points: [
          { x: 100, y: 150 },
          { x: 400, y: 150 },
          { x: 400, y: 250 },
          { x: 100, y: 250 },
        ],
        type: "areaOfInterest",
      },
    ],
    status: "active",
    taskType: "trainDetection",
    videoId: "video-20",
  },
];

// Mock class categories
export const MOCK_CLASS_CATEGORIES = [
  { id: "car", label: "Car" },
  { id: "truck", label: "Truck" },
  { id: "bus", label: "Bus" },
  { id: "motorcycle", label: "Motorcycle" },
  { id: "bicycle", label: "Bicycle" },
  { id: "person", label: "Person" },
  { id: "red_light", label: "Red Light" },
  { id: "green_light", label: "Green Light" },
  { id: "yellow_light", label: "Yellow Light" },
  { id: "vehicle", label: "Generic Vehicle" },
];

// Define query keys for recipes
export const recipeKeys = {
  all: ['recipes'] as const,
  detail: (id: string) => [...recipeKeys.details(), id] as const,
  details: () => [...recipeKeys.all, 'detail'] as const,
  list: (filters: string) => [...recipeKeys.lists(), { filters }] as const,
  lists: () => [...recipeKeys.all, 'list'] as const,
};

// Get all recipes
export function useRecipes() {
  const setRecipes = useRecipeStore((state) => state.setRecipes);
  const setLoading = useRecipeStore((state) => state.setLoading);
  const setError = useRecipeStore((state) => state.setError);

  return useQuery({
    queryFn: async () => {
      setLoading(true);
      try {
        // In production, replace with actual API call
        // const { data } = await clients.v1.private.get('/recipes');
        // const result = recipesListSchema.parse(data);
        
        // Using mock data for development
        const result = recipesListSchema.parse(MOCK_RECIPES);
        setRecipes(result);
        setError(null);
        return result;
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to fetch recipes');
        throw error;
      } finally {
        setLoading(false);
      }
    },
    queryKey: recipeKeys.lists(),
  });
}

// Get a single recipe by ID
export function useRecipe(id: string) {
  const updateRecipe = useRecipeStore((state) => state.updateRecipe);

  return useQuery({
    enabled: !!id,
    queryFn: async () => {
      if (!id) return null;

      // In production, replace with actual API call
      // const { data } = await clients.v1.private.get(`/recipes/${id}`);
      // const result = recipeSchema.parse(data);

      // Using mock data for development
      const recipe = MOCK_RECIPES.find((r) => r.id === id);
      if (!recipe) throw new Error("Recipe not found");
      const result = recipeSchema.parse(recipe);
      
      updateRecipe(id, result);
      return result;
    },
    queryKey: recipeKeys.detail(id),
  });
}

// Create a new recipe
export function useCreateRecipe() {
  const queryClient = useQueryClient();
  const addRecipe = useRecipeStore((state) => state.addRecipe);
  const generateAPIPayload = useRecipeStore((state) => state.generateAPIPayload);
  const formValues = useRecipeStore((state) => state.formValues);

  return useMutation({
    mutationFn: async () => {
      // Generate the API payload from the store
      const payload = generateAPIPayload();
      
      if (!payload) {
        throw new Error("Failed to generate API payload. Please ensure all required fields are filled.");
      }

      // In production, use the actual API service
      // return await recipeService.createRecipe(payload);

      // Using mock implementation for development
      console.log("Creating recipe with payload:", payload);

      // Simulate API call
      return new Promise((resolve) => {
        setTimeout(() => {
          // Create a proper recipe response based on the payload
          const mockResponse = {
            classFilter: payload.models.map(m => m.label),
            confidenceThreshold: payload.models[0]?.confidence || 0.7,
            createdAt: new Date().toISOString(),
            description: formValues.description || `Auto-generated ${payload.kind} recipe`,
            id: `recipe-${Date.now()}`,
            inferenceStep: 3,
            modelId: payload.model_id.toString(),
            name: formValues.name || `${payload.kind === "train" ? "Train Detection" : "Traffic Statistics"} Recipe`,
            regions: payload.kind === "intersection" 
              ? payload.polygons.map(p => ({
                  id: p.id,
                  name: `Region ${p.id}`,
                  points: p.points,
                  type: "areaOfInterest" as const
                }))
              : [],
            status: "active" as const,
            taskType: payload.kind === "train" ? "trainDetection" as const : "trafficStatistics" as const,
            videoId: formValues.videoId || "video-1",
          };
          resolve(mockResponse);
        }, 1000);
      });
    },
    onSuccess: (data: any) => {
      // Add the new recipe to the store
      if (data && data.id) {
        addRecipe(data);
      }
      
      queryClient.invalidateQueries({
        queryKey: recipeKeys.lists(),
      });
    },
  });
}

// Delete a recipe
export function useDeleteRecipe() {
  const queryClient = useQueryClient();
  const removeRecipe = useRecipeStore((state) => state.removeRecipe);

  return useMutation({
    mutationFn: async (id: string) => {
      // In production, replace with actual API call
      // await clients.v1.private.delete(`/recipes/${id}`);
      
      // Using mock implementation for development
      console.log("Deleting recipe:", id);
      
      // Simulate API call
      return new Promise<string>((resolve) => {
        setTimeout(() => {
          removeRecipe(id);
          resolve(id);
        }, 500);
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: recipeKeys.lists(),
      });
    },
  });
}

// Upload a video file
export function useUploadVideo() {
  return useMutation({
    mutationFn: async (file: File) => {
      // In production, replace with actual API call using FormData
      // const formData = new FormData();
      // formData.append('file', file);
      // const { data } = await clients.v1.private.post('/videos', formData);
      // return data.videoId;

      // Using mock implementation for development
      console.log("Uploading video:", file.name);

      // Simulate API call
      return new Promise<string>((resolve) => {
        setTimeout(() => {
          resolve(`video-${Date.now()}`);
        }, 1500);
      });
    },
  });
}

// Get recommended models for a specific task type
export function useRecommendedModels(taskType?: string) {
  return useQuery({
    enabled: !!taskType,
    queryFn: async () => {
      if (!taskType) return [];

      // In production, replace with actual API call
      // const { data } = await clients.v1.private.get(`/models/recommended?taskType=${taskType}`);
      // return data.models;

      // Using mock data for development
      return [
        { id: "model-1", name: "YOLOv8", recommended: true, type: "detection" },
        { id: "model-2", name: "EfficientDet", type: "detection" },
        { id: "model-3", name: "Traffic Counter v2", recommended: true, type: "counting" },
        { id: "model-4", name: "PedestrianTrack", recommended: true, type: "detection" },
        { id: "model-5", name: "TrafficLight Classifier", recommended: true, type: "classification" },
        { id: "model-6", name: "BicycleDetector Pro", type: "counting" },
        { id: "model-7", name: "PeopleCounter v3", recommended: true, type: "counting" },
        { id: "model-8", name: "WorkZoneDetector", type: "detection" },
      ];
    },
    queryKey: ["recommendedModels", taskType],
  });
}

// Hook for updating a recipe
export function useUpdateRecipe() {
  const queryClient = useQueryClient();
  const updateRecipe = useRecipeStore((state) => state.updateRecipe);

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: RecipeFormValues }) => {
      // In production, use the actual API service
      // return await recipeService.updateRecipe(id, data);

      // Using mock implementation for development
      console.log("Updating recipe with id:", id, "data:", data);

      // Simulate API call
      return new Promise((resolve) => {
        setTimeout(() => {
          const mockResponse = {
            created_at: new Date().toISOString(),
            description: data.description,
            id,
            name: data.name,
            status: "active" as const,
            task_type: data.taskType,
          };
          resolve(mockResponse);
        }, 500);
      });
    },
    onSuccess: (data: any, variables) => {
      // Update the recipe in the store
      updateRecipe(variables.id, data);
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ["recipes"] });
      queryClient.invalidateQueries({ queryKey: ["recipe", variables.id] });
    },
  });
}