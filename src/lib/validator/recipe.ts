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
    // Task Type
    taskType: taskTypeSchema,

    // Video
    videoId: z.string().optional(),
    videoFile: z
      .instanceof(File)
      .optional()
      .refine((file) => !file || file.size <= MAX_VIDEO_FILE_SIZE, {
        message: t("recipes:validation.fileSize", { max: "500MB" }),
      })
      .refine((file) => !file || ACCEPTED_VIDEO_TYPES.includes(file.type), {
        message: t("recipes:validation.fileType"),
      }),
    useSampleVideo: z.boolean().optional(),

    // Regions must have at least one region
    regions: z
      .array(
        z.object({
          id: z.string(),
          name: z
            .string()
            .min(1, { message: t("recipes:validation.required") }),
          type: regionTypeSchema,
          points: z
            .array(z.object({ x: z.number(), y: z.number() }))
            .min(3, { message: t("recipes:validation.invalidRegion") }),
        })
      )
      .min(1, { message: t("recipes:validation.regionRequired") }),

    // Model Configuration
    modelId: z.string({
      required_error: t("recipes:validation.modelRequired"),
    }),
    confidenceThreshold: z
      .number()
      .min(0.1, { message: t("recipes:validation.confidenceRange") })
      .max(1.0, { message: t("recipes:validation.confidenceRange") }),
    classFilter: z.array(z.string()).optional(),

    // Recipe Information
    name: z.string(),
    description: z.string().optional(),
  });
}

// Using type from types file instead of inferring
export type RecipeFormValues = z.infer<
  ReturnType<typeof createRecipeValidationSchema>
>;

// Recipe Response Type
export const recipeSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  taskType: taskTypeSchema,
  videoId: z.string().optional(),
  regions: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      type: regionTypeSchema,
      points: z.array(z.object({ x: z.number(), y: z.number() })),
    })
  ),
  modelId: z.string(),
  confidenceThreshold: z.number(),
  classFilter: z.array(z.string()).optional(),
  createdAt: z.string(),
  status: z.enum(["active", "inactive", "error"]),
});

export type RecipeResponse = z.infer<typeof recipeSchema>;

export const recipesListSchema = z.array(recipeSchema);
export type RecipesListResponse = z.infer<typeof recipesListSchema>;
