import { useApiQuery, useApiMutation, invalidateQueries } from '@/lib/api/react-query-client';
import { api } from '@/lib/api/api-client';
import { ENDPOINTS } from '@/lib/endpoints';
import type {
  // Ride Tiers
  RideTier as PricingRideTier,
  RideTiersListResponse,
  RideTiersQueryParams,
  CreateRideTierInput,
  UpdateRideTierInput,
  PricingCalculationInput,
  PricingCalculationResult,
  PricingValidationInput,
  PricingValidationResult,
  StandardTiersResponse,
  BulkRideTierUpdateInput,
  BulkTierUpdateResponse,
  PricingSummaryResponse,
  VehicleType,
  VehicleTypesResponse,
  // Temporal Rules
  TemporalPricingRule,
  TemporalPricingRulesListResponse,
  TemporalRulesQueryParams,
  CreateTemporalPricingRuleInput,
  UpdateTemporalPricingRuleInput,
  TemporalPricingEvaluationInput,
  TemporalPricingEvaluationResult,
  CreateStandardTemporalRulesInput,
  StandardTemporalRulesResponse,
  BulkTemporalRuleUpdateInput,
  BulkTemporalRuleUpdateResponse,
  TemporalRulesSummaryResponse,
  PricingSimulationInput,
  PricingSimulationResult,
} from '../schemas/pricing.schemas';

// Query Keys
export const pricingKeys = {
  all: ['pricing'] as const,
  rideTiers: () => [...pricingKeys.all, 'rideTiers'] as const,
  rideTiersList: (params: RideTiersQueryParams) => [...pricingKeys.rideTiers(), 'list', params] as const,
  rideTierDetail: (id: number) => [...pricingKeys.rideTiers(), 'detail', id] as const,
  rideTiersSummary: () => [...pricingKeys.rideTiers(), 'summary'] as const,
  vehicleTypes: () => [...pricingKeys.rideTiers(), 'vehicleTypes'] as const,
  temporalRules: () => [...pricingKeys.all, 'temporalRules'] as const,
  temporalRulesList: (params: TemporalRulesQueryParams) => [...pricingKeys.temporalRules(), 'list', params] as const,
  temporalRuleDetail: (id: number) => [...pricingKeys.temporalRules(), 'detail', id] as const,
  temporalRulesSummary: () => [...pricingKeys.temporalRules(), 'summary'] as const,
  calculations: () => [...pricingKeys.all, 'calculations'] as const,
  validations: () => [...pricingKeys.all, 'validations'] as const,
  simulations: () => [...pricingKeys.all, 'simulations'] as const,
};

// ========== RIDE TIERS HOOKS ==========

// Fetch ride tiers list
export function useRideTiers(params: RideTiersQueryParams = {}) {
  return useApiQuery(
    pricingKeys.rideTiersList(params),
    async (): Promise<RideTiersListResponse> => {
      const response = await api.get<RideTiersListResponse>(ENDPOINTS.pricing.rideTiers, {
        params: {
          page: params.page || 1,
          limit: params.limit || 20,
          countryId: params.countryId,
          stateId: params.stateId,
          cityId: params.cityId,
          serviceZoneId: params.serviceZoneId,
          isActive: params.isActive,
          search: params.search,
          sortBy: params.sortBy,
          sortOrder: params.sortOrder,
        },
      });
      if (!response || !response.data) {
        throw new Error('Invalid API response: no data received');
      }
      return response.data;
    },
    {
      enabled: true,
    }
  );
}

// Transform ride tier data to match backend expectations
function transformRideTierData(data: CreateRideTierInput | UpdateRideTierInput) {
  return {
    ...data,
    // Ensure multipliers are within backend limits
    tierMultiplier: Math.max(0.5, Math.min(5.0, data.tierMultiplier || 1.0)),
    surgeMultiplier: Math.max(1.0, Math.min(10.0, data.surgeMultiplier || 1.0)),
    demandMultiplier: Math.max(1.0, Math.min(5.0, data.demandMultiplier || 1.0)),
    luxuryMultiplier: Math.max(1.0, Math.min(3.0, data.luxuryMultiplier || 1.0)),
    comfortMultiplier: Math.max(1.0, Math.min(2.0, data.comfortMultiplier || 1.0)),
  };
}

