import { useApiQuery } from '@/lib/api/react-query-client';
import { api } from '@/lib/api/api-client';
import { ENDPOINTS } from '@/lib/endpoints';

export interface RideData {
  id: number;
  name: string;
  email: string;
  amount: string;
  type: "user" | "driver";
}

// Hook for fetching recent rides
export function useRecentRides(viewType: 'users' | 'drivers' = 'users', limit: number = 20) {
  return useApiQuery(
    ['dashboard', 'recent-rides', viewType, limit],
    async (): Promise<RideData[]> => {
      try {
        // Use the existing /admin/rides endpoint instead of the non-existent recent-rides endpoint
        const response = await api.get(ENDPOINTS.rides.base, {
          params: {
            limit,
            page: 1,
            // Filter by payment status to get completed rides for drivers view
            ...(viewType === 'drivers' && { paymentStatus: 'paid' })
          }
        });

        if (!response || !response.data) {
          throw new Error('Invalid API response: no data received');
        }

        // The response has format { success: true, data: [...], meta: {...} }
        const rides = (response.data as any).data || [];

        // Transform the rides data to the expected format
        return rides.slice(0, limit).map((ride: any) => {
          if (viewType === 'users') {
            return {
              id: ride.rideId || ride.id,
              name: ride.user?.name || 'Usuario desconocido',
              email: ride.driver?.firstName ? `${ride.driver.firstName} ${ride.driver.lastName}` : 'Pendiente',
              amount: `+$${parseFloat(ride.farePrice || ride.totalPrice || 0).toFixed(2)}`,
              type: 'user' as const,
            };
          } else {
            return {
              id: ride.rideId || ride.id,
              name: ride.driver ? `${ride.driver.firstName} ${ride.driver.lastName}` : 'Conductor desconocido',
              email: ride.user?.name ? `Usuario: ${ride.user.name}` : `Usuario #${ride.userId}`,
              amount: `+$${parseFloat(ride.farePrice || ride.totalPrice || 0).toFixed(2)}`,
              type: 'driver' as const,
            };
          }
        });
      } catch (error: any) {
        console.error('Error fetching recent rides:', error);
        throw error;
      }
    },
    {
      enabled: true,
      staleTime: 30 * 1000, // 30 seconds - rides change more frequently than metrics
      cacheTime: 5 * 60 * 1000, // 5 minutes
    }
  );
}
