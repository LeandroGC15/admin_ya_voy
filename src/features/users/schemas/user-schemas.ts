import { z } from 'zod';

// Base user schema
export const userSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'El nombre es requerido'),
  email: z.string().email('Email inválido'),
  phone: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  isActive: z.boolean().optional(),
  userType: z.enum(['passenger', 'driver']).optional(),
  adminRole: z.string().optional(),
  createdAt: z.string().optional(),
  clerkId: z.string().optional(),
  wallet: z.object({
    balance: z.number(),
  }).optional(),
  _count: z.object({
    rides: z.number().optional(),
    deliveryOrders: z.number().optional(),
    ratings: z.number().optional(),
  }).optional(),
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

// User list response schema
export const userListResponseSchema = z.object({
  data: z.array(userSchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
    hasNext: z.boolean(),
    hasPrev: z.boolean(),
  }),
  filters: z.object({
    applied: z.array(z.string()),
    searchTerm: z.string(),
  }),
});

// Types inferred from schemas
export type User = z.infer<typeof userSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type SearchUsersInput = z.infer<typeof searchUsersSchema>;
export type UserListResponse = z.infer<typeof userListResponseSchema>;
