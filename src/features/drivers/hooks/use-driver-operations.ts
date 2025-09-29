import { useApiQuery, useApiMutation } from '@/lib/api/react-query-client';
import { ENDPOINTS } from '@/lib/endpoints';
import type { Driver } from '../schemas/driver-schemas';

export interface DriverSearchCriteria {
  firstName?: string;
  lastName?: string;
  email?: string;
  licensePlate?: string;
  carModel?: string;
}

// Query Keys
export const driverOperationsKeys = {
  all: ['driverOperations'] as const,
  search: (criteria: DriverSearchCriteria) => [...driverOperationsKeys.all, 'search', criteria] as const,
  byId: (id: string | number) => [...driverOperationsKeys.all, 'byId', id] as const,
};

// Hook para buscar conductores por criterios (usando API legacy)
export function useDriverSearch(criteria: DriverSearchCriteria, enabled: boolean = true) {
  return useApiQuery(
    driverOperationsKeys.search(criteria),
    async (): Promise<Driver[]> => {
      const params = new URLSearchParams();

      if (criteria.firstName) params.append('firstName', criteria.firstName);
      if (criteria.lastName) params.append('lastName', criteria.lastName);
      if (criteria.email) params.append('email', criteria.email);
      if (criteria.licensePlate) params.append('licensePlate', criteria.licensePlate);
      if (criteria.carModel) params.append('carModel', criteria.carModel);

      const queryString = params.toString();
      const url = `${ENDPOINTS.legacy.drivers}${queryString ? `?${queryString}` : ''}`;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${url}`);

      if (!response.ok) {
        throw new Error('Failed to search drivers');
      }

      const data = await response.json();
      return data.data?.data || [];
    },
    {
      enabled,
      staleTime: 2 * 60 * 1000, // 2 minutes
      refetchOnWindowFocus: false,
    }
  );
}

// Hook para obtener conductor por ID (usando API legacy)
export function useDriverByIdLegacy(driverId: string | number, enabled: boolean = true) {
  return useApiQuery(
    driverOperationsKeys.byId(driverId),
    async (): Promise<Driver | null> => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${ENDPOINTS.legacy.driverById(driverId)}`);

      if (!response.ok) {
        throw new Error('Failed to fetch driver');
      }

      const data = await response.json();
      return data.data || null;
    },
    {
      enabled: !!driverId && enabled,
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    }
  );
}

// Hook para actualizar estado de conductor (usando API legacy)
export function useUpdateDriverStatusLegacy() {
  return useApiMutation(
    async ({
      driverId,
      status
    }: {
      driverId: string | number;
      status: string
    }) => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${ENDPOINTS.legacy.driverStatus(driverId)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error('Failed to update driver status');
      }

      return response.json();
    }
  );
}
