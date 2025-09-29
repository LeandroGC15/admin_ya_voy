/**
 * Pricing Management interfaces
 */

// Ride Tiers
export interface RideTier {
  id: number;
  name: string;
  description?: string;
  baseFare: number;
  perMinuteRate: number;
  perMileRate: number;
  minimumFare: number;
  maximumFare: number;
  bookingFee: number;
  isActive: boolean;
  countryId?: number;
  stateId?: number;
  cityId?: number;
  serviceZoneId?: number;
  priority: number;
  features: string[];
  restrictions: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateRideTierRequest {
  name: string;
  description?: string;
  baseFare: number;
  perMinuteRate: number;
  perMileRate: number;
  minimumFare: number;
  maximumFare: number;
  bookingFee: number;
  isActive: boolean;
  countryId?: number;
  stateId?: number;
  cityId?: number;
  serviceZoneId?: number;
  priority: number;
  features: string[];
  restrictions: string[];
}

export interface UpdateRideTierRequest {
  description?: string;
  baseFare?: number;
  perMinuteRate?: number;
  perMileRate?: number;
  minimumFare?: number;
  maximumFare?: number;
  bookingFee?: number;
  isActive?: boolean;
  priority?: number;
  features?: string[];
  restrictions?: string[];
}

export interface RideTierFilters {
  countryId?: number;
  stateId?: number;
  cityId?: number;
  serviceZoneId?: number;
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface RideTiersResponse {
  tiers: RideTier[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Pricing Calculation
export interface PricingCalculationRequest {
  tierId: number;
  distance: number;
  duration: number;
  countryId?: number;
  stateId?: number;
  cityId?: number;
  serviceZoneId?: number;
  isPeakHour?: boolean;
  isNightTime?: boolean;
  isWeekend?: boolean;
  isHoliday?: boolean;
  trafficMultiplier?: number;
}

export interface PricingCalculationResult {
  tier: {
    id: number;
    name: string;
    baseFare: number;
    perMinuteRate: number;
    perMileRate: number;
  };
  distance: number;
  duration: number;
  baseFare: number;
  distanceFare: number;
  timeFare: number;
  subtotal: number;
  bookingFee: number;
  peakHourMultiplier: number;
  nightTimeMultiplier: number;
  weekendMultiplier: number;
  holidayMultiplier: number;
  trafficMultiplier: number;
  totalMultiplier: number;
  totalFare: number;
  estimatedTaxes: number;
  finalFare: number;
}

// Pricing Validation
export interface ValidatePricingRequest {
  tier: {
    name: string;
    baseFare: number;
    perMinuteRate: number;
    perMileRate: number;
    minimumFare: number;
    maximumFare: number;
  };
  compareWithTierId?: number;
}

export interface PricingValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

// Temporal Pricing Rules
export interface TemporalPricingRule {
  id: number;
  name: string;
  description?: string;
  ruleType: 'time_range' | 'peak_hour' | 'night_surcharge' | 'weekend_surcharge' | 'holiday_surcharge';
  multiplier: number;
  startTime?: string;
  endTime?: string;
  daysOfWeek?: number[];
  isActive: boolean;
  countryId?: number;
  stateId?: number;
  cityId?: number;
  zoneId?: number;
  priority: number;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTemporalRuleRequest {
  name: string;
  description?: string;
  ruleType: 'time_range' | 'peak_hour' | 'night_surcharge' | 'weekend_surcharge' | 'holiday_surcharge';
  multiplier: number;
  startTime?: string;
  endTime?: string;
  daysOfWeek?: number[];
  isActive: boolean;
  countryId?: number;
  stateId?: number;
  cityId?: number;
  zoneId?: number;
  priority: number;
  expiresAt?: string;
}

export interface UpdateTemporalRuleRequest {
  name?: string;
  description?: string;
  multiplier?: number;
  startTime?: string;
  endTime?: string;
  daysOfWeek?: number[];
  isActive?: boolean;
  priority?: number;
  expiresAt?: string;
}

export interface TemporalRuleFilters {
  ruleType?: string;
  isActive?: boolean;
  countryId?: number;
  stateId?: number;
  cityId?: number;
  zoneId?: number;
  search?: string;
  page?: number;
  limit?: number;
}

export interface TemporalRulesResponse {
  rules: TemporalPricingRule[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Rule Evaluation
export interface EvaluateTemporalRulesRequest {
  dateTime: string;
  countryId?: number;
  stateId?: number;
  cityId?: number;
  zoneId?: number;
}

export interface ActiveTemporalRule {
  id: number;
  name: string;
  ruleType: string;
  multiplier: number;
  reason: string;
}

export interface TemporalRulesEvaluationResult {
  dateTime: string;
  location: {
    countryId?: number;
    stateId?: number;
    cityId?: number;
    zoneId?: number;
  };
  activeRules: ActiveTemporalRule[];
  effectiveMultiplier: number;
  ruleCount: number;
}

// Bulk Operations
export interface BulkUpdateTiersRequest {
  tierIds: number[];
  adjustmentType: 'percentage' | 'fixed';
  adjustmentValue: number;
  field: 'baseFare' | 'perMinuteRate' | 'perMileRate' | 'bookingFee';
}

export interface BulkUpdateRulesRequest {
  ruleIds: number[];
  updates: Partial<UpdateTemporalRuleRequest>;
}

// Standard Tiers Creation
export interface CreateStandardTiersRequest {
  countryId?: number;
  cityId?: number;
  rules: Array<{
    type: 'basic' | 'premium' | 'luxury' | 'shared';
    multiplier?: number;
  }>;
}

export interface CreateStandardRulesRequest {
  countryId?: number;
  cityId?: number;
  rules: Array<{
    type: 'morning_peak' | 'evening_peak' | 'night_surcharge' | 'weekend_surcharge';
    multiplier: number;
  }>;
}
