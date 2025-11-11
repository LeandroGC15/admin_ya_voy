import { useApiQuery } from '@/lib/api/react-query-client';
import { ENDPOINTS, getFullEndpoint } from '@/lib/endpoints';

// Query Keys
export const userStatsKeys = {
  all: ['userStats'] as const,
  total: () => [...userStatsKeys.all, 'total'] as const,
};

// Hook para obtener estadísticas de usuarios
export function useUserStats() {
  return useApiQuery(
    userStatsKeys.total(),
    async (): Promise<{ total: number }> => {
      // Obtener solo el primer usuario para saber el total
      // Nota: legacy.users usa formato 'api/user', necesitamos construir la URL completa con versión
      const response = await fetch(`${getFullEndpoint(ENDPOINTS.legacy.users, 'v1')}?limit=1`);
      const data = await response.json();

      // La respuesta tiene estructura {data: {pagination: {total: number}}}
      return {
        total: data.data?.pagination?.total || 0
      };
    },
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    }
  );
}
