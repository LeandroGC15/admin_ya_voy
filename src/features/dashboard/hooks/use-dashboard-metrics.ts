import { useApiQuery } from '@/lib/api/react-query-client';
import { api } from '@/lib/api/api-client';
import { ENDPOINTS } from '@/lib/endpoints';
import { dashboardMetricsSchema, type DashboardMetrics } from '../schemas/dashboard-schemas';

// Fetch dashboard metrics hook
export function useDashboardMetrics() {
  return useApiQuery(
    ['dashboard', 'metrics'],
    async (): Promise<DashboardMetrics> => {
      try {
        const response = await api.get(ENDPOINTS.dashboard.metrics);
        if (!response || !response.data) {
          throw new Error('Invalid API response: no data received');
        }

        // According to API docs, metrics come wrapped in a "metrics" object
        const metricsData = (response.data as any).metrics || response.data;

        // Validate response data with Zod schema
        const validatedData = dashboardMetricsSchema.parse(metricsData);
        return validatedData;
      } catch (error: any) {
        console.error('Error fetching dashboard metrics:', error);
        throw error;
      }
    },
    {
      enabled: true,
      staleTime: 5 * 60 * 1000, // 5 minutes - metrics don't change that frequently
      cacheTime: 10 * 60 * 1000, // 10 minutes
    }
  );
}

// Hook to invalidate dashboard metrics (useful after mutations)
export function invalidateDashboardMetrics() {
  // This will be called from react-query-client
  // Implementation will be handled by the component when needed
}
