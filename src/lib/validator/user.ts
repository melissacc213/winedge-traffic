import { z } from 'zod';

export const selfSchema = z.object({
  id: z.string(),
  username: z.string(),
  email: z.string(),
  role: z.string().optional(),
  date_joined: z.string().nullish(),
  is_superuser: z.boolean().nullish(),
  is_active: z.boolean().nullish(),
  first_name: z.string().nullish(),
  last_name: z.string().nullish(),
  expiry_time: z.string().nullish(),
});
export type Self = z.infer<typeof selfSchema>;

// User role enum - matching API exactly
export const userRoleSchema = z.enum(['admin', 'Operator']);
export type UserRole = z.infer<typeof userRoleSchema>;

// Create user schema
export const createUserSchema = z.object({
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must be less than 50 characters')
    .regex(/^[a-zA-Z0-9_.-]+$/, 'Username can only contain letters, numbers, dots, underscores, and hyphens'),
  email: z.string()
    .email('Invalid email address')
    .max(100, 'Email must be less than 100 characters'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
      'Password must contain uppercase, lowercase, number and special character'),
  password2: z.string(),
  role: userRoleSchema,
}).refine((data) => data.password === data.password2, {
  message: "Passwords don't match",
  path: ["password2"],
});

export type CreateUserRequest = z.infer<typeof createUserSchema>;

// Update user schema
export const updateUserSchema = z.object({
  role: userRoleSchema.optional(),
  active: z.boolean().optional(),
});

export type UpdateUserRequest = z.infer<typeof updateUserSchema>;

// User response schema - matching API structure
export const userSchema = z.object({
  id: z.string(),
  username: z.string(),
  email: z.string(),
  role: userRoleSchema,
  is_superuser: z.boolean().optional(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  is_active: z.boolean().optional(),
  date_joined: z.string().optional(),
  expiry_time: z.string().nullable().optional(),
  // For backwards compatibility with mock data
  active: z.boolean().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  last_login: z.string().nullable().optional(),
});

export type User = z.infer<typeof userSchema>;

// Users list response
export const usersListSchema = z.object({
  count: z.number(),
  next: z.string().nullable(),
  previous: z.string().nullable(),
  results: z.array(userSchema),
});

export type UsersList = z.infer<typeof usersListSchema>;