// Create ride tier
export function useCreateRideTier() {
  return useApiMutation(
    async (data: CreateRideTierInput): Promise<PricingRideTier> => {
      const transformedData = transformRideTierData(data);
      console.log('📤 useCreateRideTier - Original data:', data);
      console.log('🔄 useCreateRideTier - Transformed data:', transformedData);
      const response = await api.post<PricingRideTier>(ENDPOINTS.pricing.rideTiers, transformedData);
      if (!response || !response.data) {
        throw new Error('Invalid API response: no data received');
      }
      return response.data;
    },
    {
      onSuccess: () => {
        invalidateQueries(['pricing']);
      },
    }
  );
}

// Get single ride tier
export function useRideTier(id: number) {
  return useApiQuery(
    pricingKeys.rideTierDetail(id),
    async (): Promise<PricingRideTier> => {
      const response = await api.get<PricingRideTier>(ENDPOINTS.pricing.rideTierById(id));
      if (!response || !response.data) {
        throw new Error('Invalid API response: no data received');
      }
      return response.data;
    },
    {
      enabled: !!id,
    }
  );
}

// Update ride tier
export function useUpdateRideTier() {
  return useApiMutation(
    async ({ id, data }: { id: number; data: UpdateRideTierInput }): Promise<PricingRideTier> => {
      // Transform data to match backend validation limits
      const transformedData = transformRideTierData(data);

      console.log('📤 useUpdateRideTier - Original data:', data);
      console.log('🔄 useUpdateRideTier - Transformed data:', transformedData);

      const response = await api.patch<PricingRideTier>(ENDPOINTS.pricing.rideTierById(id), transformedData);
      if (!response || !response.data) {
        throw new Error('Invalid API response: no data received');
      }
      return response.data;
    },
    {
      onSuccess: () => {
        invalidateQueries(['pricing']);
      },
    }
  );
}

// Delete ride tier
export function useDeleteRideTier() {
  return useApiMutation(
    async (id: number): Promise<void> => {
      await api.delete<void>(ENDPOINTS.pricing.rideTierById(id));
    },
    {
      onSuccess: () => {
        invalidateQueries(['pricing']);
      },
    }
  );
}

