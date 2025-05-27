import { z } from 'zod';

// Create license schema (for form validation, not including file)
export const createLicenseSchema = z.object({
  name: z.string()
    .min(1, 'License name is required')
    .max(100, 'License name must be less than 100 characters'),
  is_default: z.boolean().default(false),
});

export type CreateLicenseRequest = z.infer<typeof createLicenseSchema>;

// Update license schema
export const updateLicenseSchema = z.object({
  name: z.string()
    .min(1, 'License name is required')
    .max(100, 'License name must be less than 100 characters')
    .optional(),
  is_default: z.boolean().optional(),
});

export type UpdateLicenseRequest = z.infer<typeof updateLicenseSchema>;

// License response schema
export const licenseSchema = z.object({
  id: z.number(),
  name: z.string(),
  file_name: z.string(),
  file_size: z.number(),
  is_default: z.boolean(),
  uploaded_by: z.string(),
  uploaded_at: z.string(),
  expires_at: z.string().nullable().optional(),
  status: z.enum(['active', 'expired', 'invalid']).default('active'),
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