import { useApiQuery, useApiMutation } from '@/lib/api/react-query-client';
import { api } from '@/lib/api/api-client';
import { ENDPOINTS } from '@/lib/endpoints';
import type {
  FeatureFlag,
  FeatureFlagsListResponse,
  FeatureFlagsQueryParams,
  CreateFeatureFlagDto,
  UpdateFeatureFlagDto,
  ToggleFeatureFlagDto,
  FeatureFlagEvaluationDto,
  FeatureFlagEvaluationResultDto,
  CreateStandardFeatureFlagsDto,
  StandardFlagsResponse,
  BulkFeatureFlagUpdateDto,
  BulkFlagUpdateResponse,
  CategoriesOverviewResponse,
  RolloutStatusResponse,
  CacheStatsResponse,
  CacheWarmupResponse,
  CacheClearResponse,
  CacheClearKeyResponse,
  CacheCleanupResponse,
} from '../interfaces/config';

// Query Keys
export const featureFlagsKeys = {
  all: ['featureFlags'] as const,
  lists: () => [...featureFlagsKeys.all, 'list'] as const,
  list: (params: FeatureFlagsQueryParams) => [...featureFlagsKeys.lists(), params] as const,
  details: () => [...featureFlagsKeys.all, 'detail'] as const,
  detail: (id: number) => [...featureFlagsKeys.details(), id] as const,
  byKey: (key: string) => [...featureFlagsKeys.all, 'byKey', key] as const,
  analytics: () => [...featureFlagsKeys.all, 'analytics'] as const,
  cache: () => [...featureFlagsKeys.all, 'cache'] as const,
};

// Fetch feature flags list
export function useFeatureFlags(params: FeatureFlagsQueryParams = {}) {
  return useApiQuery(
    featureFlagsKeys.list(params),
    async (): Promise<FeatureFlagsListResponse> => {
      const response = await api.get<FeatureFlagsListResponse>(ENDPOINTS.config.featureFlags, {
        params: {
          page: params.page || 1,
          limit: params.limit || 20,
          category: params.category,
          isEnabled: params.isEnabled,
          isActive: params.isActive,
          search: params.search,
          sortBy: params.sortBy,
          sortOrder: params.sortOrder,
        },
      });
      return response.data;
    },
    {
      enabled: true,
    }
  );
}

// Get single feature flag by ID
export function useFeatureFlag(id: number) {
  return useApiQuery(
    featureFlagsKeys.detail(id),
    async (): Promise<FeatureFlag> => {
      const response = await api.get<FeatureFlag>(ENDPOINTS.config.featureFlagById(id));
      return response.data;
    },
    {
      enabled: !!id,
    }
  );
}

// Get feature flag by key
export function useFeatureFlagByKey(key: string) {
  return useApiQuery(
    featureFlagsKeys.byKey(key),
    async (): Promise<FeatureFlag> => {
      const response = await api.get<FeatureFlag>(ENDPOINTS.config.featureFlagByKey(key));
      return response.data;
    },
    {
      enabled: !!key,
    }
  );
}

// Create feature flag
export function useCreateFeatureFlag() {
  return useApiMutation(
    async (data: CreateFeatureFlagDto): Promise<FeatureFlag> => {
      const response = await api.post<FeatureFlag>(ENDPOINTS.config.featureFlags, data);
      return response.data;
    },
    {
      onSuccess: () => {
        // Invalidate feature flags list
      },
    }
  );
}

// Update feature flag
export function useUpdateFeatureFlag() {
  return useApiMutation(
    async ({ id, data }: { id: number; data: UpdateFeatureFlagDto }): Promise<FeatureFlag> => {
      const response = await api.patch<FeatureFlag>(ENDPOINTS.config.featureFlagById(id), data);
      return response.data;
    },
    {
      onSuccess: () => {
        // Invalidate feature flag detail and list
      },
    }
  );
}

// Delete feature flag
export function useDeleteFeatureFlag() {
  return useApiMutation(
    async (id: number): Promise<void> => {
      await api.delete<void>(ENDPOINTS.config.featureFlagById(id));
    },
    {
      onSuccess: () => {
        // Invalidate feature flags list
      },
    }
  );
}

