import { useApiQuery, useApiMutation, invalidateQueries } from '@/lib/api/react-query-client';
import { api } from '@/lib/api/api-client';
import { ENDPOINTS } from '@/lib/endpoints';
import type {
  ApiKey,
  ApiKeysListResponse,
  DecryptedApiKeyResponse,
  ApiKeysByServiceResponse,
  RotationValidationResponse,
  RotationAuditHistoryResponse,
  BulkUpdateResponse,
  StandardKeysResponse,
  ApiKeysAnalyticsResponse,
  RotationStatsResponse,
  BulkRotationResponse,
  CreateApiKeyInput,
  UpdateApiKeyInput,
  ToggleApiKeyInput,
  RotateApiKeyInput,
  ForceRotateApiKeyInput,
  BulkUpdateApiKeysInput,
  CreateStandardApiKeysInput,
  SearchApiKeysInput,
  RotationAuditHistoryInput,
} from '../schemas/api-keys.schemas';

// Query Keys
export const apiKeysKeys = {
  all: ['apiKeys'] as const,
  lists: () => [...apiKeysKeys.all, 'list'] as const,
  list: (params: SearchApiKeysInput) => [...apiKeysKeys.lists(), params] as const,
  details: () => [...apiKeysKeys.all, 'detail'] as const,
  detail: (id: number) => [...apiKeysKeys.details(), id] as const,
  analytics: () => [...apiKeysKeys.all, 'analytics'] as const,
  rotation: () => [...apiKeysKeys.all, 'rotation'] as const,
};

// Fetch API keys list
export function useApiKeys(params: SearchApiKeysInput = {}) {
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


// Create API key
export function useCreateApiKey() {
  return useApiMutation(
    async (data: CreateApiKeyInput): Promise<ApiKey> => {
      const response = await api.post<ApiKey>(ENDPOINTS.config.apiKeys, data);
      if (!response || !response.data) {
        throw new Error('Invalid API response: no data received');
      }
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
    async ({ id, data }: { id: number; data: UpdateApiKeyInput }): Promise<ApiKey> => {
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
    async ({ id, data }: { id: number; data: ToggleApiKeyInput }): Promise<ApiKey> => {
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
    async ({ id, data }: { id: number; data?: RotateApiKeyInput }): Promise<ApiKey> => {
      const response = await api.post<ApiKey>(ENDPOINTS.config.apiKeyRotate(id), data);
      return response.data;
    },
    {
      onSuccess: () => {
        invalidateQueries(['apiKeys']);
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


// Force rotate API key
export function useForceRotateApiKey() {
  return useApiMutation(
    async ({ id, data }: { id: number; data: ForceRotateApiKeyInput }): Promise<ApiKey> => {
      const response = await api.post<ApiKey>(ENDPOINTS.config.apiKeyForceRotate(id), data);
      return response.data;
    },
    {
      onSuccess: () => {
        invalidateQueries(['apiKeys']);
      },
    }
  );
}

// Get single API key
export function useApiKey(id: number) {
  return useApiQuery(
    apiKeysKeys.detail(id),
    async (): Promise<ApiKey> => {
      const response = await api.get<ApiKey>(ENDPOINTS.config.apiKeyById(id));
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

// Decrypt API key
export function useDecryptApiKey() {
  return useApiMutation(
    async (id: number): Promise<DecryptedApiKeyResponse> => {
      const response = await api.get<DecryptedApiKeyResponse>(ENDPOINTS.config.apiKeyDecrypt(id));
      return response.data;
    }
  );
}

// Bulk update API keys
export function useBulkUpdateApiKeys() {
  return useApiMutation(
    async (data: BulkUpdateApiKeysInput): Promise<BulkUpdateResponse> => {
      const response = await api.post<BulkUpdateResponse>(ENDPOINTS.config.bulkUpdateKeys, data);
      return response.data;
    },
    {
      onSuccess: () => {
        invalidateQueries(['apiKeys']);
      },
    }
  );
}

// Create standard API keys
export function useCreateStandardApiKeys() {
  return useApiMutation(
    async (data: CreateStandardApiKeysInput): Promise<StandardKeysResponse> => {
      const response = await api.post<StandardKeysResponse>(ENDPOINTS.config.standardKeys, data);
      return response.data;
    },
    {
      onSuccess: () => {
        invalidateQueries(['apiKeys']);
      },
    }
  );
}

// Get API keys by service and environment
export function useApiKeysByService(service: string, environment: string) {
  return useApiQuery(
    ['apiKeys', 'byService', service, environment],
    async (): Promise<ApiKeysByServiceResponse> => {
      const response = await api.get<ApiKeysByServiceResponse>(
        ENDPOINTS.config.apiKeyService(service, environment)
      );
      return response.data;
    },
    {
      enabled: !!service && !!environment,
    }
  );
}

// Check if API key needs rotation
export function useApiKeyRotationValidation(id: number) {
  return useApiQuery(
    ['apiKeys', 'rotationValidation', id],
    async (): Promise<RotationValidationResponse> => {
      const response = await api.get<RotationValidationResponse>(
        ENDPOINTS.config.apiKeyRotationValidation(id)
      );
      return response.data;
    },
    {
      enabled: !!id,
    }
  );
}

// Get rotation audit history
export function useApiKeysRotationAuditHistory(params: RotationAuditHistoryInput = {}) {
  return useApiQuery(
    ['apiKeys', 'rotationAuditHistory', params],
    async (): Promise<RotationAuditHistoryResponse> => {
      const response = await api.get<RotationAuditHistoryResponse>(
        ENDPOINTS.config.analytics.auditHistory,
        {
          params: {
            limit: params.limit || 50,
            service: params.service,
          },
        }
      );
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
        invalidateQueries(['apiKeys']);
      },
    }
  );
}

