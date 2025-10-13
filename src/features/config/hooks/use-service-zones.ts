import { useApiQuery, useApiMutation, invalidateQueries } from '@/lib/api/react-query-client';
import { api } from '@/lib/api/api-client';
import { ENDPOINTS } from '@/lib/endpoints';
import type {
  ServiceZone,
  ServiceZoneListItem,
  ServiceZonesListResponse,
  CreateServiceZoneInput,
  UpdateServiceZoneInput,
  SearchServiceZonesInput,
  GeometryValidationRequest,
  GeometryValidationResponse,
  CoverageAnalysisResponse,
  BulkPricingUpdateInput,
  PricingValidationRequest,
  PricingValidationResponse,
  PricingStatsResponse,
  BulkStatusUpdateInput,
  BulkStatusUpdateResponse,
} from '../schemas/service-zones.schemas';

// Query Keys
export const serviceZonesKeys = {
  all: ['service-zones'] as const,
  lists: () => [...serviceZonesKeys.all, 'list'] as const,
  list: (params: SearchServiceZonesInput) => [...serviceZonesKeys.lists(), params] as const,
  byCity: (cityId: number) => [...serviceZonesKeys.all, 'byCity', cityId] as const,
  details: () => [...serviceZonesKeys.all, 'detail'] as const,
  detail: (id: number) => [...serviceZonesKeys.details(), id] as const,
  coverage: (cityId: number) => [...serviceZonesKeys.all, 'coverage', cityId] as const,
  pricingMatrix: (cityId: number) => [...serviceZonesKeys.all, 'pricing-matrix', cityId] as const,
  pricingStats: () => [...serviceZonesKeys.all, 'pricing-stats'] as const,
};

// ========== SERVICE ZONES HOOKS ==========

// Fetch service zones list
export function useServiceZones(params: SearchServiceZonesInput = {}) {
  return useApiQuery(
    serviceZonesKeys.list(params),
    async (): Promise<ServiceZonesListResponse> => {
      const response = await api.get<ServiceZonesListResponse>(ENDPOINTS.geography.serviceZones, {
        params: {
          page: params.page || 1,
          limit: params.limit || 20,
          cityId: params.cityId,
          stateId: params.stateId,
          countryId: params.countryId,
          zoneType: params.zoneType,
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

// Get service zones by city
export function useServiceZonesByCity(cityId: number, activeOnly = false) {
  return useApiQuery(
    serviceZonesKeys.byCity(cityId),
    async (): Promise<ServiceZone[]> => {
      const response = await api.get<ServiceZone[]>(ENDPOINTS.geography.serviceZonesByCity(cityId), {
        params: { activeOnly },
      });
      return response.data;
    },
    {
      enabled: !!cityId,
    }
  );
}

// Get single service zone
export function useServiceZone(id: number) {
  return useApiQuery(
    serviceZonesKeys.detail(id),
    async (): Promise<ServiceZone> => {
      const response = await api.get<ServiceZone>(ENDPOINTS.geography.serviceZoneById(id));
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

// Create service zone
export function useCreateServiceZone() {
  return useApiMutation(
    async (data: CreateServiceZoneInput): Promise<ServiceZone> => {
      const response = await api.post<ServiceZone>(ENDPOINTS.geography.serviceZones, data);
      if (!response || !response.data) {
        throw new Error('Invalid API response: no data received');
      }
      return response.data;
    },
    {
      onSuccess: () => {
        invalidateQueries(['service-zones']);
      },
    }
  );
}

// Update service zone
export function useUpdateServiceZone() {
  return useApiMutation(
    async ({ id, data }: { id: number; data: UpdateServiceZoneInput }): Promise<ServiceZone> => {
      const response = await api.patch<ServiceZone>(ENDPOINTS.geography.serviceZoneById(id), data);
      return response.data;
    },
    {
      onSuccess: () => {
        invalidateQueries(['service-zones']);
      },
    }
  );
}

// Delete service zone
export function useDeleteServiceZone() {
  return useApiMutation(
    async (id: number): Promise<void> => {
      await api.delete<void>(ENDPOINTS.geography.serviceZoneById(id));
    },
    {
      onSuccess: () => {
        invalidateQueries(['service-zones']);
      },
    }
  );
}

// Toggle service zone status
export function useToggleServiceZoneStatus() {
  return useApiMutation(
    async (id: number): Promise<ServiceZone> => {
      const response = await api.patch<ServiceZone>(ENDPOINTS.geography.serviceZoneToggleStatus(id));
      return response.data;
    },
    {
      onSuccess: () => {
        invalidateQueries(['service-zones']);
      },
    }
  );
}

// ========== VALIDATION HOOKS ==========

// Validate geometry
export function useValidateGeometry() {
  return useApiMutation(
    async (data: GeometryValidationRequest): Promise<GeometryValidationResponse> => {
      const response = await api.post<GeometryValidationResponse>(
        ENDPOINTS.geography.validateGeometry,
        data
      );
      return response.data;
    }
  );
}

// Validate pricing
export function useValidatePricing() {
  return useApiMutation(
    async (data: PricingValidationRequest): Promise<PricingValidationResponse> => {
      const response = await api.post<PricingValidationResponse>(
        ENDPOINTS.geography.validatePricing,
        data
      );
      return response.data;
    }
  );
}

// ========== ANALYSIS HOOKS ==========

// Get coverage analysis
export function useCoverageAnalysis(cityId: number) {
  return useApiQuery(
    serviceZonesKeys.coverage(cityId),
    async (): Promise<CoverageAnalysisResponse> => {
      const response = await api.get<CoverageAnalysisResponse>(
        ENDPOINTS.geography.coverageAnalysis(cityId)
      );
      return response.data;
    },
    {
      enabled: !!cityId,
    }
  );
}

// Get pricing matrix by city
export function usePricingMatrix(cityId: number) {
  return useApiQuery(
    serviceZonesKeys.pricingMatrix(cityId),
    async (): Promise<ServiceZone[]> => {
      const response = await api.get<ServiceZone[]>(ENDPOINTS.geography.pricingMatrix(cityId));
      return response.data;
    },
    {
      enabled: !!cityId,
    }
  );
}

// Get pricing stats
export function usePricingStats() {
  return useApiQuery(
    serviceZonesKeys.pricingStats(),
    async (): Promise<PricingStatsResponse> => {
      const response = await api.get<PricingStatsResponse>(ENDPOINTS.geography.pricingStats);
      return response.data;
    },
    {
      // Disable query until endpoint is implemented in backend
      enabled: false,
    }
  );
}

// ========== BULK OPERATIONS HOOKS ==========

// Bulk update status
export function useBulkUpdateStatus() {
  return useApiMutation(
    async (data: BulkStatusUpdateInput): Promise<BulkStatusUpdateResponse> => {
      const response = await api.post<BulkStatusUpdateResponse>(
        ENDPOINTS.geography.bulkUpdateStatus,
        data
      );
      return response.data;
    },
    {
      onSuccess: () => {
        invalidateQueries(['service-zones']);
      },
    }
  );
}

// Bulk update pricing
export function useBulkUpdatePricing() {
  return useApiMutation(
    async (data: BulkPricingUpdateInput): Promise<BulkStatusUpdateResponse> => {
      const response = await api.post<BulkStatusUpdateResponse>(
        ENDPOINTS.geography.bulkUpdatePricing,
        data
      );
      return response.data;
    },
    {
      onSuccess: () => {
        invalidateQueries(['service-zones']);
      },
    }
  );
}
