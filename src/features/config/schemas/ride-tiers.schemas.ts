import { z } from 'zod';

// ========== RIDE TIERS SCHEMAS ==========

// Base ride tier schema (full data for individual endpoints)
export const rideTierSchema = z.object({
  id: z.number(),
  name: z.string(),
  baseFare: z.number(),           // Base fare in cents
  minimumFare: z.number(),        // Minimum fare in cents
  perMinuteRate: z.number(),      // Rate per minute in cents
  perKmRate: z.number(),          // Rate per kilometer in cents
  imageUrl: z.string().optional(), // Image URL for the tier
  tierMultiplier: z.number(),     // Base multiplier (default: 1.0)
  surgeMultiplier: z.number(),    // Surge pricing multiplier
  demandMultiplier: z.number(),   // Demand-based multiplier
  luxuryMultiplier: z.number().optional(),  // Luxury service multiplier
  comfortMultiplier: z.number().optional(), // Comfort features multiplier
  minPassengers: z.number(),      // Minimum passengers
  maxPassengers: z.number(),      // Maximum passengers
  isActive: z.boolean(),
  priority: z.number(),
  ridesCount: z.number().optional(), // Number of rides using this tier
  vehicleTypes: z.array(z.object({
    id: z.number(),
    name: z.string(),
    displayName: z.string()
  })).optional(), // Vehicle types associated with this tier
  createdAt: z.string(),          // ISO date string
  updatedAt: z.string(),          // ISO date string
});

// Reduced ride tier schema for list endpoints (performance optimization)
export const rideTierListItemSchema = z.object({
  id: z.number(),
  name: z.string(),
  baseFare: z.number(),           // Base fare in cents
  minimumFare: z.number(),        // Minimum fare in cents
  perMinuteRate: z.number(),      // Rate per minute in cents
  // perKmRate is not included in reduced list format
  minPassengers: z.number(),      // Minimum passengers
  maxPassengers: z.number(),      // Maximum passengers
  priority: z.number(),
  isActive: z.boolean(),
  // Other fields are not included in reduced list format
});

