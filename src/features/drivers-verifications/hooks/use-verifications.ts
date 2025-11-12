import { useApiQuery, useApiMutation } from '@/lib/api/react-query-client';
import { useQueryClient } from '@tanstack/react-query';
import {
  getOnboardingDrivers,
  getDriverOnboardingDetails,
  getOnboardingStats,
  getStatsByStage,
  getStatsByVehicleType,
  getPendingDocuments,
  getDocumentDetails,
  verifyDocument,
  rejectDocument,
  bulkVerifyDocuments,
  getPendingVehicles,
  getVehicleDetails,
  verifyVehicle,
  rejectVehicle,
  verifyVehicleDocument,
  bulkVerifyVehicles,
  approveDriver,
  getVerificationHistory,
} from '../services/verifications.service';
import type {
  GetOnboardingDriversQuery,
  OnboardingDriversListResponse,
  OnboardingDriverResponse,
  OnboardingStatsResponse,
  GetPendingDocumentsQuery,
  DocumentVerificationResponse,
  PendingDocumentsListResponse,
  VerifyDocumentRequest,
  BulkVerifyDocumentsRequest,
  GetPendingVehiclesQuery,
  VehicleVerificationResponse,
  PendingVehiclesListResponse,
  VerifyVehicleRequest,
  VerifyVehicleDocumentRequest,
  BulkVerifyVehiclesRequest,
  ApproveDriverRequest,
  VerificationHistoryItem,
} from '../interfaces/verifications';

// Query hooks
export function useOnboardingDrivers(query: GetOnboardingDriversQuery = {}) {
  return useApiQuery(
    ['drivers-verifications', 'onboarding', 'list', query],
    () => getOnboardingDrivers(query),
    {
      enabled: true,
      staleTime: 2 * 60 * 1000, // 2 minutes
    }
  );
}

export function useDriverOnboardingDetails(driverId: string | number | null) {
  return useApiQuery(
    ['drivers-verifications', 'onboarding', 'detail', driverId],
    () => {
      if (!driverId) throw new Error('Driver ID is required');
      return getDriverOnboardingDetails(driverId);
    },
    {
      enabled: !!driverId,
      staleTime: 2 * 60 * 1000,
    }
  );
}

export function useOnboardingStats(dateFrom?: string, dateTo?: string) {
  return useApiQuery(
    ['drivers-verifications', 'stats', dateFrom, dateTo],
    () => getOnboardingStats(dateFrom, dateTo),
    {
      enabled: true,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );
}

export function useStatsByStage() {
  return useApiQuery(
    ['drivers-verifications', 'stats', 'by-stage'],
    () => getStatsByStage(),
    {
      enabled: true,
      staleTime: 5 * 60 * 1000,
    }
  );
}

export function useStatsByVehicleType() {
  return useApiQuery(
    ['drivers-verifications', 'stats', 'by-vehicle-type'],
    () => getStatsByVehicleType(),
    {
      enabled: true,
      staleTime: 5 * 60 * 1000,
    }
  );
}

export function usePendingDocuments(query: GetPendingDocumentsQuery = {}) {
  return useApiQuery(
    ['drivers-verifications', 'documents', 'pending', query],
    () => getPendingDocuments(query),
    {
      enabled: true,
      staleTime: 2 * 60 * 1000,
    }
  );
}

export function useDocumentDetails(documentId: string | number | null) {
  return useApiQuery(
    ['drivers-verifications', 'documents', 'detail', documentId],
    () => {
      if (!documentId) throw new Error('Document ID is required');
      return getDocumentDetails(documentId);
    },
    {
      enabled: !!documentId,
      staleTime: 2 * 60 * 1000,
    }
  );
}

export function usePendingVehicles(query: GetPendingVehiclesQuery = {}) {
  return useApiQuery(
    ['drivers-verifications', 'vehicles', 'pending', query],
    () => getPendingVehicles(query),
    {
      enabled: true,
      staleTime: 2 * 60 * 1000,
    }
  );
}

export function useVehicleDetails(vehicleId: string | number | null) {
  return useApiQuery(
    ['drivers-verifications', 'vehicles', 'detail', vehicleId],
    () => {
      if (!vehicleId) throw new Error('Vehicle ID is required');
      return getVehicleDetails(vehicleId);
    },
    {
      enabled: !!vehicleId,
      staleTime: 2 * 60 * 1000,
    }
  );
}

export function useVerificationHistory(driverId: string | number | null) {
  return useApiQuery(
    ['drivers-verifications', 'history', driverId],
    () => {
      if (!driverId) throw new Error('Driver ID is required');
      return getVerificationHistory(driverId);
    },
    {
      enabled: !!driverId,
      staleTime: 2 * 60 * 1000,
    }
  );
}

// Mutation hooks
export function useVerifyDocument() {
  const queryClient = useQueryClient();

  return useApiMutation(
    ({ documentId, data }: { documentId: string | number; data: VerifyDocumentRequest }) =>
      verifyDocument(documentId, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['drivers-verifications', 'documents'] });
        queryClient.invalidateQueries({ queryKey: ['drivers-verifications', 'onboarding'] });
        queryClient.invalidateQueries({ queryKey: ['drivers-verifications', 'stats'] });
      },
    }
  );
}

