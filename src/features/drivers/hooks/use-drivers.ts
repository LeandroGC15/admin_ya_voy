import { useApiQuery, useApiMutation, createQueryKey } from '@/lib/api/react-query-client';
import { api } from '@/lib/api/api-client';
import { ENDPOINTS } from '@/lib/endpoints';
import type {
  Driver,
  CreateDriverInput,
  SearchDriversInput,
  DriverListResponse,
  DriverDetailResponse,
  DriversData
} from '../schemas/driver-schemas';


// Fetch drivers hook
export function useDrivers(params: SearchDriversInput = {}) {
  return useApiQuery(
    ['drivers', 'list', params],
    async (): Promise<DriverListResponse> => {
      const response = await api.get<DriverListResponse>(ENDPOINTS.drivers.base, {
        params: {
          page: params.page || 1,
          limit: params.limit || 10,
          search: params.search,
          status: params.status,
          verificationStatus: params.verificationStatus,
        },
      });
      if (!response || !response.data) {
        throw new Error('Invalid API response: no data received');
      }
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

// Create driver hook
export function useCreateDriver() {
  return useApiMutation(
    async (driverData: CreateDriverInput): Promise<Driver> => {
      const response = await api.post<Driver>(ENDPOINTS.drivers.register, driverData);
      if (!response || !response.data) {
        throw new Error('Invalid API response: no data received');
      }
      if (!response || !response.data) {
        throw new Error('Invalid API response: no data received');
      }
      return response.data;
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
    async ({ driverId, reason, permanent = false }: { 
      driverId: string; 
      reason: string; 
      permanent?: boolean;
    }): Promise<{
      success: boolean;
      message: string;
      driverId: number;
      permanent: boolean;
      reason: string;
    }> => {
      const response = await api.delete<{
        success: boolean;
        message: string;
        driverId: number;
        permanent: boolean;
        reason: string;
      }>(ENDPOINTS.drivers.byId(driverId), {
        reason,
        permanent,
      });
      if (!response || !response.data) {
        throw new Error('Invalid API response: no data received');
      }
      return response.data;
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
    ['drivers', 'detail', driverId],
    async (): Promise<DriverDetailResponse> => {
      const response = await api.get<DriverDetailResponse>(ENDPOINTS.drivers.byId(driverId));
      if (!response || !response.data) {
        throw new Error('Invalid API response: no data received');
      }
      return response.data;
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
      const response = await api.patch<Driver>(ENDPOINTS.drivers.status(driverId), { status });
      if (!response || !response.data) {
        throw new Error('Invalid API response: no data received');
      }
      return response.data;
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
      const response = await api.put<Driver>(ENDPOINTS.drivers.verification(driverId), { verificationStatus });
      if (!response || !response.data) {
        throw new Error('Invalid API response: no data received');
      }
      return response.data;
    },
    {
      onSuccess: (updatedDriver) => {
        // Invalidate and refetch driver and drivers list
        // This will be handled by the component using the hook
      },
    }
  );
}
