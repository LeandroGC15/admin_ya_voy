import { useApiQuery } from '@/lib/api/react-query-client';
import { api } from '@/lib/api/api-client';
import { ENDPOINTS } from '@/lib/endpoints';
import type { ApiKeysResponse } from '../interfaces/config';

// Query Keys
export const configOperationsKeys = {
  all: ['configOperations'] as const,
  apiKeysByService: (service: string, environment: string) =>
    [...configOperationsKeys.all, 'apiKeysByService', service, environment] as const,
};

// Get API keys by service and environment
export function useApiKeysByService(service: string, environment: string) {
  return useApiQuery(
    configOperationsKeys.apiKeysByService(service, environment),
    async (): Promise<ApiKeysResponse> => {
      const response = await api.get<ApiKeysResponse>(
        ENDPOINTS.config.apiKeyService(service, environment)
      );
      return response.data;
    },
    {
      enabled: !!service && !!environment,
    }
  );
}

// Combined hook for config dashboard data
export function useConfigDashboard() {
  // This could be expanded to fetch multiple config-related data
  // For now, it's a placeholder for future dashboard needs
  return {
    // Could include multiple queries here
  };
}