export function useRejectDocument() {
  const queryClient = useQueryClient();

  return useApiMutation(
    ({ documentId, data }: { documentId: string | number; data: VerifyDocumentRequest }) =>
      rejectDocument(documentId, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['drivers-verifications', 'documents'] });
        queryClient.invalidateQueries({ queryKey: ['drivers-verifications', 'onboarding'] });
        queryClient.invalidateQueries({ queryKey: ['drivers-verifications', 'stats'] });
      },
    }
  );
}

export function useBulkVerifyDocuments() {
  const queryClient = useQueryClient();

  return useApiMutation(
    (data: BulkVerifyDocumentsRequest) => bulkVerifyDocuments(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['drivers-verifications', 'documents'] });
        queryClient.invalidateQueries({ queryKey: ['drivers-verifications', 'onboarding'] });
        queryClient.invalidateQueries({ queryKey: ['drivers-verifications', 'stats'] });
      },
    }
  );
}

export function useVerifyVehicle() {
  const queryClient = useQueryClient();

  return useApiMutation(
    ({ vehicleId, data }: { vehicleId: string | number; data: VerifyVehicleRequest }) =>
      verifyVehicle(vehicleId, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['drivers-verifications', 'vehicles'] });
        queryClient.invalidateQueries({ queryKey: ['drivers-verifications', 'onboarding'] });
        queryClient.invalidateQueries({ queryKey: ['drivers-verifications', 'stats'] });
      },
    }
  );
}

export function useRejectVehicle() {
  const queryClient = useQueryClient();

  return useApiMutation(
    ({ vehicleId, data }: { vehicleId: string | number; data: VerifyVehicleRequest }) =>
      rejectVehicle(vehicleId, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['drivers-verifications', 'vehicles'] });
        queryClient.invalidateQueries({ queryKey: ['drivers-verifications', 'onboarding'] });
        queryClient.invalidateQueries({ queryKey: ['drivers-verifications', 'stats'] });
      },
    }
  );
}

export function useVerifyVehicleDocument() {
  const queryClient = useQueryClient();

  return useApiMutation(
    ({
      vehicleId,
      documentId,
      data,
    }: {
      vehicleId: string | number;
      documentId: string | number;
      data: VerifyVehicleDocumentRequest;
    }) => verifyVehicleDocument(vehicleId, documentId, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['drivers-verifications', 'vehicles'] });
        queryClient.invalidateQueries({ queryKey: ['drivers-verifications', 'onboarding'] });
      },
    }
  );
}

export function useBulkVerifyVehicles() {
  const queryClient = useQueryClient();

  return useApiMutation(
    (data: BulkVerifyVehiclesRequest) => bulkVerifyVehicles(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['drivers-verifications', 'vehicles'] });
        queryClient.invalidateQueries({ queryKey: ['drivers-verifications', 'onboarding'] });
        queryClient.invalidateQueries({ queryKey: ['drivers-verifications', 'stats'] });
      },
    }
  );
}

export function useApproveDriver() {
  const queryClient = useQueryClient();

  return useApiMutation(
    ({ driverId, data }: { driverId: string | number; data?: ApproveDriverRequest }) =>
      approveDriver(driverId, data || {}),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['drivers-verifications', 'onboarding'] });
        queryClient.invalidateQueries({ queryKey: ['drivers-verifications', 'stats'] });
        queryClient.invalidateQueries({ queryKey: ['drivers'] });
      },
    }
  );
}



