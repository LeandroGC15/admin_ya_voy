// ========== RE-EXPORTS FROM SPECIFIC SCHEMA FILES ==========
// Re-export all types and schemas from the specific modules for backward compatibility

// Ride Tiers
export * from './ride-tiers.schemas';

// Temporal Rules
export * from './temporal-rules.schemas';

// ========== LEGACY TYPE ALIASES (for backward compatibility) ==========
// These aliases maintain compatibility with any existing code that imports from this file

// Ride Tiers legacy aliases
export type {
  RideTier,
  RideTiersListResponse,
  CreateRideTierInput as CreateRideTierDto,
  UpdateRideTierInput as UpdateRideTierDto,
  RideTiersQueryParams,
  PricingCalculationInput as PricingCalculationDto,
  PricingCalculationResult,
  PricingValidationInput as PricingValidationDto,
  PricingValidationResult,
  StandardTiersResponse,
  BulkRideTierUpdateInput as BulkRideTierUpdateDto,
  BulkTierUpdateResponse,
  PricingSummaryResponse,
} from './ride-tiers.schemas';

// Temporal Rules legacy aliases
export type {
  TemporalPricingRule,
  TemporalPricingRulesListResponse,
  CreateTemporalPricingRuleInput as CreateTemporalPricingRuleDto,
  UpdateTemporalPricingRuleInput as UpdateTemporalPricingRuleDto,
  TemporalRulesQueryParams,
  TemporalPricingEvaluationInput as TemporalPricingEvaluationDto,
  TemporalPricingEvaluationResult,
  CreateStandardTemporalRulesInput as CreateStandardTemporalRulesDto,
  StandardTemporalRulesResponse,
  BulkTemporalRuleUpdateInput as BulkTemporalRuleUpdateDto,
  BulkTemporalRuleUpdateResponse,
  TemporalRulesSummaryResponse,
  PricingSimulationInput,
  PricingSimulationResult,
} from './temporal-rules.schemas';

// ========== ERROR RESPONSE ==========

export interface ErrorResponse {
  statusCode: number;
  message: string | string[];  // Error message(s)
  error: string;               // Error type
  timestamp?: string;          // ISO date string
  path?: string;               // Request path
  method?: string;             // HTTP method
}
