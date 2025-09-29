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

// Create user schema with enhanced validation
export const createUserSchema = z.object({
  name: z.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede tener más de 100 caracteres')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El nombre solo puede contener letras y espacios'),
  email: z.string()
    .email('El email debe tener un formato válido')
    .max(255, 'El email no puede tener más de 255 caracteres'),
  phone: z.string()
    .regex(/^[\+]?[0-9\s\-\(\)]+$/, 'El teléfono solo puede contener números, espacios, guiones y paréntesis')
    .min(7, 'El teléfono debe tener al menos 7 caracteres')
    .max(20, 'El teléfono no puede tener más de 20 caracteres')
    .optional()
    .or(z.literal('')),
  city: z.string()
    .min(2, 'La ciudad debe tener al menos 2 caracteres')
    .max(100, 'La ciudad no puede tener más de 100 caracteres')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'La ciudad solo puede contener letras y espacios')
    .optional()
    .or(z.literal('')),
  state: z.string()
    .min(2, 'El estado debe tener al menos 2 caracteres')
    .max(100, 'El estado no puede tener más de 100 caracteres')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El estado solo puede contener letras y espacios')
    .optional()
    .or(z.literal('')),
  country: z.string()
    .min(2, 'El país debe tener al menos 2 caracteres')
    .max(100, 'El país no puede tener más de 100 caracteres')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El país solo puede contener letras y espacios')
    .optional()
    .or(z.literal('')),
  userType: z.enum(['passenger', 'driver'], {
    errorMap: () => ({ message: 'El tipo de usuario debe ser Pasajero o Conductor' })
  }).default('passenger'),
});

// Update user schema with enhanced validation
export const updateUserSchema = z.object({
  name: z.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede tener más de 100 caracteres')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El nombre solo puede contener letras y espacios')
    .optional(),
  email: z.string()
    .email('El email debe tener un formato válido')
    .max(255, 'El email no puede tener más de 255 caracteres')
    .optional(),
  phone: z.string()
    .regex(/^[\+]?[0-9\s\-\(\)]+$/, 'El teléfono solo puede contener números, espacios, guiones y paréntesis')
    .min(7, 'El teléfono debe tener al menos 7 caracteres')
    .max(20, 'El teléfono no puede tener más de 20 caracteres')
    .optional()
    .or(z.literal('')),
  city: z.string()
    .min(2, 'La ciudad debe tener al menos 2 caracteres')
    .max(100, 'La ciudad no puede tener más de 100 caracteres')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'La ciudad solo puede contener letras y espacios')
    .optional()
    .or(z.literal('')),
  state: z.string()
    .min(2, 'El estado debe tener al menos 2 caracteres')
    .max(100, 'El estado no puede tener más de 100 caracteres')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El estado solo puede contener letras y espacios')
    .optional()
    .or(z.literal('')),
  country: z.string()
    .min(2, 'El país debe tener al menos 2 caracteres')
    .max(100, 'El país no puede tener más de 100 caracteres')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El país solo puede contener letras y espacios')
    .optional()
    .or(z.literal('')),
  isActive: z.boolean().optional(),
  userType: z.enum(['passenger', 'driver'], {
    errorMap: () => ({ message: 'El tipo de usuario debe ser Pasajero o Conductor' })
  }).optional(),
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
