import { z } from 'zod';

// ========== TEMPORAL PRICING RULES SCHEMAS ==========

// Base temporal pricing rule schema
export const temporalPricingRuleSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable().optional(),
  ruleType: z.enum(['time_range', 'day_of_week', 'date_specific', 'seasonal']),
  multiplier: z.number(),           // Pricing multiplier (1.0-10.0)
  startTime: z.string().nullable().optional(),           // HH:MM format (for time_range)
  endTime: z.string().nullable().optional(),             // HH:MM format (for time_range)
  daysOfWeek: z.array(z.number().min(0).max(6)).nullable().optional(), // 0-6 (Sunday-Saturday)
  specificDates: z.array(z.string()).nullable().optional(),     // YYYY-MM-DD format
  dateRanges: z.array(z.object({          // For seasonal rules
    start: z.string(),              // YYYY-MM-DD
    end: z.string(),                // YYYY-MM-DD
  })).nullable().optional(),
  isActive: z.boolean(),
  countryId: z.number().nullable().optional(),
  stateId: z.number().nullable().optional(),
  cityId: z.number().nullable().optional(),
  zoneId: z.number().nullable().optional(),
  priority: z.number(),             // Rule priority (higher = applied first)
  scope: z.string().optional(),      // Geographic scope description (e.g., "País: Venezuela")
  createdAt: z.string(),            // ISO date string
  updatedAt: z.string(),            // ISO date string
});

// Temporal pricing rules list response schema
export const temporalPricingRulesListResponseSchema = z.object({
  rules: z.array(temporalPricingRuleSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});

// ========== CREATE/UPDATE DTO SCHEMAS ==========

// Base temporal pricing rule schema (without validation)
const baseTemporalPricingRuleSchema = z.object({
  name: z.string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(100, 'El nombre no puede tener más de 100 caracteres'),
  description: z.string()
    .max(500, 'La descripción no puede tener más de 500 caracteres')
    .optional()
    .or(z.literal('')),
  ruleType: z.enum(['time_range', 'day_of_week', 'date_specific', 'seasonal'], {
    errorMap: () => ({ message: 'Tipo de regla inválido' })
  }),
  multiplier: z.number()
    .min(0.1, 'El multiplicador debe ser al menos 0.1')
    .max(10.0, 'El multiplicador no puede ser mayor a 10.0'),
  startTime: z.string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)')
    .optional(),
  endTime: z.string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)')
    .optional(),
  daysOfWeek: z.array(z.number().min(0).max(6)).optional(),
  specificDates: z.array(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (YYYY-MM-DD)')).optional(),
  dateRanges: z.array(z.object({
    start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (YYYY-MM-DD)'),
    end: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (YYYY-MM-DD)'),
  })).optional(),
  isActive: z.boolean().default(true),
  countryId: z.number().positive().optional(),
  stateId: z.number().positive().optional(),
  cityId: z.number().positive().optional(),
  zoneId: z.number().positive().optional(),
  priority: z.number()
    .min(1, 'La prioridad debe ser al menos 1')
    .max(100, 'La prioridad no puede ser mayor a 100')
    .default(1),
});

// Create temporal pricing rule schema with validation
export const createTemporalPricingRuleSchema = baseTemporalPricingRuleSchema.refine((data) => {
  // Validation: at least one condition must be configured
  const hasTimeRange = data.startTime && data.endTime;
  const hasDaysOfWeek = data.daysOfWeek && data.daysOfWeek.length > 0;
  const hasSpecificDates = data.specificDates && data.specificDates.length > 0;
  const hasDateRanges = data.dateRanges && data.dateRanges.length > 0;

  return hasTimeRange || hasDaysOfWeek || hasSpecificDates || hasDateRanges;
}, {
  message: 'Debe configurar al menos una condición (rango horario, días de la semana, fechas específicas o temporada)',
  path: ['ruleType'],
});

