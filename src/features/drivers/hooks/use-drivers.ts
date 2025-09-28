import { useApiQuery, useApiMutation, createQueryKey } from '@/lib/api/react-query-client';
import { api } from '@/lib/api/api-client';
import type {
  Driver,
  CreateDriverInput,
  SearchDriversInput,
  DriverListResponse,
  DriversData
} from '../schemas/driver-schemas';

// Query Keys
export const driverKeys = {
  all: ['drivers'] as const,
  lists: () => [...driverKeys.all, 'list'] as const,
  list: (params: SearchDriversInput) => [...driverKeys.lists(), params] as const,
  details: () => [...driverKeys.all, 'detail'] as const,
  detail: (id: number) => [...driverKeys.details(), id] as const,
};

// Fetch drivers hook
export function useDrivers(params: SearchDriversInput = {}) {
  return useApiQuery(
    driverKeys.list(params),
    async (): Promise<DriverListResponse> => {
      const response = await api.get<DriverListResponse>('api/driver', {
        params: {
          page: params.page || 1,
          limit: params.limit || 10,
          search: params.search,
          status: params.status,
          verificationStatus: params.verificationStatus,
        },
      });
      return response;
    },
    {
      enabled: true,
    }
  );
}

// Create driver hook
export function useCreateDriver() {
  return useApiMutation(
    async (driverData: CreateDriverInput): Promise<Driver> => {
      const response = await api.post<Driver>('api/driver/register', driverData);
      return response;
    },
    {
      onSuccess: (newDriver) => {
        // Invalidate and refetch drivers list
        // This will be handled by the component using the hook
      },
    }
  );
}

// Delete driver hook
export function useDeleteDriver() {
  return useApiMutation(
    async (driverId: string): Promise<void> => {
      await api.delete<void>(`admin/drivers/${driverId}`);
    },
    {
      onSuccess: () => {
        // Invalidate and refetch drivers list
        // This will be handled by the component using the hook
      },
    }
  );
}

// Get driver by ID hook
export function useDriver(driverId: number) {
  return useApiQuery(
    driverKeys.detail(driverId),
    async (): Promise<Driver> => {
      const response = await api.get<Driver>(`admin/drivers/${driverId}`);
      return response;
    },
    {
      enabled: !!driverId,
    }
  );
}

// Update driver status hook
export function useUpdateDriverStatus() {
  return useApiMutation(
    async ({ driverId, status }: { driverId: number; status: string }): Promise<Driver> => {
      const response = await api.patch<Driver>(`admin/drivers/${driverId}/status`, { status });
      return response;
    },
    {
      onSuccess: (updatedDriver) => {
        // Invalidate and refetch driver and drivers list
        // This will be handled by the component using the hook
      },
    }
  );
}

// Update driver verification status hook
export function useUpdateDriverVerification() {
  return useApiMutation(
    async ({ driverId, verificationStatus }: { driverId: number; verificationStatus: string }): Promise<Driver> => {
      const response = await api.patch<Driver>(`admin/drivers/${driverId}/verification`, { verificationStatus });
      return response;
    },
    {
      onSuccess: (updatedDriver) => {
        // Invalidate and refetch driver and drivers list
        // This will be handled by the component using the hook
      },
    }
  );
}