// Ride tiers list response schema (uses reduced schema for performance)
export const rideTiersListResponseSchema = z.object({
  tiers: z.array(rideTierListItemSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});

// ========== CREATE/UPDATE DTO SCHEMAS ==========

// Create ride tier schema with validation (strictly following the endpoint guide)
export const createRideTierSchema = z.object({
  name: z.string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(50, 'El nombre no puede tener más de 50 caracteres'),
  description: z.string()
    .max(500, 'La descripción no puede tener más de 500 caracteres')
    .optional(),
  baseFare: z.number()
  
    .min(0, 'La tarifa base no puede ser negativa')
    .max(10000, 'La tarifa base no puede ser mayor a 10000 centavos'),
  minimunFare: z.number()
    .min(0, 'La tarifa mínima no puede ser negativa')
    .max(10000, 'La tarifa mínima no puede ser mayor a 10000 centavos'),
  perMinuteRate: z.number()
    .min(0, 'La tarifa por minuto no puede ser negativa')
    .max(200, 'La tarifa por minuto no puede ser mayor a 200 centavos'),
  perKmRate: z.number()
    .min(20, 'La tarifa por kilómetro debe ser al menos 20 centavos')
    .max(500, 'La tarifa por kilómetro no puede ser mayor a 500 centavos'),
  imageUrl: z.string()
    .optional()
    .refine((val) => !val || val === '' || z.string().url().safeParse(val).success, {
      message: 'La URL de imagen debe ser válida o estar vacía',
    }),
  tierMultiplier: z.number()
    .min(0.1, 'El multiplicador debe ser al menos 0.1')
    .max(10.0, 'El multiplicador no puede ser mayor a 10.0')
    .default(1.0),
  surgeMultiplier: z.number()
    .min(0.1, 'El multiplicador de surge debe ser al menos 0.1')
    .max(10.0, 'El multiplicador de surge no puede ser mayor a 10.0')
    .default(1.0),
  demandMultiplier: z.number()
    .min(0.1, 'El multiplicador de demanda debe ser al menos 0.1')
    .max(10.0, 'El multiplicador de demanda no puede ser mayor a 10.0')
    .default(1.0),
  luxuryMultiplier: z.number()
    .min(0.1, 'El multiplicador de lujo debe ser al menos 0.1')
    .max(5.0, 'El multiplicador de lujo no puede ser mayor a 5.0')
    .default(1.0),
  comfortMultiplier: z.number()
    .min(0.1, 'El multiplicador de confort debe ser al menos 0.1')
    .max(5.0, 'El multiplicador de confort no puede ser mayor a 5.0')
    .default(1.0),
  minPassengers: z.number()
    .min(1, 'Debe haber al menos 1 pasajero mínimo')
    .max(8, 'No puede haber más de 8 pasajeros mínimos')
    .default(1),
  maxPassengers: z.number()
    .min(1, 'Debe haber al menos 1 pasajero máximo')
    .max(8, 'No puede haber más de 8 pasajeros máximos')
    .default(4),
  isActive: z.boolean().default(true),
  priority: z.number()
    .min(1, 'La prioridad debe ser al menos 1')
    .max(100, 'La prioridad no puede ser mayor a 100')
    .default(5),
  vehicleTypeIds: z.array(z.number().positive())
    .optional(),
}).refine((data) => {
  // Si baseFare es 0, permitir cualquier minimunFare >= 0
  if (data.baseFare === 0) {
    return data.minimunFare >= 0;
  }
  // Si baseFare > 0, minimunFare debe ser <= baseFare
  return data.minimunFare <= data.baseFare;
}, {
  message: "La tarifa mínima no puede ser mayor que la tarifa base (cuando la tarifa base es mayor a 0)",
  path: ["minimunFare"]
}).refine((data) => {
  // Al menos uno de los componentes de precio debe ser mayor a 0
  return data.baseFare > 0 || data.perMinuteRate > 0 || data.perKmRate > 0;
}, {
  message: "Al menos uno de los componentes de precio (tarifa base, por minuto o por kilómetro) debe ser mayor a 0",
  path: ["baseFare"]
});

// Update ride tier schema (all fields optional except the refine validation)
export const updateRideTierSchema = z.object({
  name: z.string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(50, 'El nombre no puede tener más de 50 caracteres')
    .optional(),
  description: z.string()
    .max(500, 'La descripción no puede tener más de 500 caracteres')
    .optional(),
  baseFare: z.number()
    .min(0, 'La tarifa base no puede ser negativa')
    .max(10000, 'La tarifa base no puede ser mayor a 10000 centavos')
    .optional(),
  minimunFare: z.number()
    .min(0, 'La tarifa mínima no puede ser negativa')
    .max(10000, 'La tarifa mínima no puede ser mayor a 10000 centavos')
    .optional(),
  perMinuteRate: z.number()
    .min(0, 'La tarifa por minuto no puede ser negativa')
    .max(200, 'La tarifa por minuto no puede ser mayor a 200 centavos')
    .optional(),
  perKmRate: z.number()
    .min(20, 'La tarifa por kilómetro debe ser al menos 20 centavos')
    .max(500, 'La tarifa por kilómetro no puede ser mayor a 500 centavos')
    .optional(),
  imageUrl: z.string()
    .optional()
    .refine((val) => !val || val === '' || z.string().url().safeParse(val).success, {
      message: 'La URL de imagen debe ser válida o estar vacía',
    }),
  tierMultiplier: z.number()
    .min(0.1, 'El multiplicador debe ser al menos 0.1')
    .max(10.0, 'El multiplicador no puede ser mayor a 10.0')
    .optional(),
  surgeMultiplier: z.number()
    .min(0.1, 'El multiplicador de surge debe ser al menos 0.1')
    .max(10.0, 'El multiplicador de surge no puede ser mayor a 10.0')
    .optional(),
  demandMultiplier: z.number()
    .min(0.1, 'El multiplicador de demanda debe ser al menos 0.1')
    .max(10.0, 'El multiplicador de demanda no puede ser mayor a 10.0')
    .optional(),
  luxuryMultiplier: z.number()
    .min(0.1, 'El multiplicador de lujo debe ser al menos 0.1')
    .max(5.0, 'El multiplicador de lujo no puede ser mayor a 5.0')
    .optional(),
  comfortMultiplier: z.number()
    .min(0.1, 'El multiplicador de confort debe ser al menos 0.1')
    .max(5.0, 'El multiplicador de confort no puede ser mayor a 5.0')
    .optional(),
  minPassengers: z.number()
    .min(1, 'Debe haber al menos 1 pasajero mínimo')
    .max(8, 'No puede haber más de 8 pasajeros mínimos')
    .optional(),
  maxPassengers: z.number()
    .min(1, 'Debe haber al menos 1 pasajero máximo')
    .max(8, 'No puede haber más de 8 pasajeros máximos')
    .optional(),
  isActive: z.boolean().optional(),
  priority: z.number()
    .min(1, 'La prioridad debe ser al menos 1')
    .max(100, 'La prioridad no puede ser mayor a 100')
    .optional(),
  vehicleTypeIds: z.array(z.number().positive())
    .optional(),
}).refine((data) => {
  // Skip validation if fields are not provided (partial update)
  if (data.baseFare === undefined || data.minimunFare === undefined) {
    return true;
  }
  // Si baseFare es 0, permitir cualquier minimunFare >= 0
  if (data.baseFare === 0) {
    return data.minimunFare >= 0;
  }
  // Si baseFare > 0, minimunFare debe ser <= baseFare
  return data.minimunFare <= data.baseFare;
}, {
  message: "La tarifa mínima no puede ser mayor que la tarifa base (cuando la tarifa base es mayor a 0)",
  path: ["minimunFare"]
}).refine((data) => {
  // Skip validation if updating other fields without pricing fields
  const hasBaseFare = data.baseFare !== undefined;
  const hasPerMinuteRate = data.perMinuteRate !== undefined;
  const hasPerKmRate = data.perKmRate !== undefined;
  
  // If no pricing fields are being updated, skip this validation
  if (!hasBaseFare && !hasPerMinuteRate && !hasPerKmRate) {
    return true;
  }
  
  // Get current values or use 0 as default for validation
  const baseFare = data.baseFare ?? 0;
  const perMinuteRate = data.perMinuteRate ?? 0;
  const perKmRate = data.perKmRate ?? 0;
  
  // Al menos uno de los componentes de precio debe ser mayor a 0
  return baseFare > 0 || perMinuteRate > 0 || perKmRate > 0;
}, {
  message: "Al menos uno de los componentes de precio (tarifa base, por minuto o por kilómetro) debe ser mayor a 0",
  path: ["baseFare"]
});

// ========== QUERY SCHEMAS ==========

// Ride tiers query params schema
export const rideTiersQueryParamsSchema = z.object({
  page: z.number().min(1).default(1).optional(),
  limit: z.number().min(1).max(100).default(20).optional(),
  search: z.string().max(100).optional().or(z.literal('')),
  isActive: z.boolean().optional(),
  sortBy: z.enum(['name', 'baseFare', 'priority', 'createdAt']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  countryId: z.number().positive().optional(),
  stateId: z.number().positive().optional(),
  cityId: z.number().positive().optional(),
  serviceZoneId: z.number().positive().optional(),
});

// ========== CALCULATION SCHEMAS ==========

// Pricing calculation input schema (following endpoint guide)
export const pricingCalculationSchema = z.object({
  tierId: z.number().positive(),
  distance: z.number().min(0.1), // Distance in kilometers
  duration: z.number().min(1),   // Duration in minutes
  countryId: z.number().positive().optional(),
  stateId: z.number().positive().optional(),
  cityId: z.number().positive().optional(),
  zoneId: z.number().positive().optional(),
  surgeMultiplier: z.number().min(0.5).max(10).optional().default(1.0),
});

// Pricing calculation result schema - Updated to match backend DTO
export const pricingCalculationResultSchema = z.object({
  tier: z.object({
    id: z.number(),
    name: z.string(),
    baseFare: z.number(),
    minimumFare: z.number(),
    perMinuteRate: z.number(),
    perKmRate: z.number(),
    tierMultiplier: z.number(),
    surgeMultiplier: z.number(),
    demandMultiplier: z.number(),
    luxuryMultiplier: z.number().optional(),
    comfortMultiplier: z.number().optional(),
  }),
  basePricing: z.object({
    baseFare: z.number(),
    distanceCost: z.number(),
    timeCost: z.number(),
    subtotal: z.number(),
    tierAdjustedTotal: z.number(),
  }),
  regionalMultipliers: z.object({
    countryMultiplier: z.number(),
    stateMultiplier: z.number(),
    cityMultiplier: z.number(),
    zoneMultiplier: z.number(),
    totalMultiplier: z.number(),
  }),
  dynamicPricing: z.object({
    surgeMultiplier: z.number(),
    demandMultiplier: z.number(),
    totalDynamicMultiplier: z.number(),
  }),
  finalPricing: z.object({
    baseAmount: z.number(),
    regionalAdjustments: z.number(),
    dynamicAdjustments: z.number(),
    serviceFees: z.number(),
    taxes: z.number(),
    totalAmount: z.number(),
  }),
  metadata: z.object({
    currency: z.string(),
    distanceUnit: z.string(),
    calculationTimestamp: z.date(),
    appliedRules: z.array(z.string()),
  }),
});

// ========== VALIDATION SCHEMAS ==========

// Pricing validation input schema
export const pricingValidationSchema = z.object({
  tier: z.object({
    name: z.string().optional(),
    baseFare: z.number().optional(),
    perMinuteRate: z.number().optional(),
    perKmRate: z.number().optional(),
    minimumFare: z.number().optional(),
  }),
  compareWithTierId: z.number().positive().optional(),
});

// Pricing validation result schema
export const pricingValidationResultSchema = z.object({
  isValid: z.boolean(),
  errors: z.array(z.object({
    field: z.string(),
    message: z.string(),
    severity: z.enum(['error', 'warning', 'info']),
  })),
  warnings: z.array(z.object({
    field: z.string(),
    message: z.string(),
    suggestion: z.string().optional(),
  })),
  suggestions: z.array(z.object({
    type: z.string(),
    message: z.string(),
    action: z.string().optional(),
  })),
  comparison: z.object({
    existingTier: z.object({
      id: z.number(),
      name: z.string(),
      baseFare: z.number(),
      perMinuteRate: z.number(),
      perKmRate: z.number(),
    }),
    differences: z.array(z.object({
      field: z.string(),
      newValue: z.any(),
      existingValue: z.any(),
      percentageChange: z.number().optional(),
    })),
    recommendations: z.array(z.string()),
  }).optional(),
});

// ========== STANDARD TIERS SCHEMA ==========

// Standard tiers response schema
export const standardTiersResponseSchema = z.object({
  created: z.number(),
  tiers: z.array(rideTierSchema),
  skipped: z.array(z.object({
    name: z.string(),
    reason: z.string(),
  })),
});

// ========== BULK OPERATIONS SCHEMAS ==========

// Bulk ride tier update schema
export const bulkRideTierUpdateSchema = z.object({
  tierIds: z.array(z.number().positive()),
  adjustmentType: z.enum(['percentage', 'absolute']),
  adjustmentValue: z.number(),
  field: z.enum(['baseFare', 'perMinuteRate', 'perKmRate', 'tierMultiplier', 'surgeMultiplier', 'demandMultiplier']),
});

// Bulk tier update response schema
export const bulkTierUpdateResponseSchema = z.object({
  updated: z.number(),
  failed: z.number(),
  totalAffected: z.number(),
  results: z.array(z.object({
    tierId: z.number(),
    tierName: z.string(),
    success: z.boolean(),
    oldValue: z.number().optional(),
    newValue: z.number().optional(),
    error: z.string().optional(),
  })),
});

// ========== SUMMARY/OVERVIEW SCHEMA ==========

// Pricing summary response schema
export const pricingSummaryResponseSchema = z.object({
  summary: z.object({
    totalTiers: z.number(),
    activeTiers: z.number(),
    totalRides: z.number(),
    averageBaseFare: z.number(),
    priceRanges: z.object({
      lowest: z.number(),
      highest: z.number(),
    }),
    tierDistribution: z.object({
      economy: z.number(),
      comfort: z.number(),
      premium: z.number(),
      luxury: z.number(),
    }),
    tiers: z.array(z.object({
      id: z.number(),
      name: z.string(),
      baseFare: z.number(),
      tierMultiplier: z.number(),
      ridesCount: z.number(),
      isActive: z.boolean(),
    })),
  }),
});

// ========== VEHICLE TYPES SCHEMA ==========

// Vehicle type schema
export const vehicleTypeSchema = z.object({
  id: z.number(),
  name: z.string(),          // e.g., "motorcycle", "car", "truck"
  displayName: z.string(),   // e.g., "Moto", "Carro", "Camión"
  icon: z.string(),          // e.g., "🏍️", "🚗", "🚚"
  isActive: z.boolean(),
});

// Vehicle types response schema
export const vehicleTypesResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(vehicleTypeSchema),
  count: z.number(),
  message: z.string(),
});