// Update temporal pricing rule schema (ruleType required, other fields optional)
export const updateTemporalPricingRuleSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  ruleType: z.enum(['time_range', 'day_of_week', 'date_specific', 'seasonal']),
  multiplier: z.number().min(0.1).max(10.0).optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  daysOfWeek: z.array(z.number()).optional(),
  specificDates: z.array(z.string()).optional(),
  dateRanges: z.array(z.object({
    start: z.string(),
    end: z.string(),
  })).optional(),
  isActive: z.boolean().optional(),
  countryId: z.number().optional(),
  stateId: z.number().optional(),
  cityId: z.number().optional(),
  zoneId: z.number().optional(),
  priority: z.number().min(1).max(100).optional(),
});

// ========== QUERY SCHEMAS ==========

// Temporal rules query params schema
export const temporalRulesQueryParamsSchema = z.object({
  page: z.number().min(1).default(1).optional(),
  limit: z.number().min(1).max(100).default(20).optional(),
  ruleType: z.enum(['time_range', 'day_of_week', 'date_specific', 'seasonal']).optional(),
  isActive: z.boolean().optional(),
  countryId: z.number().positive().optional(),
  stateId: z.number().positive().optional(),
  cityId: z.number().positive().optional(),
  zoneId: z.number().positive().optional(),
  search: z.string().max(100).optional().or(z.literal('')),
  sortBy: z.enum(['name', 'ruleType', 'multiplier', 'priority', 'createdAt']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

// ========== EVALUATION SCHEMAS ==========

// Temporal pricing evaluation input schema
export const temporalPricingEvaluationSchema = z.object({
  dateTime: z.string(), // ISO date string
  countryId: z.number().positive().optional(),
  stateId: z.number().positive().optional(),
  cityId: z.number().positive().optional(),
  zoneId: z.number().positive().optional(),
});

// Temporal pricing evaluation result schema
export const temporalPricingEvaluationResultSchema = z.object({
  dateTime: z.string(),
  location: z.object({
    countryId: z.number().nullable().optional(),
    stateId: z.number().nullable().optional(),
    cityId: z.number().nullable().optional(),
    zoneId: z.number().nullable().optional(),
  }),
  activeRules: z.array(z.object({
    id: z.number(),
    name: z.string(),
    ruleType: z.string(),
    multiplier: z.number(),
    reason: z.string(),
  })),
  effectiveMultiplier: z.number(),
  ruleCount: z.number(),
});

// ========== STANDARD RULES SCHEMAS ==========

// Create standard temporal rules input schema
export const createStandardTemporalRulesSchema = z.object({
  countryId: z.number().positive().optional(),
  cityId: z.number().positive().optional(),
  rules: z.array(z.object({
    type: z.enum(['morning_peak', 'evening_peak', 'night_surcharge', 'weekend_surcharge', 'holiday_surcharge']),
    multiplier: z.number().min(0.1).max(10.0),
    customConfig: z.object({
      startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
      endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
      daysOfWeek: z.array(z.number().min(0).max(6)).optional(),
    }).optional(),
  })),
});

// Standard temporal rules response schema
export const standardTemporalRulesResponseSchema = z.object({
  created: z.number(),
  rules: z.array(temporalPricingRuleSchema),
  skipped: z.array(z.object({
    type: z.string(),
    reason: z.string(),
  })),
});

// ========== BULK OPERATIONS SCHEMAS ==========

// Bulk temporal rule update input schema
export const bulkTemporalRuleUpdateSchema = z.object({
  ruleIds: z.array(z.number().positive()),
  updates: z.object({
    multiplier: z.number().min(0.1).max(10.0).optional(),
    isActive: z.boolean().optional(),
    priority: z.number().min(1).max(100).optional(),
    countryId: z.number().positive().optional(),
    stateId: z.number().positive().optional(),
    cityId: z.number().positive().optional(),
    zoneId: z.number().positive().optional(),
  }),
});

// Bulk temporal rule update response schema
export const bulkTemporalRuleUpdateResponseSchema = z.object({
  updated: z.number(),
  failed: z.number(),
  results: z.array(z.object({
    ruleId: z.number(),
    ruleName: z.string(),
    success: z.boolean(),
    error: z.string().optional(),
  })),
});

// ========== SUMMARY/OVERVIEW SCHEMA ==========

// Temporal rules summary response schema
export const temporalRulesSummaryResponseSchema = z.object({
  summary: z.object({
    totalActiveRules: z.number(),
    rulesByType: z.object({
      time_range: z.number(),
      day_of_week: z.number(),
      date_specific: z.number(),
      seasonal: z.number(),
    }),
    rulesByScope: z.object({
      global: z.number(),
      country: z.number(),
      state: z.number(),
      city: z.number(),
      zone: z.number(),
    }),
    averageMultiplier: z.number(),
    highestMultiplier: z.number(),
    lowestMultiplier: z.number(),
  }),
});

// ========== SIMULATION SCHEMA ==========

// Pricing simulation input schema
export const pricingSimulationSchema = z.object({
  tierId: z.number().positive(),
  distance: z.number().min(0),
  duration: z.number().min(0),
  dateTime: z.string(), // ISO date string
  ruleIds: z.array(z.number().positive()).optional(), // Manual mode: specific rules to apply
  countryId: z.number().positive().optional(),
  stateId: z.number().positive().optional(),
  cityId: z.number().positive().optional(),
  zoneId: z.number().positive().optional(),
});

// ========== SIMULATION RESPONSE DTOs ==========

// SimulatePricingBasePricingDto - Base pricing breakdown
export const simulatePricingBasePricingSchema = z.object({
  baseFare: z.number(), // Base fare in cents
  distanceCost: z.number(), // Distance cost in cents
  timeCost: z.number(), // Time cost in cents
  subtotal: z.number(), // Subtotal before adjustments in cents
  tierAdjustedTotal: z.number(), // After tier multiplier in cents
});

// SimulatePricingRegionalMultipliersDto - Geographic multipliers
export const simulatePricingRegionalMultipliersSchema = z.object({
  countryMultiplier: z.number(),
  stateMultiplier: z.number(),
  cityMultiplier: z.number(),
  zoneMultiplier: z.number(),
  totalMultiplier: z.number(),
});

// SimulatePricingDynamicPricingDto - Dynamic pricing multipliers
export const simulatePricingDynamicPricingSchema = z.object({
  surgeMultiplier: z.number(),
  demandMultiplier: z.number(),
  totalDynamicMultiplier: z.number(),
});

// SimulatePricingTemporalPricingDto - Temporal pricing application
export const simulatePricingTemporalPricingSchema = z.object({
  temporalMultiplier: z.number(),
  temporalAdjustedTotal: z.number(), // Total after temporal adjustment in cents
  temporalAdjustments: z.number(), // Amount added by temporal pricing in cents
});

// SimulatePricingFinalPricingDto - Final pricing calculation
export const simulatePricingFinalPricingSchema = z.object({
  baseAmount: z.number(), // Base amount after regional adjustments in cents
  regionalAdjustments: z.number(), // Regional adjustments amount in cents
  dynamicAdjustments: z.number(), // Dynamic adjustments amount in cents
  serviceFees: z.number(), // Service fees in cents
  taxes: z.number(), // Taxes in cents
  temporalAdjustedTotal: z.number(), // Total with temporal adjustments in cents
  temporalAdjustments: z.number(), // Temporal adjustments amount in cents
  totalAmountWithTemporal: z.number(), // Final total with temporal pricing in cents
});

// SimulatePricingMetadataDto - Additional calculation information
export const simulatePricingMetadataSchema = z.object({
  currency: z.string(), // Currency code (e.g., "USD")
  distanceUnit: z.string(), // Distance unit (e.g., "kilometers")
  calculationTimestamp: z.string(), // ISO date string
  appliedRules: z.array(z.string()), // List of applied rule descriptions
  simulationMode: z.enum(['automatic_evaluation', 'manual_rules']), // Mode used for simulation
});

// SimulatePricingTierDto - Tier information used in calculation
export const simulatePricingTierSchema = z.object({
  id: z.number(),
  name: z.string(),
  baseFare: z.number(),
  minimumFare: z.number().optional(),
  perMinuteRate: z.number(),
  perKmRate: z.number(),
  tierMultiplier: z.number(),
  surgeMultiplier: z.number(),
  demandMultiplier: z.number(),
  luxuryMultiplier: z.number(),
  comfortMultiplier: z.number(),
});

// SimulatePricingScopeDto - Geographic scope of evaluation
export const simulatePricingScopeSchema = z.object({
  country: z.string().optional(),
  state: z.string().optional(),
  city: z.string().optional(),
  zone: z.string().optional(),
});

// SimulatePricingTemporalEvaluationDto - Complete temporal evaluation
export const simulatePricingTemporalEvaluationSchema = z.object({
  evaluatedAt: z.string(),
  dayOfWeek: z.number(),
  time: z.string(),
  applicableRules: z.array(z.object({
    id: z.number(),
    name: z.string(),
    ruleType: z.string(),
    multiplier: z.number(),
    priority: z.number(),
  })),
  appliedRule: z.object({
    id: z.number(),
    name: z.string(),
    ruleType: z.string(),
    multiplier: z.number(),
    priority: z.number(),
  }).optional(),
  combinedMultiplier: z.number(),
  scope: simulatePricingScopeSchema,
});

// SimulatePricingResponseDto - Main simulation response
export const pricingSimulationResultSchema = z.object({
  temporalEvaluation: simulatePricingTemporalEvaluationSchema,
  basePricing: simulatePricingBasePricingSchema,
  regionalMultipliers: simulatePricingRegionalMultipliersSchema,
  dynamicPricing: simulatePricingDynamicPricingSchema,
  temporalPricing: simulatePricingTemporalPricingSchema,
  finalPricing: simulatePricingFinalPricingSchema,
  metadata: simulatePricingMetadataSchema,
  tier: simulatePricingTierSchema,
  scope: simulatePricingScopeSchema,
});

// ========== TYPES ==========

export type TemporalPricingRule = z.infer<typeof temporalPricingRuleSchema>;
export type TemporalPricingRulesListResponse = z.infer<typeof temporalPricingRulesListResponseSchema>;
export type CreateTemporalPricingRuleInput = z.infer<typeof createTemporalPricingRuleSchema>;
export type UpdateTemporalPricingRuleInput = z.infer<typeof updateTemporalPricingRuleSchema>;
export type TemporalRulesQueryParams = z.infer<typeof temporalRulesQueryParamsSchema>;
export type TemporalPricingEvaluationInput = z.infer<typeof temporalPricingEvaluationSchema>;
export type TemporalPricingEvaluationResult = z.infer<typeof temporalPricingEvaluationResultSchema>;
export type CreateStandardTemporalRulesInput = z.infer<typeof createStandardTemporalRulesSchema>;
export type StandardTemporalRulesResponse = z.infer<typeof standardTemporalRulesResponseSchema>;
export type BulkTemporalRuleUpdateInput = z.infer<typeof bulkTemporalRuleUpdateSchema>;
export type BulkTemporalRuleUpdateResponse = z.infer<typeof bulkTemporalRuleUpdateResponseSchema>;
export type TemporalRulesSummaryResponse = z.infer<typeof temporalRulesSummaryResponseSchema>;
export type PricingSimulationInput = z.infer<typeof pricingSimulationSchema>;
export type PricingSimulationResult = z.infer<typeof pricingSimulationResultSchema>;
