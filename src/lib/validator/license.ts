import { z } from 'zod';

// Create license schema (for form validation, not including file)
export const createLicenseSchema = z.object({
  is_default: z.boolean().default(false),
  name: z.string()
    .min(1, 'License name is required')
    .max(100, 'License name must be less than 100 characters'),
});

export type CreateLicenseRequest = z.infer<typeof createLicenseSchema>;

// Update license schema
export const updateLicenseSchema = z.object({
  is_default: z.boolean().optional(),
  name: z.string()
    .min(1, 'License name is required')
    .max(100, 'License name must be less than 100 characters')
    .optional(),
});

export type UpdateLicenseRequest = z.infer<typeof updateLicenseSchema>;

// License response schema
export const licenseSchema = z.object({
  expires_at: z.string().nullable().optional(),
  file_name: z.string(),
  file_size: z.number(),
  id: z.number(),
  is_default: z.boolean(),
  name: z.string(),
  status: z.enum(['active', 'expired', 'invalid']).default('active'),
  uploaded_at: z.string(),
  uploaded_by: z.string(),
});

export type License = z.infer<typeof licenseSchema>;

// License list response
export const licensesListSchema = z.object({
  count: z.number(),
  next: z.string().nullable(),
  previous: z.string().nullable(),
  results: z.array(licenseSchema),
});

export type LicensesList = z.infer<typeof licensesListSchema>;