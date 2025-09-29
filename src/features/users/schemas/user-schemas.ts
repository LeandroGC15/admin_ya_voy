import { z } from 'zod';

// Base user schema (según documentación de API)
export const userSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
  phone: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  userType: z.enum(['passenger', 'driver']).optional(),
  isActive: z.boolean(),
  emailVerified: z.boolean(),
  phoneVerified: z.boolean(),
  identityVerified: z.boolean(),
  createdAt: z.string(),
  wallet: z.object({
    balance: z.number(),
    totalTransactions: z.number(),
  }).optional(),
  totalRides: z.number(),
  completedRides: z.number(),
  cancelledRides: z.number(),
  averageRating: z.number(),
});

// Create user schema
export const createUserSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  email: z.string().email('Email inválido'),
  phone: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  userType: z.enum(['passenger', 'driver']).default('passenger'),
});

// Update user schema
export const updateUserSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').optional(),
  email: z.string().email('Email inválido').optional(),
  phone: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  isActive: z.boolean().optional(),
  userType: z.enum(['passenger', 'driver']).optional(),
});

// Search users schema
export const searchUsersSchema = z.object({
  search: z.string().optional(),
  isActive: z.boolean().optional(),
  userType: z.enum(['passenger', 'driver']).optional(),
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
});

// User list response schema (según documentación de API)
export const userListResponseSchema = z.object({
  users: z.array(userSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});

// Types inferred from schemas
export type User = z.infer<typeof userSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type SearchUsersInput = z.infer<typeof searchUsersSchema>;
export type UserListResponse = z.infer<typeof userListResponseSchema>;
