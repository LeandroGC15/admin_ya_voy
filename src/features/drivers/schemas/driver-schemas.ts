import { z } from 'zod';

// Vehicle type schema
export const vehicleTypeSchema = z.object({
  id: z.number(),
  name: z.string(),
  displayName: z.string(),
});

// Document schema
export const documentSchema = z.object({
  id: z.number(),
  documentType: z.string(),
  verificationStatus: z.string(),
  uploadedAt: z.string(),
});

// Driver count schema
export const driverCountSchema = z.object({
  rides: z.number(),
  deliveryOrders: z.number(),
  documents: z.number(),
});

// Base driver schema
export const driverSchema = z.object({
  id: z.number(),
  firstName: z.string(),
  lastName: z.string(),
  profileImageUrl: z.string().nullable().optional(),
  carModel: z.string(),
  licensePlate: z.string(),
  carSeats: z.number(),
  status: z.enum(['online', 'offline', 'busy', 'unavailable']).optional(),
  verificationStatus: z.enum(['pending', 'approved', 'rejected', 'under_review']).optional(),
  canDoDeliveries: z.boolean().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  vehicleType: vehicleTypeSchema.optional(),
  documents: z.array(documentSchema).optional(),
  _count: driverCountSchema.optional(),
});

// Create driver schema
export const createDriverSchema = z.object({
  firstName: z.string().min(1, 'El nombre es requerido'),
  lastName: z.string().min(1, 'El apellido es requerido'),
  email: z.string().email('Email inválido'),
  phoneNumber: z.string().min(1, 'El teléfono es requerido'),
  carModel: z.string().min(1, 'El modelo del vehículo es requerido'),
  licensePlate: z.string().min(1, 'La placa es requerida'),
  carSeats: z.number().min(1).max(8),
  clerkId: z.string().min(1, 'El ID de Clerk es requerido'),
});

// Search drivers schema
export const searchDriversSchema = z.object({
  search: z.string().optional(),
  status: z.enum(['online', 'offline', 'busy', 'unavailable']).optional(),
  verificationStatus: z.enum(['pending', 'approved', 'rejected', 'under_review']).optional(),
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
});

// Driver list response schema
export const driverListResponseSchema = z.object({
  data: z.array(driverSchema),
  total: z.number(),
  page: z.number(),
  totalPages: z.number(),
});

// Legacy response schema (for backward compatibility)
export const driversDataSchema = z.object({
  success: z.boolean(),
  data: z.array(driverSchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    pages: z.number(),
  }),
});

// Types inferred from schemas
export type Driver = z.infer<typeof driverSchema>;
export type CreateDriverInput = z.infer<typeof createDriverSchema>;
export type SearchDriversInput = z.infer<typeof searchDriversSchema>;
export type DriverListResponse = z.infer<typeof driverListResponseSchema>;
export type DriversData = z.infer<typeof driversDataSchema>;
export type VehicleType = z.infer<typeof vehicleTypeSchema>;
export type Document = z.infer<typeof documentSchema>;
export type DriverCount = z.infer<typeof driverCountSchema>;
