import { z } from 'zod';

// Maximum file size (500MB)
const MAX_FILE_SIZE = 500 * 1024 * 1024;

// Allowed file types
const ACCEPTED_FILE_TYPES = [
  'application/zip',
  'application/x-zip-compressed',
  'application/octet-stream',
];

// Allowed file extensions
const ACCEPTED_FILE_EXTENSIONS = [
  '.zip',
  '.onnx',
  '.pt',
  '.pth',
  '.bin',
  '.tflite',
];

// Model file validation schema
export const modelFileSchema = z.object({
  name: z.string().min(1, 'File name is required'),
  size: z.number().max(MAX_FILE_SIZE, `File size must be less than ${MAX_FILE_SIZE / (1024 * 1024)}MB`),
  type: z.string().refine(
    (type) => ACCEPTED_FILE_TYPES.includes(type) || ACCEPTED_FILE_TYPES.some(t => type.startsWith(t)),
    {
      message: `File type must be one of: ${ACCEPTED_FILE_TYPES.join(', ')}`,
    }
  ),
});

// Validate file extension
export function validateFileExtension(fileName: string): boolean {
  const extension = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();
  return ACCEPTED_FILE_EXTENSIONS.includes(extension);
}

// Validate model file
export function validateModelFile(file: File): void {
  try {
    // Validate file properties
    modelFileSchema.parse(file);
    
    // Check file extension
    if (!validateFileExtension(file.name)) {
      throw new Error(`File extension must be one of: ${ACCEPTED_FILE_EXTENSIONS.join(', ')}`);
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(error.errors[0].message);
    }
    throw error;
  }
}

// Model schema
export const modelSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Model name is required'),
  type: z.string(),
  size: z.number().positive('Size must be positive'),
  status: z.enum(['active', 'pending', 'failed']),
  createdAt: z.string().datetime(),
  description: z.string().optional(),
  parameters: z.record(z.string()).optional(),
});

export type ModelValidationSchema = z.infer<typeof modelSchema>;
export type Model = ModelValidationSchema;

// Models list schema
export const modelsListSchema = z.array(modelSchema);
export type ModelsListSchema = z.infer<typeof modelsListSchema>;