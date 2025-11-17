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
        data: {
          reason,
          permanent,
        }
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

// Update driver basic information hook
export function useUpdateDriver() {
  return useApiMutation(
    async ({ driverId, data }: { driverId: number; data: Partial<Driver> }): Promise<Driver> => {
      const response = await api.put<Driver>(ENDPOINTS.drivers.byId(driverId), data);
      if (!response || !response.data) {
        throw new Error('Invalid API response: no data received');
      }
      return response.data;
    },
    {
      onSuccess: () => {
        // Invalidate and refetch driver and drivers list
        // This will be handled by the component using the hook
      },
    }
  );
}

// Send notification to driver hook
export function useSendDriverNotification() {
  return useApiMutation(
    async ({ driverId, title, message, type, data }: { 
      driverId: number; 
      title: string; 
      message: string; 
      type?: string;
      data?: any;
    }): Promise<any> => {
      const response = await api.post<any>(ENDPOINTS.drivers.notifications(driverId), {
        title,
        message,
        type,
        data,
      });
      if (!response || !response.data) {
        throw new Error('Invalid API response: no data received');
      }
      return response.data;
    }
  );
}

// Get driver audit history hook
export function useDriverAuditHistory(driverId: number, page: number = 1, limit: number = 20) {
  return useApiQuery(
    ['drivers', 'audit-history', driverId, page, limit],
    async (): Promise<any> => {
      const response = await api.get<any>(ENDPOINTS.drivers.auditHistory(driverId), {
        params: { page, limit },
      });
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

// Reassign driver rides hook
export function useReassignDriverRides() {
  return useApiMutation(
    async ({ driverId, reassignToDriverId, cancelRides, reason }: { 
      driverId: number; 
      reassignToDriverId?: number;
      cancelRides?: boolean;
      reason: string;
    }): Promise<any> => {
      const response = await api.post<any>(ENDPOINTS.drivers.reassignRides(driverId), {
        reassignToDriverId,
        cancelRides,
        reason,
      });
      if (!response || !response.data) {
        throw new Error('Invalid API response: no data received');
      }
      return response.data;
    }
  );
}

// Driver documents hooks
export function useUploadDriverDocument() {
  return useApiMutation(
    async ({ driverId, documentType, documentUrl }: { 
      driverId: number; 
      documentType: string; 
      documentUrl: string;
    }): Promise<any> => {
      const response = await api.post<any>(ENDPOINTS.drivers.documents.base(driverId), {
        documentType,
        documentUrl,
      });
      if (!response || !response.data) {
        throw new Error('Invalid API response: no data received');
      }
      return response.data;
    }
  );
}

export function useUpdateDriverDocument() {
  return useApiMutation(
    async ({ driverId, documentId, data }: { 
      driverId: number; 
      documentId: number; 
      data: Partial<{ documentType: string; documentUrl: string }>;
    }): Promise<any> => {
      const response = await api.put<any>(ENDPOINTS.drivers.documents.byId(driverId, documentId), data);
      if (!response || !response.data) {
        throw new Error('Invalid API response: no data received');
      }
      return response.data;
    }
  );
}

export function useDeleteDriverDocument() {
  return useApiMutation(
    async ({ driverId, documentId }: { driverId: number; documentId: number }): Promise<any> => {
      const response = await api.delete<any>(ENDPOINTS.drivers.documents.byId(driverId, documentId));
      if (!response || !response.data) {
        throw new Error('Invalid API response: no data received');
      }
      return response.data;
    }
  );
}

// Vehicle hooks
export function useCreateVehicle() {
  return useApiMutation(
    async ({ driverId, vehicleData }: { 
      driverId: number; 
      vehicleData: any;
    }): Promise<any> => {
      const response = await api.post<any>(ENDPOINTS.drivers.vehicles.base(driverId), vehicleData);
      if (!response || !response.data) {
        throw new Error('Invalid API response: no data received');
      }
      return response.data;
    }
  );
}

export function useUpdateVehicle() {
  return useApiMutation(
    async ({ driverId, vehicleId, vehicleData }: { 
      driverId: number; 
      vehicleId: number; 
      vehicleData: any;
    }): Promise<any> => {
      const response = await api.put<any>(ENDPOINTS.drivers.vehicles.byId(driverId, vehicleId), vehicleData);
      if (!response || !response.data) {
        throw new Error('Invalid API response: no data received');
      }
      return response.data;
    }
  );
}

export function useDeleteVehicle() {
  return useApiMutation(
    async ({ driverId, vehicleId }: { driverId: number; vehicleId: number }): Promise<any> => {
      const response = await api.delete<any>(ENDPOINTS.drivers.vehicles.byId(driverId, vehicleId));
      if (!response || !response.data) {
        throw new Error('Invalid API response: no data received');
      }
      return response.data;
    }
  );
}

export function useSetDefaultVehicle() {
  return useApiMutation(
    async ({ driverId, vehicleId }: { driverId: number; vehicleId: number }): Promise<any> => {
      const response = await api.put<any>(ENDPOINTS.drivers.vehicles.setDefault(driverId, vehicleId));
      if (!response || !response.data) {
        throw new Error('Invalid API response: no data received');
      }
      return response.data;
    }
  );
}

// Vehicle document hooks
export function useUploadVehicleDocument() {
  return useApiMutation(
    async ({ driverId, vehicleId, documentType, documentUrl }: { 
      driverId: number; 
      vehicleId: number;
      documentType: string; 
      documentUrl: string;
    }): Promise<any> => {
      const response = await api.post<any>(ENDPOINTS.drivers.vehicles.documents.base(driverId, vehicleId), {
        documentType,
        documentUrl,
      });
      if (!response || !response.data) {
        throw new Error('Invalid API response: no data received');
      }
      return response.data;
    }
  );
}

export function useUpdateVehicleDocument() {
  return useApiMutation(
    async ({ driverId, vehicleId, documentId, data }: { 
      driverId: number; 
      vehicleId: number;
      documentId: number; 
      data: Partial<{ documentType: string; documentUrl: string }>;
    }): Promise<any> => {
      const response = await api.put<any>(ENDPOINTS.drivers.vehicles.documents.byId(driverId, vehicleId, documentId), data);
      if (!response || !response.data) {
        throw new Error('Invalid API response: no data received');
      }
      return response.data;
    }
  );
}

export function useDeleteVehicleDocument() {
  return useApiMutation(
    async ({ driverId, vehicleId, documentId }: { 
      driverId: number; 
      vehicleId: number;
      documentId: number;
    }): Promise<any> => {
      const response = await api.delete<any>(ENDPOINTS.drivers.vehicles.documents.byId(driverId, vehicleId, documentId));
      if (!response || !response.data) {
        throw new Error('Invalid API response: no data received');
      }
      return response.data;
    }
  );
}