// Toggle feature flag status
export function useToggleFeatureFlag() {
  return useApiMutation(
    async ({ id, data }: { id: number; data: ToggleFeatureFlagDto }): Promise<FeatureFlag> => {
      const response = await api.post<FeatureFlag>(ENDPOINTS.config.featureFlagToggle(id), data);
      return response.data;
    },
    {
      onSuccess: () => {
        // Invalidate feature flag detail and list
      },
    }
  );
}

// Evaluate feature flag
export function useEvaluateFeatureFlag() {
  return useApiMutation(
    async (data: FeatureFlagEvaluationDto): Promise<FeatureFlagEvaluationResultDto> => {
      const response = await api.post<FeatureFlagEvaluationResultDto>(ENDPOINTS.config.evaluateFlag, data);
      return response.data;
    }
  );
}

// Create standard feature flags
export function useCreateStandardFeatureFlags() {
  return useApiMutation(
    async (data: CreateStandardFeatureFlagsDto): Promise<StandardFlagsResponse> => {
      const response = await api.post<StandardFlagsResponse>(ENDPOINTS.config.createStandardFlags, data);
      return response.data;
    },
    {
      onSuccess: () => {
        // Invalidate feature flags list
      },
    }
  );
}

// Bulk update feature flags
export function useBulkUpdateFeatureFlags() {
  return useApiMutation(
    async (data: BulkFeatureFlagUpdateDto): Promise<BulkFlagUpdateResponse> => {
      const response = await api.post<BulkFlagUpdateResponse>(ENDPOINTS.config.bulkUpdateFlags, data);
      return response.data;
    },
    {
      onSuccess: () => {
        // Invalidate feature flags list
      },
    }
  );
}

// Get categories overview
export function useCategoriesOverview() {
  return useApiQuery(
    [...featureFlagsKeys.analytics(), 'categories'],
    async (): Promise<CategoriesOverviewResponse> => {
      const response = await api.get<CategoriesOverviewResponse>(ENDPOINTS.config.categoriesOverview);
      return response.data;
    },
    {
      enabled: true,
    }
  );
}

// Get rollout status
export function useRolloutStatus() {
  return useApiQuery(
    [...featureFlagsKeys.analytics(), 'rollout'],
    async (): Promise<RolloutStatusResponse> => {
      const response = await api.get<RolloutStatusResponse>(ENDPOINTS.config.rolloutStatus);
      return response.data;
    },
    {
      enabled: true,
    }
  );
}

// Get cache stats
export function useCacheStats() {
  return useApiQuery(
    featureFlagsKeys.cache(),
    async (): Promise<CacheStatsResponse> => {
      const response = await api.get<CacheStatsResponse>(ENDPOINTS.config.cache.stats);
      return response.data;
    },
    {
      enabled: true,
    }
  );
}

// Warm up cache
export function useWarmupCache() {
  return useApiMutation(
    async (): Promise<CacheWarmupResponse> => {
      const response = await api.post<CacheWarmupResponse>(ENDPOINTS.config.cache.warmup);
      return response.data;
    },
    {
      onSuccess: () => {
        // Invalidate cache stats
      },
    }
  );
}

// Clear all cache
export function useClearCache() {
  return useApiMutation(
    async (): Promise<CacheClearResponse> => {
      const response = await api.post<CacheClearResponse>(ENDPOINTS.config.cache.clear);
      return response.data;
    },
    {
      onSuccess: () => {
        // Invalidate cache stats
      },
    }
  );
}

// Clear cache for specific key
export function useClearCacheKey() {
  return useApiMutation(
    async (key: string): Promise<CacheClearKeyResponse> => {
      const response = await api.post<CacheClearKeyResponse>(ENDPOINTS.config.cache.clearKey(key));
      return response.data;
    },
    {
      onSuccess: () => {
        // Invalidate cache stats
      },
    }
  );
}

// Cleanup cache
export function useCleanupCache() {
  return useApiMutation(
    async (): Promise<CacheCleanupResponse> => {
      const response = await api.post<CacheCleanupResponse>(ENDPOINTS.config.cache.cleanup);
      return response.data;
    },
    {
      onSuccess: () => {
        // Invalidate cache stats
      },
    }
  );
}

// Public feature flag evaluation (no auth required)
export function usePublicEvaluateFeatureFlag() {
  return useApiMutation(
    async (data: FeatureFlagEvaluationDto): Promise<FeatureFlagEvaluationResultDto> => {
      const response = await api.post<FeatureFlagEvaluationResultDto>(ENDPOINTS.config.public.evaluate, data);
      return response.data;
    }
  );
}
