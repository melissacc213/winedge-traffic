import { api } from "./index";
import type { RecipeFormValues, TrainTypePayload, IntersectionTypePayload } from "../store/recipe-store";
import type { RecipeResponse } from "../validator/recipe";

export const recipeService = {
  // Get all recipes
  async getRecipes(): Promise<RecipeResponse[]> {
    const response = await api.get("/api/recipes");
    return response.data;
  },

  // Get single recipe
  async getRecipe(id: string): Promise<RecipeResponse> {
    const response = await api.get(`/api/recipes/${id}`);
    return response.data;
  },

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

  // Get recommended models for task type
  async getRecommendedModels(
    taskType: string
  ): Promise<Array<{ id: string; name: string; description: string }>> {
    const response = await api.get(`/api/models/recommended`, {
      params: { taskType },
    });
    return response.data;
  },
};