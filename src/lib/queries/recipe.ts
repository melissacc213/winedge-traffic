import { clients } from "../api";
import { recipeSchema, recipesListSchema } from "../validator/recipe";
import type { RecipeFormValues } from "../validator/recipe";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRecipeStore } from "../store/recipe-store";
import { recipeService } from "../api/recipe-service";

// Mock data for development
const MOCK_RECIPES = [
  {
    id: "recipe-1",
    name: "Urban Traffic Flow Analysis",
    description: "Track and analyze traffic patterns at the main city intersection",
    taskType: "trafficStatistics",
    videoId: "video-1",
    regions: [
      {
        id: "region-1",
        name: "North-South Line",
        type: "countLine",
        points: [
          { x: 100, y: 200 },
          { x: 300, y: 200 },
          { x: 300, y: 220 },
          { x: 100, y: 220 },
        ],
      },
      {
        id: "region-1b",
        name: "East-West Line",
        type: "countLine",
        points: [
          { x: 150, y: 150 },
          { x: 150, y: 300 },
          { x: 170, y: 300 },
          { x: 170, y: 150 },
        ],
      },
    ],
    modelId: "model-1",
    confidenceThreshold: 0.6,
    classFilter: ["car", "truck", "bus"],
    createdAt: "2023-04-01T12:00:00Z",
    status: "active",
  },
  {
    id: "recipe-2",
    name: "Downtown Traffic Monitoring",
    description: "Monitor traffic flow and congestion in downtown area",
    taskType: "trafficStatistics",
    videoId: "video-2",
    regions: [
      {
        id: "region-2",
        name: "Main Avenue",
        type: "areaOfInterest",
        points: [
          { x: 50, y: 50 },
          { x: 450, y: 50 },
          { x: 450, y: 350 },
          { x: 50, y: 350 },
        ],
      },
    ],
    modelId: "model-2",
    confidenceThreshold: 0.5,
    classFilter: ["car", "truck", "bus", "motorcycle"],
    createdAt: "2023-04-05T14:30:00Z",
    status: "active",
  },
  {
    id: "recipe-3",
    name: "High-Speed Rail Monitoring",
    description: "Track and monitor high-speed trains on dedicated railway",
    taskType: "trainDetection",
    videoId: "video-3",
    regions: [
      {
        id: "region-3a",
        name: "Track Segment 1",
        type: "areaOfInterest",
        points: [
          { x: 100, y: 100 },
          { x: 500, y: 100 },
          { x: 500, y: 300 },
          { x: 100, y: 300 },
        ],
      },
      {
        id: "region-3b",
        name: "Speed Measurement Line",
        type: "countLine",
        points: [
          { x: 200, y: 200 },
          { x: 400, y: 200 },
          { x: 400, y: 210 },
          { x: 200, y: 210 },
        ],
      },
    ],
    modelId: "model-3",
    confidenceThreshold: 0.7,
    classFilter: ["train", "locomotive", "cargo"],
    createdAt: "2023-05-10T09:15:00Z",
    status: "active",
  },
  {
    id: "recipe-4",
    name: "Subway Station Monitoring",
    description: "Track train arrivals and departures at subway platform",
    taskType: "trainDetection",
    videoId: "video-4",
    regions: [
      {
        id: "region-4",
        name: "Platform Area",
        type: "areaOfInterest",
        points: [
          { x: 150, y: 150 },
          { x: 350, y: 150 },
          { x: 350, y: 250 },
          { x: 150, y: 250 },
        ],
      },
    ],
    modelId: "model-4",
    confidenceThreshold: 0.65,
    classFilter: ["subway", "passenger"],
    createdAt: "2023-05-20T16:45:00Z",
    status: "inactive",
  },
  {
    id: "recipe-5",
    name: "Traffic Congestion Analysis",
    description: "Monitor and predict traffic congestion in high-traffic areas",
    taskType: "trafficStatistics",
    videoId: "video-5",
    regions: [
      {
        id: "region-5",
        name: "Highway Junction",
        type: "areaOfInterest",
        points: [
          { x: 200, y: 100 },
          { x: 300, y: 100 },
          { x: 300, y: 200 },
          { x: 200, y: 200 },
        ],
      },
    ],
    modelId: "model-5",
    confidenceThreshold: 0.8,
    classFilter: ["car", "truck", "bus", "motorcycle"],
    createdAt: "2023-06-05T10:20:00Z",
    status: "error",
  },
  {
    id: "recipe-6",
    name: "Railway Crossing Monitoring",
    description: "Track train movements at railway crossing for safety",
    taskType: "trainDetection",
    videoId: "video-6",
    regions: [
      {
        id: "region-6a",
        name: "Track Zone",
        type: "areaOfInterest",
        points: [
          { x: 100, y: 300 },
          { x: 500, y: 300 },
          { x: 500, y: 350 },
          { x: 100, y: 350 },
        ],
      },
      {
        id: "region-6b",
        name: "Crossing Line",
        type: "countLine",
        points: [
          { x: 250, y: 300 },
          { x: 250, y: 350 },
          { x: 260, y: 350 },
          { x: 260, y: 300 },
        ],
      },
    ],
    modelId: "model-6",
    confidenceThreshold: 0.6,
    classFilter: ["train", "barrier"],
    createdAt: "2023-06-15T14:00:00Z",
    status: "active",
  },
  {
    id: "recipe-7",
    name: "Rush Hour Traffic Analysis",
    description: "Monitor and analyze traffic patterns during peak hours",
    taskType: "trafficStatistics",
    videoId: "video-7",
    regions: [
      {
        id: "region-7",
        name: "Main Intersection",
        type: "areaOfInterest",
        points: [
          { x: 150, y: 250 },
          { x: 350, y: 250 },
          { x: 350, y: 400 },
          { x: 150, y: 400 },
        ],
      },
    ],
    modelId: "model-7",
    confidenceThreshold: 0.7,
    classFilter: ["car", "truck", "bus", "motorcycle"],
    createdAt: "2023-07-02T08:30:00Z",
    status: "inactive",
  },
  {
    id: "recipe-8",
    name: "Freight Train Tracking",
    description: "Track and monitor freight trains across rail network",
    taskType: "trainDetection",
    videoId: "video-8",
    regions: [
      {
        id: "region-8a",
        name: "Main Track",
        type: "areaOfInterest",
        points: [
          { x: 100, y: 100 },
          { x: 400, y: 100 },
          { x: 400, y: 400 },
          { x: 100, y: 400 },
        ],
      },
      {
        id: "region-8b",
        name: "Restricted Zone",
        type: "exclusionZone",
        points: [
          { x: 200, y: 200 },
          { x: 300, y: 200 },
          { x: 300, y: 300 },
          { x: 200, y: 300 },
        ],
      },
    ],
    modelId: "model-8",
    confidenceThreshold: 0.75,
    classFilter: ["freight", "cargo", "locomotive"],
    createdAt: "2023-07-15T11:45:00Z",
    status: "active",
  },
  {
    id: "recipe-9",
    name: "Urban Traffic Density Analysis",
    description: "Monitor and analyze traffic density in urban zones",
    taskType: "trafficStatistics",
    videoId: "video-9",
    regions: [
      {
        id: "region-9",
        name: "Urban Zone",
        type: "areaOfInterest",
        points: [
          { x: 120, y: 120 },
          { x: 380, y: 120 },
          { x: 380, y: 280 },
          { x: 120, y: 280 },
        ],
      },
    ],
    modelId: "model-9",
    confidenceThreshold: 0.65,
    classFilter: ["car", "bus", "truck", "motorcycle", "bicycle"],
    createdAt: "2023-08-05T09:30:00Z",
    status: "active",
  },
  {
    id: "recipe-10",
    name: "Commuter Train Schedule Verification",
    description: "Verify commuter train schedules against actual arrivals",
    taskType: "trainDetection",
    videoId: "video-10",
    regions: [
      {
        id: "region-10",
        name: "Station Platform",
        type: "areaOfInterest",
        points: [
          { x: 180, y: 180 },
          { x: 380, y: 180 },
          { x: 380, y: 280 },
          { x: 180, y: 280 },
        ],
      },
    ],
    modelId: "model-10",
    confidenceThreshold: 0.75,
    classFilter: ["commuter_train", "passenger"],
    createdAt: "2023-08-12T14:45:00Z",
    status: "active",
  },
  {
    id: "recipe-11",
    name: "Highway Traffic Flow Analysis",
    description: "Analyze traffic flow patterns on major highway",
    taskType: "trafficStatistics",
    videoId: "video-11",
    regions: [
      {
        id: "region-11a",
        name: "Northbound Lane",
        type: "areaOfInterest",
        points: [
          { x: 100, y: 150 },
          { x: 150, y: 150 },
          { x: 150, y: 350 },
          { x: 100, y: 350 },
        ],
      },
      {
        id: "region-11b",
        name: "Southbound Lane",
        type: "areaOfInterest",
        points: [
          { x: 200, y: 150 },
          { x: 250, y: 150 },
          { x: 250, y: 350 },
          { x: 200, y: 350 },
        ],
      },
    ],
    modelId: "model-11",
    confidenceThreshold: 0.6,
    classFilter: ["car", "truck", "bus", "motorcycle"],
    createdAt: "2023-08-20T10:15:00Z",
    status: "active",
  },
  {
    id: "recipe-12",
    name: "Railway Maintenance Inspection",
    description: "Track maintenance trains and equipment on railway",
    taskType: "trainDetection",
    videoId: "video-12",
    regions: [
      {
        id: "region-12",
        name: "Maintenance Section",
        type: "areaOfInterest",
        points: [
          { x: 120, y: 200 },
          { x: 420, y: 200 },
          { x: 420, y: 250 },
          { x: 120, y: 250 },
        ],
      },
    ],
    modelId: "model-12",
    confidenceThreshold: 0.7,
    classFilter: ["maintenance_train", "equipment"],
    createdAt: "2023-09-01T08:30:00Z",
    status: "active",
  },
  {
    id: "recipe-13",
    name: "School Zone Traffic Monitoring",
    description: "Monitor traffic patterns and speed in school zones",
    taskType: "trafficStatistics",
    videoId: "video-13",
    regions: [
      {
        id: "region-13",
        name: "School Zone",
        type: "areaOfInterest",
        points: [
          { x: 150, y: 150 },
          { x: 350, y: 150 },
          { x: 350, y: 300 },
          { x: 150, y: 300 },
        ],
      },
    ],
    modelId: "model-13",
    confidenceThreshold: 0.75,
    classFilter: ["car", "bus", "bicycle", "pedestrian"],
    createdAt: "2023-09-10T09:00:00Z",
    status: "active",
  },
  {
    id: "recipe-14",
    name: "Bullet Train Velocity Analysis",
    description: "Analyze high-speed bullet train velocity",
    taskType: "trainDetection",
    videoId: "video-14",
    regions: [
      {
        id: "region-14a",
        name: "Entry Point",
        type: "countLine",
        points: [
          { x: 100, y: 200 },
          { x: 100, y: 250 },
        ],
      },
      {
        id: "region-14b",
        name: "Exit Point",
        type: "countLine",
        points: [
          { x: 400, y: 200 },
          { x: 400, y: 250 },
        ],
      },
    ],
    modelId: "model-14",
    confidenceThreshold: 0.8,
    classFilter: ["bullet_train"],
    createdAt: "2023-09-18T13:45:00Z",
    status: "active",
  },
  {
    id: "recipe-15",
    name: "City Center Traffic Management",
    description: "Monitor and manage traffic in city center area",
    taskType: "trafficStatistics",
    videoId: "video-15",
    regions: [
      {
        id: "region-15",
        name: "City Center Grid",
        type: "areaOfInterest",
        points: [
          { x: 100, y: 100 },
          { x: 400, y: 100 },
          { x: 400, y: 400 },
          { x: 100, y: 400 },
        ],
      },
    ],
    modelId: "model-15",
    confidenceThreshold: 0.65,
    classFilter: ["car", "bus", "truck", "motorcycle", "bicycle", "pedestrian"],
    createdAt: "2023-10-05T10:30:00Z",
    status: "active",
  },
  {
    id: "recipe-16",
    name: "Railway Junction Analysis",
    description: "Monitor train movements at critical railway junction",
    taskType: "trainDetection",
    videoId: "video-16",
    regions: [
      {
        id: "region-16",
        name: "Junction Zone",
        type: "areaOfInterest",
        points: [
          { x: 150, y: 150 },
          { x: 350, y: 150 },
          { x: 350, y: 300 },
          { x: 150, y: 300 },
        ],
      },
    ],
    modelId: "model-16",
    confidenceThreshold: 0.7,
    classFilter: ["passenger_train", "freight_train"],
    createdAt: "2023-10-15T14:20:00Z",
    status: "active",
  },
  {
    id: "recipe-17",
    name: "Peak Hour Congestion Analysis",
    description: "Analyze traffic congestion during peak hours",
    taskType: "trafficStatistics",
    videoId: "video-17",
    regions: [
      {
        id: "region-17",
        name: "Congestion Zone",
        type: "areaOfInterest",
        points: [
          { x: 120, y: 180 },
          { x: 380, y: 180 },
          { x: 380, y: 320 },
          { x: 120, y: 320 },
        ],
      },
    ],
    modelId: "model-17",
    confidenceThreshold: 0.65,
    classFilter: ["car", "bus", "truck"],
    createdAt: "2023-11-01T08:45:00Z",
    status: "active",
  },
  {
    id: "recipe-18",
    name: "Railway Crossing Safety Analysis",
    description: "Monitor safety at railway crossings",
    taskType: "trainDetection",
    videoId: "video-18",
    regions: [
      {
        id: "region-18",
        name: "Crossing Area",
        type: "areaOfInterest",
        points: [
          { x: 150, y: 150 },
          { x: 350, y: 150 },
          { x: 350, y: 250 },
          { x: 150, y: 250 },
        ],
      },
    ],
    modelId: "model-18",
    confidenceThreshold: 0.8,
    classFilter: ["train", "car", "truck", "pedestrian"],
    createdAt: "2023-11-10T13:30:00Z",
    status: "active",
  },
  {
    id: "recipe-19",
    name: "Highway Traffic Speed Analysis",
    description: "Monitor vehicle speeds on highway segments",
    taskType: "trafficStatistics",
    videoId: "video-19",
    regions: [
      {
        id: "region-19a",
        name: "Speed Zone Start",
        type: "countLine",
        points: [
          { x: 100, y: 200 },
          { x: 150, y: 200 },
        ],
      },
      {
        id: "region-19b",
        name: "Speed Zone End",
        type: "countLine",
        points: [
          { x: 350, y: 200 },
          { x: 400, y: 200 },
        ],
      },
    ],
    modelId: "model-19",
    confidenceThreshold: 0.7,
    classFilter: ["car", "truck", "motorcycle"],
    createdAt: "2023-11-20T09:15:00Z",
    status: "active",
  },
  {
    id: "recipe-20",
    name: "Cargo Train Monitoring",
    description: "Track and analyze cargo train movements",
    taskType: "trainDetection",
    videoId: "video-20",
    regions: [
      {
        id: "region-20",
        name: "Cargo Loading Zone",
        type: "areaOfInterest",
        points: [
          { x: 100, y: 150 },
          { x: 400, y: 150 },
          { x: 400, y: 250 },
          { x: 100, y: 250 },
        ],
      },
    ],
    modelId: "model-20",
    confidenceThreshold: 0.75,
    classFilter: ["cargo_train", "freight_car"],
    createdAt: "2023-12-01T10:00:00Z",
    status: "active",
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
  lists: () => [...recipeKeys.all, 'list'] as const,
  list: (filters: string) => [...recipeKeys.lists(), { filters }] as const,
  details: () => [...recipeKeys.all, 'detail'] as const,
  detail: (id: string) => [...recipeKeys.details(), id] as const,
};

// Get all recipes
export function useRecipes() {
  const setRecipes = useRecipeStore((state) => state.setRecipes);
  const setLoading = useRecipeStore((state) => state.setLoading);
  const setError = useRecipeStore((state) => state.setError);

  return useQuery({
    queryKey: recipeKeys.lists(),
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
  });
}

// Get a single recipe by ID
export function useRecipe(id: string) {
  const updateRecipe = useRecipeStore((state) => state.updateRecipe);

  return useQuery({
    queryKey: recipeKeys.detail(id),
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
    enabled: !!id,
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
            id: `recipe-${Date.now()}`,
            name: formValues.name || `${payload.kind === "train" ? "Train Detection" : "Traffic Statistics"} Recipe`,
            description: formValues.description || `Auto-generated ${payload.kind} recipe`,
            taskType: payload.kind === "train" ? "trainDetection" as const : "trafficStatistics" as const,
            videoId: formValues.videoId || "video-1",
            regions: payload.kind === "intersection" 
              ? payload.polygons.map(p => ({
                  id: p.id,
                  name: `Region ${p.id}`,
                  type: "areaOfInterest" as const,
                  points: p.points
                }))
              : [],
            modelId: payload.model_id.toString(),
            confidenceThreshold: payload.models[0]?.confidence || 0.7,
            classFilter: payload.models.map(m => m.label),
            createdAt: new Date().toISOString(),
            status: "active" as const,
            inferenceStep: 3,
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
    queryKey: ["recommendedModels", taskType],
    queryFn: async () => {
      if (!taskType) return [];

      // In production, replace with actual API call
      // const { data } = await clients.v1.private.get(`/models/recommended?taskType=${taskType}`);
      // return data.models;

      // Using mock data for development
      return [
        { id: "model-1", name: "YOLOv8", type: "detection", recommended: true },
        { id: "model-2", name: "EfficientDet", type: "detection" },
        { id: "model-3", name: "Traffic Counter v2", type: "counting", recommended: true },
        { id: "model-4", name: "PedestrianTrack", type: "detection", recommended: true },
        { id: "model-5", name: "TrafficLight Classifier", type: "classification", recommended: true },
        { id: "model-6", name: "BicycleDetector Pro", type: "counting" },
        { id: "model-7", name: "PeopleCounter v3", type: "counting", recommended: true },
        { id: "model-8", name: "WorkZoneDetector", type: "detection" },
      ];
    },
    enabled: !!taskType,
  });
}