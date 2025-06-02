import { z } from 'zod';

export const selfSchema = z.object({
  date_joined: z.string().nullish(),
  email: z.string(),
  expiry_time: z.string().nullish(),
  first_name: z.string().nullish(),
  id: z.string(),
  is_active: z.boolean().nullish(),
  is_superuser: z.boolean().nullish(),
  last_name: z.string().nullish(),
  role: z.string().optional(),
  username: z.string(),
});
export type Self = z.infer<typeof selfSchema>;

// User role enum - matching API exactly
export const userRoleSchema = z.enum(['admin', 'Operator']);
export type UserRole = z.infer<typeof userRoleSchema>;

// Create user schema
export const createUserSchema = z.object({
  email: z.string()
    .email('Invalid email address')
    .max(100, 'Email must be less than 100 characters'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
      'Password must contain uppercase, lowercase, number and special character'),
  password2: z.string(),
  role: userRoleSchema,
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must be less than 50 characters')
    .regex(/^[a-zA-Z0-9_.-]+$/, 'Username can only contain letters, numbers, dots, underscores, and hyphens'),
}).refine((data) => data.password === data.password2, {
  message: "Passwords don't match",
  path: ["password2"],
});

export type CreateUserRequest = z.infer<typeof createUserSchema>;

// Update user schema
export const updateUserSchema = z.object({
  active: z.boolean().optional(),
  role: userRoleSchema.optional(),
});

export type UpdateUserRequest = z.infer<typeof updateUserSchema>;

// User response schema - matching API structure
export const userSchema = z.object({
  // For backwards compatibility with mock data
active: z.boolean().optional(),
  
created_at: z.string().optional(),
  
date_joined: z.string().optional(),
  
email: z.string(),
  
expiry_time: z.string().nullable().optional(),
  
first_name: z.string().optional(),
  
id: z.string(),
  
is_active: z.boolean().optional(),
  
is_superuser: z.boolean().optional(),
  
last_login: z.string().nullable().optional(),
  
  last_name: z.string().optional(),
  role: userRoleSchema,
  updated_at: z.string().optional(),
  username: z.string(),
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