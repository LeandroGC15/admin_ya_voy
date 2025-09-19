import { z } from 'zod';

export const driverSearchSchema = z.object({
  // Search fields
  firstName: z.string().max(100, 'El nombre es demasiado largo').optional().or(z.literal('')),
  lastName: z.string().max(100, 'El apellido es demasiado largo').optional().or(z.literal('')),
  carModel: z.string().max(100, 'El modelo del vehículo es demasiado largo').optional().or(z.literal('')),
  licensePlate: z.string().max(20, 'La placa es demasiado larga').optional().or(z.literal('')),
  
  // Status filters
  status: z.enum(['online', 'offline', 'busy', 'unavailable']).optional(),
  verificationStatus: z.enum(['pending', 'approved', 'rejected', 'under_review']).optional(),
  
  // Boolean filters
  canDoDeliveries: z.boolean().optional(),
  
  // Numeric filters
  carSeats: z.coerce.number().int().min(0).optional(),
  vehicleTypeId: z.coerce.number().int().positive().optional(),
  
  // Pagination with defaults
  page: z.coerce.number().int().positive().default(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(10).optional(),
  
  // Sorting with defaults
  sortBy: z.enum([
    'id', 'firstName', 'lastName', 'status', 'verificationStatus', 'createdAt', 'updatedAt'
  ]).optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc').optional(),
  
  // Date filters
  createdFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (YYYY-MM-DD)').optional().or(z.literal('')),
  createdTo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (YYYY-MM-DD)').optional().or(z.literal('')),
  updatedFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (YYYY-MM-DD)').optional().or(z.literal('')),
  updatedTo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (YYYY-MM-DD)').optional().or(z.literal('')),
  
  // Search field (backward compatibility)
  search: z.string().max(100, 'La búsqueda es demasiado larga').optional().or(z.literal(''))
}).partial(); // Make all fields optional

export type DriverSearchValues = z.infer<typeof driverSearchSchema>;