// ========== TYPES ==========

export type RideTier = z.infer<typeof rideTierSchema>;
export type RideTierListItem = z.infer<typeof rideTierListItemSchema>;
export type RideTiersListResponse = z.infer<typeof rideTiersListResponseSchema>;
export type CreateRideTierInput = z.infer<typeof createRideTierSchema>;
export type UpdateRideTierInput = z.infer<typeof updateRideTierSchema>;
export type RideTiersQueryParams = z.infer<typeof rideTiersQueryParamsSchema>;
export type PricingCalculationInput = z.infer<typeof pricingCalculationSchema>;
export type PricingCalculationResult = z.infer<typeof pricingCalculationResultSchema>;
export type PricingValidationInput = z.infer<typeof pricingValidationSchema>;
export type PricingValidationResult = z.infer<typeof pricingValidationResultSchema>;
export type StandardTiersResponse = z.infer<typeof standardTiersResponseSchema>;
export type BulkRideTierUpdateInput = z.infer<typeof bulkRideTierUpdateSchema>;
export type BulkTierUpdateResponse = z.infer<typeof bulkTierUpdateResponseSchema>;
export type PricingSummaryResponse = z.infer<typeof pricingSummaryResponseSchema>;
export type VehicleType = z.infer<typeof vehicleTypeSchema>;
export type VehicleTypesResponse = z.infer<typeof vehicleTypesResponseSchema>;
