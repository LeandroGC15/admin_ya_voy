import { z } from 'zod';

// Vehicle type schema
export const vehicleTypeSchema = z.object({
  id: z.number(),
  name: z.string(),
  displayName: z.string(),
  icon: z.string().optional(),
  isActive: z.boolean().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

// Document schema
export const documentSchema = z.object({
  id: z.number(),
  documentType: z.string(),
  documentUrl: z.string().optional(),
  verificationStatus: z.string(),
  uploadedAt: z.string(),
  verifiedAt: z.string().optional(),
  rejectedReason: z.string().optional(),
});

// Driver count schema
export const driverCountSchema = z.object({
  rides: z.number(),
  deliveryOrders: z.number(),
  documents: z.number(),
});

// Work zone schema
export const workZoneSchema = z.object({
  id: z.number(),
  name: z.string(),
});

// Default vehicle schema (for list response)
export const defaultVehicleSchema = z.object({
  make: z.string(),
  model: z.string(),
  licensePlate: z.string(),
});

// Detailed vehicle schema (for individual driver response)
export const driverVehicleSchema = z.object({
  id: z.number(),
  make: z.string(),
  model: z.string(),
  year: z.number().optional(),
  color: z.string().optional(),
  licensePlate: z.string(),
  vin: z.string().optional(),
  seatingCapacity: z.number().optional(),
  fuelType: z.string().optional(),
  hasAC: z.boolean().optional(),
  hasGPS: z.boolean().optional(),
  status: z.string().optional(),
  verificationStatus: z.string().optional(),
  isDefault: z.boolean().optional(),
  vehicleType: vehicleTypeSchema.optional(),
  insuranceProvider: z.string().optional(),
  insurancePolicyNumber: z.string().optional(),
  insuranceExpiryDate: z.string().optional(),
  frontImageUrl: z.string().optional(),
  sideImageUrl: z.string().optional(),
  backImageUrl: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

// Driver address schema
export const driverAddressSchema = z.object({
  address: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  state: z.string().nullable().optional(),
  postalCode: z.string().nullable().optional(),
});

// Driver basic info schema
export const driverBasicSchema = z.object({
  id: z.number(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  phone: z.string(),
  dateOfBirth: z.string().nullable().optional(),
  gender: z.string().nullable().optional(),
  status: z.enum(['online', 'offline', 'busy', 'unavailable', 'suspended']),
  verificationStatus: z.enum(['pending', 'approved', 'rejected', 'under_review']),
  canDoDeliveries: z.boolean(),
  lastActive: z.string().nullable().optional(),
  createdAt: z.string(),
});

// Driver stats schema
export const driverStatsSchema = z.object({
  averageRating: z.number(),
  totalRides: z.number(),
  completedRides: z.number(),
  cancelledRides: z.number(),
  totalEarnings: z.number(),
  completionRate: z.number(),
});

// Driver detailed response schema (for GET /admin/drivers/:id)
export const driverDetailResponseSchema = z.object({
  data: z.object({
    basic: driverBasicSchema,
    stats: driverStatsSchema,
    address: driverAddressSchema,
    documents: z.array(documentSchema),
    vehicles: z.array(driverVehicleSchema),
    currentWorkZone: workZoneSchema.nullable().optional(),
    paymentMethods: z.array(z.object({
      id: z.number(),
      type: z.string(),
      isDefault: z.boolean().optional(),
    })).optional(),
    recentRides: z.array(z.object({
      id: z.number(),
      status: z.string(),
      createdAt: z.string(),
      farePrice: z.number(),
    })).optional(),
    performanceStats: z.object({
      todayRides: z.number().optional(),
      weekRides: z.number().optional(),
      monthRides: z.number().optional(),
      todayEarnings: z.number().optional(),
      weekEarnings: z.number().optional(),
      monthEarnings: z.number().optional(),
      averageResponseTime: z.number().optional(),
      customerSatisfaction: z.number().optional(),
    }).optional(),
  }),
});

// Base driver schema (según documentación de API)
export const driverSchema = z.object({
  id: z.number(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  profileImageUrl: z.string().nullable().optional(),
  carModel: z.string().optional(),
  licensePlate: z.string().optional(),
  carSeats: z.number().optional(),
  status: z.enum(['online', 'offline', 'busy', 'unavailable', 'suspended']).optional(),
  verificationStatus: z.enum(['pending', 'approved', 'rejected', 'under_review']).optional(),
  canDoDeliveries: z.boolean().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  averageRating: z.number().optional(),
  totalRides: z.number().optional(),
  completedRides: z.number().optional(),
  cancelledRides: z.number().optional(),
  totalEarnings: z.number().optional(),
  completionRate: z.number().optional(),
  currentWorkZone: workZoneSchema.optional(),
  defaultVehicle: defaultVehicleSchema.optional(),
  vehicleType: vehicleTypeSchema.optional(),
  documents: z.array(documentSchema).optional(),
  _count: driverCountSchema.optional(),
});

// Create driver schema with enhanced validation
export const createDriverSchema = z.object({
  firstName: z.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre no puede tener más de 50 caracteres')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El nombre solo puede contener letras y espacios'),
  lastName: z.string()
    .min(2, 'El apellido debe tener al menos 2 caracteres')
    .max(50, 'El apellido no puede tener más de 50 caracteres')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El apellido solo puede contener letras y espacios'),
  email: z.string()
    .email('El email debe tener un formato válido')
    .max(255, 'El email no puede tener más de 255 caracteres'),
  phoneNumber: z.string()
    .regex(/^[\+]?[0-9\s\-\(\)]+$/, 'El teléfono solo puede contener números, espacios, guiones y paréntesis')
    .min(7, 'El teléfono debe tener al menos 7 caracteres')
    .max(20, 'El teléfono no puede tener más de 20 caracteres'),
  carModel: z.string()
    .min(2, 'El modelo del vehículo debe tener al menos 2 caracteres')
    .max(100, 'El modelo del vehículo no puede tener más de 100 caracteres'),
  licensePlate: z.string()
    .min(3, 'La placa debe tener al menos 3 caracteres')
    .max(20, 'La placa no puede tener más de 20 caracteres')
    .regex(/^[A-Z0-9\-]+$/, 'La placa solo puede contener letras mayúsculas, números y guiones'),
  carSeats: z.number()
    .min(1, 'El vehículo debe tener al menos 1 asiento')
    .max(8, 'El vehículo no puede tener más de 8 asientos'),
  clerkId: z.string()
    .min(1, 'El ID de Clerk es requerido')
    .max(255, 'El ID de Clerk no puede tener más de 255 caracteres'),
});

// Update driver schema with enhanced validation
export const updateDriverSchema = z.object({
  firstName: z.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre no puede tener más de 50 caracteres')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El nombre solo puede contener letras y espacios')
    .optional(),
  lastName: z.string()
    .min(2, 'El apellido debe tener al menos 2 caracteres')
    .max(50, 'El apellido no puede tener más de 50 caracteres')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El apellido solo puede contener letras y espacios')
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
  carModel: z.string()
    .min(2, 'El modelo del vehículo debe tener al menos 2 caracteres')
    .max(100, 'El modelo del vehículo no puede tener más de 100 caracteres')
    .optional()
    .or(z.literal('')),
  licensePlate: z.string()
    .min(3, 'La placa debe tener al menos 3 caracteres')
    .max(20, 'La placa no puede tener más de 20 caracteres')
    .regex(/^[A-Z0-9\-]+$/, 'La placa solo puede contener letras mayúsculas, números y guiones')
    .optional()
    .or(z.literal('')),
  carSeats: z.number()
    .min(1, 'El vehículo debe tener al menos 1 asiento')
    .max(8, 'El vehículo no puede tener más de 8 asientos')
    .optional(),
  status: z.enum(['online', 'offline', 'busy', 'unavailable', 'suspended'], {
    errorMap: () => ({ message: 'Estado inválido' })
  }).optional(),
  verificationStatus: z.enum(['pending', 'approved', 'rejected', 'under_review'], {
    errorMap: () => ({ message: 'Estado de verificación inválido' })
  }).optional(),
  canDoDeliveries: z.boolean().optional(),
});

// Search drivers schema
export const searchDriversSchema = z.object({
  search: z.string().optional(),
  status: z.enum(['online', 'offline', 'busy', 'unavailable', 'suspended']).optional(),
  verificationStatus: z.enum(['pending', 'approved', 'rejected', 'under_review']).optional(),
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
});

// Driver list response schema (según documentación de API)
export const driverListResponseSchema = z.object({
  drivers: z.array(driverSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
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
export type UpdateDriverInput = z.infer<typeof updateDriverSchema>;
export type SearchDriversInput = z.infer<typeof searchDriversSchema>;
export type DriverListResponse = z.infer<typeof driverListResponseSchema>;
export type DriverDetailResponse = z.infer<typeof driverDetailResponseSchema>;
export type DriversData = z.infer<typeof driversDataSchema>;
export type VehicleType = z.infer<typeof vehicleTypeSchema>;
export type Document = z.infer<typeof documentSchema>;
export type DriverCount = z.infer<typeof driverCountSchema>;
export type WorkZone = z.infer<typeof workZoneSchema>;
export type DefaultVehicle = z.infer<typeof defaultVehicleSchema>;
export type DriverVehicle = z.infer<typeof driverVehicleSchema>;
export type DriverAddress = z.infer<typeof driverAddressSchema>;
export type DriverBasic = z.infer<typeof driverBasicSchema>;
export type DriverStats = z.infer<typeof driverStatsSchema>;
