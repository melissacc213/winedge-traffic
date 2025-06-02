import type { TFunction } from "i18next";
import z from "zod";

// Maximum video file size: 500MB
const MAX_VIDEO_FILE_SIZE = 500 * 1024 * 1024;
const ACCEPTED_VIDEO_TYPES = [
  "video/mp4",
  "video/webm",
  "video/ogg",
  "video/quicktime",
];

export const taskTypeSchema = z.enum([
  "trafficStatistics",
  "trainDetection",
]);

export const regionTypeSchema = z.enum([
  "countLine",
  "areaOfInterest",
  "exclusionZone",
]);

export const roadTypeSchema = z.enum([
  "straight",
  "tJunction",
  "crossroads",
]);

export const directionSchema = z.enum([
  "northToSouth", 
  "southToNorth",
  "eastToWest",
  "westToEast",
  "northEastToSouthWest",
  "southWestToNorthEast",
  "northWestToSouthEast",
  "southEastToNorthWest",
]);

export function createVideoValidationSchema(t: TFunction) {
  return z.object({
    file: z
      .instanceof(File)
      .refine((file) => file.size <= MAX_VIDEO_FILE_SIZE, {
        message: t("recipes:validation.fileSize", {
          max: "500MB",
        }),
      })
      .refine((file) => ACCEPTED_VIDEO_TYPES.includes(file.type), {
        message: t("recipes:validation.fileType"),
      }),
  });
}

export type VideoValidation = z.infer<
  ReturnType<typeof createVideoValidationSchema>
>;

export function createRecipeValidationSchema(t: TFunction) {
  return z.object({
    
    
classFilter: z.array(z.string()).optional(),

    
    


confidenceThreshold: z
      .number()
      .min(0.1, { message: t("recipes:validation.confidenceRange") })
      .max(1.0, { message: t("recipes:validation.confidenceRange") }),
    



description: z.string().optional(),
    



// Model Configuration
modelId: z.string({
      required_error: t("recipes:validation.modelRequired"),
    }),

    
    



// Recipe Information
name: z.string(),

    
    



// Regions must have at least one region
regions: z
      .array(
        z.object({
          id: z.string(),
          name: z
            .string()
            .min(1, { message: t("recipes:validation.required") }),
          points: z
            .array(z.object({ x: z.number(), y: z.number() }))
            .min(3, { message: t("recipes:validation.invalidRegion") }),
          type: regionTypeSchema,
        })
      )
      .min(1, { message: t("recipes:validation.regionRequired") }),
    



// Task Type
taskType: taskTypeSchema,
    



useSampleVideo: z.boolean().optional(),

    
    


videoFile: z
      .instanceof(File)
      .optional()
      .refine((file) => !file || file.size <= MAX_VIDEO_FILE_SIZE, {
        message: t("recipes:validation.fileSize", { max: "500MB" }),
      })
      .refine((file) => !file || ACCEPTED_VIDEO_TYPES.includes(file.type), {
        message: t("recipes:validation.fileType"),
      }),
    
// Video
videoId: z.string().optional(),
  });
}

// Using type from types file instead of inferring
export type RecipeFormValues = z.infer<
  ReturnType<typeof createRecipeValidationSchema>
>;

// Recipe Response Type
export const recipeSchema = z.object({
  classFilter: z.array(z.string()).optional(),
  confidenceThreshold: z.number(),
  createdAt: z.string(),
  description: z.string().optional(),
  id: z.string(),
  modelId: z.string(),
  name: z.string(),
  regions: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      points: z.array(z.object({ x: z.number(), y: z.number() })),
      type: regionTypeSchema,
    })
  ),
  status: z.enum(["active", "inactive", "error"]),
  taskType: taskTypeSchema,
  videoId: z.string().optional(),
});

export type RecipeResponse = z.infer<typeof recipeSchema>;

export const recipesListSchema = z.array(recipeSchema);
export type RecipesListResponse = z.infer<typeof recipesListSchema>;
