import { useApiQuery, useApiMutation } from '@/lib/api/react-query-client';
import { api } from '@/lib/api/api-client';
import { ENDPOINTS } from '@/lib/endpoints';
import type {
  ApiKey,
  ApiKeysListResponse,
  ApiKeysQueryParams,
  CreateApiKeyDto,
  UpdateApiKeyDto,
  ToggleApiKeyDto,
  RotateApiKeyDto,
  BulkApiKeyUpdateDto,
  BulkUpdateResponse,
  CreateStandardApiKeysDto,
  StandardKeysResponse,
  ApiKeysAnalyticsResponse,
  RotationStatsResponse,
  BulkRotationResponse,
} from '../interfaces/config';

// Query Keys
export const apiKeysKeys = {
  all: ['apiKeys'] as const,
  lists: () => [...apiKeysKeys.all, 'list'] as const,
  list: (params: ApiKeysQueryParams) => [...apiKeysKeys.lists(), params] as const,
  details: () => [...apiKeysKeys.all, 'detail'] as const,
  detail: (id: number) => [...apiKeysKeys.details(), id] as const,
  analytics: () => [...apiKeysKeys.all, 'analytics'] as const,
  rotation: () => [...apiKeysKeys.all, 'rotation'] as const,
};

// Fetch API keys list
export function useApiKeys(params: ApiKeysQueryParams = {}) {
  return useApiQuery(
    apiKeysKeys.list(params),
    async (): Promise<ApiKeysListResponse> => {
      const response = await api.get<ApiKeysListResponse>(ENDPOINTS.config.apiKeys, {
        params: {
          page: params.page || 1,
          limit: params.limit || 20,
          service: params.service,
          environment: params.environment,
          keyType: params.keyType,
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

// Get single API key
export function useApiKey(id: number) {
  return useApiQuery(
    apiKeysKeys.detail(id),
    async (): Promise<ApiKey> => {
      const response = await api.get<ApiKey>(ENDPOINTS.config.apiKeyById(id));
      return response.data;
    },
    {
      enabled: !!id,
    }
  );
}

// Create API key
export function useCreateApiKey() {
  return useApiMutation(
    async (data: CreateApiKeyDto): Promise<ApiKey> => {
      const response = await api.post<ApiKey>(ENDPOINTS.config.apiKeys, data);
      return response.data;
    },
    {
      onSuccess: () => {
        // Invalidate API keys list
      },
    }
  );
}

// Update API key
export function useUpdateApiKey() {
  return useApiMutation(
    async ({ id, data }: { id: number; data: UpdateApiKeyDto }): Promise<ApiKey> => {
      const response = await api.patch<ApiKey>(ENDPOINTS.config.apiKeyById(id), data);
      return response.data;
    },
    {
      onSuccess: () => {
        // Invalidate API key detail and list
      },
    }
  );
}

// Delete API key
export function useDeleteApiKey() {
  return useApiMutation(
    async (id: number): Promise<void> => {
      await api.delete<void>(ENDPOINTS.config.apiKeyById(id));
    },
    {
      onSuccess: () => {
        // Invalidate API keys list
      },
    }
  );
}

// Toggle API key status
export function useToggleApiKey() {
  return useApiMutation(
    async ({ id, data }: { id: number; data: ToggleApiKeyDto }): Promise<ApiKey> => {
      const response = await api.post<ApiKey>(ENDPOINTS.config.apiKeyToggle(id), data);
      return response.data;
    },
    {
      onSuccess: () => {
        // Invalidate API key detail and list
      },
    }
  );
}

// Rotate API key
export function useRotateApiKey() {
  return useApiMutation(
    async ({ id, data }: { id: number; data?: RotateApiKeyDto }): Promise<ApiKey> => {
      const response = await api.post<ApiKey>(ENDPOINTS.config.apiKeyRotate(id), data);
      return response.data;
    },
    {
      onSuccess: () => {
        // Invalidate API key detail and list
      },
    }
  );
}

// Decrypt API key
export function useDecryptApiKey() {
  return useApiMutation(
    async (id: number): Promise<{ decryptedKey: string }> => {
      const response = await api.get<{ decryptedKey: string }>(ENDPOINTS.config.apiKeyDecrypt(id));
      return response.data;
    }
  );
}

// Bulk update API keys
export function useBulkUpdateApiKeys() {
  return useApiMutation(
    async (data: BulkApiKeyUpdateDto): Promise<BulkUpdateResponse> => {
      const response = await api.post<BulkUpdateResponse>(ENDPOINTS.config.bulkUpdateKeys, data);
      return response.data;
    },
    {
      onSuccess: () => {
        // Invalidate API keys list
      },
    }
  );
}

// Create standard API keys
export function useCreateStandardApiKeys() {
  return useApiMutation(
    async (data: CreateStandardApiKeysDto): Promise<StandardKeysResponse> => {
      const response = await api.post<StandardKeysResponse>(ENDPOINTS.config.standardKeys, data);
      return response.data;
    },
    {
      onSuccess: () => {
        // Invalidate API keys list
      },
    }
  );
}

// Get API keys analytics
export function useApiKeysAnalytics() {
  return useApiQuery(
    apiKeysKeys.analytics(),
    async (): Promise<ApiKeysAnalyticsResponse> => {
      const response = await api.get<ApiKeysAnalyticsResponse>(ENDPOINTS.config.analytics.overview);
      return response.data;
    },
    {
      enabled: true,
    }
  );
}

// Get rotation stats
export function useRotationStats() {
  return useApiQuery(
    apiKeysKeys.rotation(),
    async (): Promise<RotationStatsResponse> => {
      const response = await api.get<RotationStatsResponse>(ENDPOINTS.config.analytics.rotationStats);
      return response.data;
    },
    {
      enabled: true,
    }
  );
}

// Bulk rotate API keys
export function useBulkRotateApiKeys() {
  return useApiMutation(
    async (): Promise<BulkRotationResponse> => {
      const response = await api.post<BulkRotationResponse>(ENDPOINTS.config.analytics.bulkRotate);
      return response.data;
    },
    {
      onSuccess: () => {
        // Invalidate API keys list and rotation stats
      },
    }
  );
}
