import { useApiQuery } from '@/lib/api/react-query-client';
import { ENDPOINTS } from '@/lib/endpoints';

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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${ENDPOINTS.legacy.users}?limit=1`);
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
