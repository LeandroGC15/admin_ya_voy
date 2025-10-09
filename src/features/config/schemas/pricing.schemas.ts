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
  RideTierListItem,
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
  VehicleType,
  VehicleTypesResponse,
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

// New simulation DTOs types
export type SimulatePricingBasePricingDto = {
  baseFare: number;
  distanceCost: number;
  timeCost: number;
  subtotal: number;
  tierAdjustedTotal: number;
};

export type SimulatePricingRegionalMultipliersDto = {
  countryMultiplier: number;
  stateMultiplier: number;
  cityMultiplier: number;
  zoneMultiplier: number;
  totalMultiplier: number;
};

export type SimulatePricingDynamicPricingDto = {
  surgeMultiplier: number;
  demandMultiplier: number;
  totalDynamicMultiplier: number;
};

export type SimulatePricingTemporalPricingDto = {
  temporalMultiplier: number;
  temporalAdjustedTotal: number;
  temporalAdjustments: number;
};

export type SimulatePricingFinalPricingDto = {
  baseAmount: number;
  regionalAdjustments: number;
  dynamicAdjustments: number;
  serviceFees: number;
  taxes: number;
  temporalAdjustedTotal: number;
  temporalAdjustments: number;
  totalAmountWithTemporal: number;
};

export type SimulatePricingMetadataDto = {
  currency: string;
  distanceUnit: string;
  calculationTimestamp: string;
  appliedRules: string[];
  simulationMode: 'automatic_evaluation' | 'manual_rules';
};

export type SimulatePricingTierDto = {
  id: number;
  name: string;
  baseFare: number;
  minimumFare?: number;
  perMinuteRate: number;
  perKmRate: number;
  tierMultiplier: number;
  surgeMultiplier: number;
  demandMultiplier: number;
  luxuryMultiplier: number;
  comfortMultiplier: number;
};

export type SimulatePricingScopeDto = {
  country?: string;
  state?: string;
  city?: string;
  zone?: string;
};

export type SimulatePricingTemporalEvaluationDto = {
  evaluatedAt: string;
  dayOfWeek: number;
  time: string;
  applicableRules: Array<{
    id: number;
    name: string;
    ruleType: string;
    multiplier: number;
    priority: number;
  }>;
  appliedRule?: {
    id: number;
    name: string;
    ruleType: string;
    multiplier: number;
    priority: number;
  };
  combinedMultiplier: number;
  scope: SimulatePricingScopeDto;
};

// ========== ERROR RESPONSE ==========

export interface ErrorResponse {
  statusCode: number;
  message: string | string[];  // Error message(s)
  error: string;               // Error type
  timestamp?: string;          // ISO date string
  path?: string;               // Request path
  method?: string;             // HTTP method
}
