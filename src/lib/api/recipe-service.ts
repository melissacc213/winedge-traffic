import type { IntersectionTypePayload,RecipeFormValues, TrainTypePayload } from "../store/recipe-store";
import type { RecipeResponse } from "../validator/recipe";
import { api } from "./index";

export const recipeService = {
  
  
// Create recipe based on task type
async createRecipe(
    payload: TrainTypePayload | IntersectionTypePayload
  ): Promise<RecipeResponse> {
    const response = await api.post("/api/recipes", payload);
    return response.data;
  },

  
  


// Delete recipe
async deleteRecipe(id: string): Promise<void> {
    await api.delete(`/api/recipes/${id}`);
  },

  
  

// Get single recipe
async getRecipe(id: string): Promise<RecipeResponse> {
    const response = await api.get(`/api/recipes/${id}`);
    return response.data;
  },

  
  // Get all recipes
async getRecipes(): Promise<RecipeResponse[]> {
    const response = await api.get("/api/recipes");
    return response.data;
  },

  
  // Get recommended models for task type
async getRecommendedModels(
    taskType: string
  ): Promise<Array<{ id: string; name: string; description: string }>> {
    const response = await api.get(`/api/models/recommended`, {
      params: { taskType },
    });
    return response.data;
  },

  
  // Upload video
async uploadVideo(file: File): Promise<{ id: string; url: string }> {
    const formData = new FormData();
    formData.append("video", file);

    const response = await api.post("/api/videos/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  },
};