// Upload tier image
export function useUploadTierImage() {
  return useApiMutation(
    async ({ tierId, file }: { tierId: number; file: File }): Promise<PricingRideTier> => {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post<PricingRideTier>(
        ENDPOINTS.pricing.rideTierUploadImage(tierId),
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      
      if (!response || !response.data) {
        throw new Error('Invalid API response: no data received');
      }
      return response.data;
    },
    {
      onSuccess: () => {
        invalidateQueries(['pricing']);
      },
    }
  );
}

// Toggle ride tier status
export function useToggleRideTierStatus() {
  return useApiMutation(
    async ({ id }: { id: number }): Promise<PricingRideTier> => {
      const response = await api.patch<PricingRideTier>(ENDPOINTS.pricing.rideTierToggleStatus(id));
      if (!response || !response.data) {
        throw new Error('Invalid API response: no data received');
      }
      return response.data;
    },
    {
      onSuccess: () => {
        invalidateQueries(['pricing']);
      },
    }
  );
}

// Calculate pricing
export function useCalculatePricing() {
  return useApiMutation(
    async (data: PricingCalculationInput): Promise<PricingCalculationResult> => {
      const response = await api.post<PricingCalculationResult>(
        ENDPOINTS.pricing.calculatePricing,
        data
      );
      if (!response || !response.data) {
        throw new Error('Invalid API response: no data received');
      }
      return response.data;
    }
  );
}

// Validate pricing configuration
export function useValidatePricing() {
  return useApiMutation(
    async (data: PricingValidationInput): Promise<PricingValidationResult> => {
      const response = await api.post<PricingValidationResult>(
        ENDPOINTS.pricing.validatePricing,
        data
      );
      if (!response || !response.data) {
        throw new Error('Invalid API response: no data received');
      }
      return response.data;
    }
  );
}

// Create standard ride tiers
export function useCreateStandardTiers() {
  return useApiMutation(
    async (): Promise<StandardTiersResponse> => {
      const response = await api.post<StandardTiersResponse>(ENDPOINTS.pricing.standardTiers);
      if (!response || !response.data) {
        throw new Error('Invalid API response: no data received');
      }
      return response.data;
    },
    {
      onSuccess: () => {
        invalidateQueries(['pricing']);
      },
    }
  );
}

// Bulk update ride tiers
export function useBulkUpdateRideTiers() {
  return useApiMutation(
    async (data: BulkRideTierUpdateInput): Promise<BulkTierUpdateResponse> => {
      const response = await api.post<BulkTierUpdateResponse>(
        ENDPOINTS.pricing.bulkUpdateTiers,
        data
      );
      if (!response || !response.data) {
        throw new Error('Invalid API response: no data received');
      }
      return response.data;
    },
    {
      onSuccess: () => {
        invalidateQueries(['pricing']);
      },
    }
  );
}

// ========== TEMPORAL PRICING RULES HOOKS ==========

// Fetch temporal rules list
export function useTemporalRules(params: TemporalRulesQueryParams = {}) {
  return useApiQuery(
    pricingKeys.temporalRulesList(params),
    async (): Promise<TemporalPricingRulesListResponse> => {
      const response = await api.get<TemporalPricingRulesListResponse>(ENDPOINTS.pricing.temporalRules, {
        params: {
          page: params.page || 1,
          limit: params.limit || 20,
          ruleType: params.ruleType,
          isActive: params.isActive,
          countryId: params.countryId,
          stateId: params.stateId,
          cityId: params.cityId,
          zoneId: params.zoneId,
          search: params.search,
          sortBy: params.sortBy,
          sortOrder: params.sortOrder,
        },
      });
      if (!response || !response.data) {
        throw new Error('Invalid API response: no data received');
      }
      return response.data;
    },
    {
      enabled: true,
    }
  );
}

// Create temporal rule
export function useCreateTemporalRule() {
  return useApiMutation(
    async (data: CreateTemporalPricingRuleInput): Promise<TemporalPricingRule> => {
      const response = await api.post<TemporalPricingRule>(ENDPOINTS.pricing.temporalRules, data);
      if (!response || !response.data) {
        throw new Error('Invalid API response: no data received');
      }
      return response.data;
    },
    {
      onSuccess: () => {
        invalidateQueries(['pricing']);
      },
    }
  );
}

// Get single temporal rule
export function useTemporalRule(id: number) {
  return useApiQuery(
    pricingKeys.temporalRuleDetail(id),
    async (): Promise<TemporalPricingRule> => {
      const response = await api.get<TemporalPricingRule>(ENDPOINTS.pricing.temporalRuleById(id));
      if (!response || !response.data) {
        throw new Error('Invalid API response: no data received');
      }
      return response.data;
    },
    {
      enabled: !!id,
    }
  );
}

// Update temporal rule
export function useUpdateTemporalRule() {
  return useApiMutation(
    async ({ id, data }: { id: number; data: UpdateTemporalPricingRuleInput }): Promise<TemporalPricingRule> => {
      const response = await api.patch<TemporalPricingRule>(ENDPOINTS.pricing.temporalRuleById(id), data);
      if (!response || !response.data) {
        throw new Error('Invalid API response: no data received');
      }
      return response.data;
    },
    {
      onSuccess: () => {
        invalidateQueries(['pricing']);
      },
    }
  );
}

// Delete temporal rule
export function useDeleteTemporalRule() {
  return useApiMutation(
    async (id: number): Promise<void> => {
      await api.delete<void>(ENDPOINTS.pricing.temporalRuleById(id));
    },
    {
      onSuccess: () => {
        invalidateQueries(['pricing']);
      },
    }
  );
}

// Toggle temporal rule status
export function useToggleTemporalRuleStatus() {
  return useApiMutation(
    async ({ id }: { id: number }): Promise<TemporalPricingRule> => {
      const response = await api.patch<TemporalPricingRule>(ENDPOINTS.pricing.temporalRuleToggleStatus(id));
      if (!response || !response.data) {
        throw new Error('Invalid API response: no data received');
      }
      return response.data;
    },
    {
      onSuccess: () => {
        invalidateQueries(['pricing']);
      },
    }
  );
}

// Evaluate temporal rules for a date/time
export function useEvaluateTemporalRules() {
  return useApiMutation(
    async (data: TemporalPricingEvaluationInput): Promise<TemporalPricingEvaluationResult> => {
      const response = await api.post<TemporalPricingEvaluationResult>(
        ENDPOINTS.pricing.evaluateRules,
        data
      );
      if (!response || !response.data) {
        throw new Error('Invalid API response: no data received');
      }
      return response.data;
    }
  );
}

// Create standard temporal rules
export function useCreateStandardTemporalRules() {
  return useApiMutation(
    async (data: CreateStandardTemporalRulesInput): Promise<StandardTemporalRulesResponse> => {
      const response = await api.post<StandardTemporalRulesResponse>(
        ENDPOINTS.pricing.standardRules,
        data
      );
      if (!response || !response.data) {
        throw new Error('Invalid API response: no data received');
      }
      return response.data;
    },
    {
      onSuccess: () => {
        invalidateQueries(['pricing']);
      },
    }
  );
}

// Bulk update temporal rules
export function useBulkUpdateTemporalRules() {
  return useApiMutation(
    async (data: BulkTemporalRuleUpdateInput): Promise<BulkTemporalRuleUpdateResponse> => {
      const response = await api.post<BulkTemporalRuleUpdateResponse>(
        ENDPOINTS.pricing.bulkUpdateRules,
        data
      );
      if (!response || !response.data) {
        throw new Error('Invalid API response: no data received');
      }
      return response.data;
    },
    {
      onSuccess: () => {
        invalidateQueries(['pricing']);
      },
    }
  );
}

// ========== SUMMARY & ANALYTICS HOOKS ==========

// Get ride tiers summary and statistics
export function useRideTiersSummary() {
  return useApiQuery(
    pricingKeys.rideTiersSummary(),
    async (): Promise<PricingSummaryResponse> => {
      const response = await api.get<PricingSummaryResponse>(ENDPOINTS.pricing.rideTiersSummary);
      if (!response || !response.data) {
        throw new Error('Invalid API response: no data received');
      }
      return response.data;
    },
    {
      enabled: true,
    }
  );
}

// Get vehicle types
export function useVehicleTypes() {
  return useApiQuery(
    pricingKeys.vehicleTypes(),
    async (): Promise<VehicleTypesResponse> => {
      const response = await api.post<VehicleTypesResponse>(ENDPOINTS.pricing.vehicleTypes);
      if (!response || !response.data) {
        throw new Error('Invalid API response: no data received');
      }
      return response.data;
    },
    {
      enabled: true,
    }
  );
}

// Get temporal rules summary and statistics
export function useTemporalRulesSummary() {
  return useApiQuery(
    pricingKeys.temporalRulesSummary(),
    async (): Promise<TemporalRulesSummaryResponse> => {
      const response = await api.get<TemporalRulesSummaryResponse>(ENDPOINTS.pricing.temporalRulesSummary);
      if (!response || !response.data) {
        throw new Error('Invalid API response: no data received');
      }
      return response.data;
    },
    {
      enabled: true,
    }
  );
}

// Simulate complete pricing calculation including tier and temporal rules
export function useSimulatePricing() {
  return useApiMutation(
    async (data: PricingSimulationInput): Promise<PricingSimulationResult> => {
      const response = await api.post<PricingSimulationResult>(
        ENDPOINTS.pricing.simulatePricing,
        data
      );
      if (!response || !response.data) {
        throw new Error('Invalid API response: no data received');
      }
      return response.data;
    }
  );
}
