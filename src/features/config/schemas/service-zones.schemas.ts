// Service Zones Schemas with Zod
import { z } from 'zod';
import { ZoneType } from '@/interfaces/GeographyInterfaces';

// ========== BASE ENTITY SCHEMAS ==========

// Zone Type schema
export const zoneTypeSchema = z.nativeEnum(ZoneType);

// GeoJSON Polygon schema
export const geoJSONPolygonSchema = z.object({
  type: z.literal('Polygon'),
  coordinates: z.array(z.array(z.array(z.number()))),
});

// Peak hours schema
export const peakHoursSchema = z.object({
  weekdays: z.array(z.string()),
  weekends: z.array(z.string()),
});

// Service Zone schema
export const serviceZoneSchema = z.object({
  id: z.number(),
  name: z.string(),
  cityId: z.number(),
  zoneType: zoneTypeSchema,
  boundaries: geoJSONPolygonSchema,
  centerLat: z.number(),
  centerLng: z.number(),
  isActive: z.boolean(),
  pricingMultiplier: z.number(),
  demandMultiplier: z.number(),
  maxDrivers: z.number().optional(),
  minDrivers: z.number().optional(),
  peakHours: peakHoursSchema.optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  city: z.object({
    id: z.number(),
    name: z.string(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    state: z.object({
      id: z.number(),
      name: z.string(),
      country: z.object({
        id: z.number(),
        name: z.string(),
      }),
    }),
  }).optional(),
});

// Service Zone List Item schema (optimized for lists)
export const serviceZoneListItemSchema = z.object({
  id: z.number(),
  name: z.string(),
  cityName: z.string(),
  stateName: z.string(),
  zoneType: zoneTypeSchema,
  isActive: z.boolean(),
  pricingMultiplier: z.number(),
  demandMultiplier: z.number(),
});

// ========== LIST RESPONSE SCHEMAS ==========

// Service Zones list response schema
export const serviceZonesListResponseSchema = z.object({
  zones: z.array(serviceZoneListItemSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});

// ========== VALIDATION SCHEMAS ==========

// Create service zone schema
export const createServiceZoneSchema = z.object({
  name: z.string().min(2, 'Nombre debe tener al menos 2 caracteres').max(100),
  cityId: z.number().int().positive('Ciudad es requerida'),
  zoneType: z.enum(['regular', 'premium', 'restricted'], {
    errorMap: () => ({ message: 'Tipo de zona debe ser regular, premium o restricted' })
  }),
  boundaries: geoJSONPolygonSchema,
  centerLat: z.number().min(-90, 'Latitud debe estar entre -90 y 90').max(90),
  centerLng: z.number().min(-180, 'Longitud debe estar entre -180 y 180').max(180),
  pricingMultiplier: z.number().min(0.5, 'Multiplicador de pricing debe ser al menos 0.5').max(10, 'Multiplicador de pricing debe ser máximo 10').default(1.0),
  demandMultiplier: z.number().min(0.5, 'Multiplicador de demanda debe ser al menos 0.5').max(10, 'Multiplicador de demanda debe ser máximo 10').default(1.0),
  maxDrivers: z.number().int().positive('Máximo conductores debe ser un número positivo').optional(),
  minDrivers: z.number().int().min(0, 'Mínimo conductores debe ser 0 o mayor').optional(),
  isActive: z.boolean().default(true),
  peakHours: peakHoursSchema.nullable().optional(),
});

// Update schema - some fields remain required for updates
export const updateServiceZoneSchema = createServiceZoneSchema.omit({
  boundaries: true,
  centerLat: true,
  centerLng: true
}).partial().extend({
  // Boundaries are optional in updates but if provided must be valid
  boundaries: geoJSONPolygonSchema.optional(),
  centerLat: z.number().min(-90, 'Latitud debe estar entre -90 y 90').max(90).optional(),
  centerLng: z.number().min(-180, 'Longitud debe estar entre -180 y 180').max(180).optional(),
});

// ========== SEARCH/FILTER SCHEMAS ==========

// Search service zones schema
export const searchServiceZonesSchema = z.object({
  page: z.number().min(1).default(1).optional(),
  limit: z.number().min(1).max(100).default(20).optional(),
  cityId: z.number().positive().optional(),
  stateId: z.number().positive().optional(),
  countryId: z.number().positive().optional(),
  zoneType: z.enum(['regular', 'premium', 'restricted']).optional(),
  isActive: z.boolean().optional(),
  search: z.string().max(100).optional().or(z.literal('')),
  sortBy: z.enum(['id', 'zoneType', 'pricingMultiplier', 'demandMultiplier']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

// ========== VALIDATION SCHEMAS ==========

// Geometry validation request schema
export const geometryValidationRequestSchema = z.object({
  zoneData: z.object({
    name: z.string(),
    cityId: z.number(),
    zoneType: zoneTypeSchema,
    boundaries: geoJSONPolygonSchema,
    centerLat: z.number(),
    centerLng: z.number(),
  }),
  cityId: z.number(),
  excludeZoneId: z.number().optional(),
});

// Geometry validation response schema
export const geometryValidationResponseSchema = z.object({
  isValid: z.boolean(),
  errors: z.array(z.string()),
  warnings: z.array(z.string()),
  analysis: z.object({
    areaKm2: z.number(),
    overlapPercentage: z.number(),
    gapPercentage: z.number(),
  }),
});

// ========== PRICING SCHEMAS ==========

// Bulk pricing update schema
export const bulkPricingUpdateSchema = z.object({
  zoneIds: z.array(z.number()).optional(),
  cityId: z.number().optional(),
  zoneType: z.enum(['regular', 'premium', 'restricted']).optional(),
  adjustmentType: z.enum(['percentage', 'fixed']),
  adjustmentValue: z.number(),
  field: z.enum(['pricingMultiplier', 'demandMultiplier']),
});

// Pricing validation request schema
export const pricingValidationRequestSchema = z.object({
  pricingMultiplier: z.number().min(0.5).max(10),
  demandMultiplier: z.number().min(0.5).max(10),
  compareWithZoneId: z.number().optional(),
});

// Pricing validation response schema
export const pricingValidationResponseSchema = z.object({
  isValid: z.boolean(),
  errors: z.array(z.string()),
  warnings: z.array(z.string()),
  comparison: z.object({
    existingZone: z.object({
      id: z.number(),
      name: z.string(),
      pricingMultiplier: z.number(),
      demandMultiplier: z.number(),
    }),
    differences: z.object({
      pricingMultiplier: z.number(),
      demandMultiplier: z.number(),
    }),
    competitiveness: z.string(),
  }).optional(),
});

// Pricing stats response schema
export const pricingStatsResponseSchema = z.object({
  totalZones: z.number(),
  activeZones: z.number(),
  averagePricingMultiplier: z.number(),
  averageDemandMultiplier: z.number(),
  highestPricingMultiplier: z.number(),
  lowestPricingMultiplier: z.number(),
  zonesByType: z.object({
    regular: z.number(),
    premium: z.number(),
    restricted: z.number(),
  }),
  zonesByCity: z.array(z.object({
    cityId: z.number(),
    cityName: z.string(),
    totalZones: z.number(),
    avgPricingMultiplier: z.number(),
  })),
});

// ========== COVERAGE ANALYSIS SCHEMAS ==========

// Coverage analysis response schema
export const coverageAnalysisResponseSchema = z.object({
  cityId: z.number(),
  cityName: z.string(),
  totalCoverage: z.number(),
  overlappingArea: z.number(),
  uncoveredArea: z.number(),
  coverageByType: z.object({
    regular: z.number(),
    premium: z.number(),
    restricted: z.number(),
  }),
  issues: z.array(z.string()),
  recommendations: z.array(z.string()),
});

// ========== BULK OPERATIONS SCHEMAS ==========

// Bulk status update schema
export const bulkStatusUpdateSchema = z.object({
  zoneIds: z.array(z.number()),
  isActive: z.boolean(),
});

// Bulk status update response schema
export const bulkStatusUpdateResponseSchema = z.object({
  message: z.string(),
  results: z.array(z.object({
    zoneId: z.number(),
    success: z.boolean(),
    data: serviceZoneSchema.optional(),
    error: z.string().optional(),
  })),
  successful: z.number(),
  failed: z.number(),
});

// ========== TYPE EXPORTS ==========

// Entity types
export type ServiceZone = z.infer<typeof serviceZoneSchema>;
export type ServiceZoneListItem = z.infer<typeof serviceZoneListItemSchema>;

// Response types
export type ServiceZonesListResponse = z.infer<typeof serviceZonesListResponseSchema>;

// Input types for mutations
export type CreateServiceZoneInput = z.infer<typeof createServiceZoneSchema>;
export type UpdateServiceZoneInput = z.infer<typeof updateServiceZoneSchema>;

// Search/Filter input types
export type SearchServiceZonesInput = z.infer<typeof searchServiceZonesSchema>;

// Validation types
export type GeometryValidationRequest = z.infer<typeof geometryValidationRequestSchema>;
export type GeometryValidationResponse = z.infer<typeof geometryValidationResponseSchema>;

// Pricing types
export type BulkPricingUpdateInput = z.infer<typeof bulkPricingUpdateSchema>;
export type PricingValidationRequest = z.infer<typeof pricingValidationRequestSchema>;
export type PricingValidationResponse = z.infer<typeof pricingValidationResponseSchema>;
export type PricingStatsResponse = z.infer<typeof pricingStatsResponseSchema>;

// Coverage analysis types
export type CoverageAnalysisResponse = z.infer<typeof coverageAnalysisResponseSchema>;

// Bulk operations types
export type BulkStatusUpdateInput = z.infer<typeof bulkStatusUpdateSchema>;
export type BulkStatusUpdateResponse = z.infer<typeof bulkStatusUpdateResponseSchema>;
