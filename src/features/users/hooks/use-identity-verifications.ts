import { useApiQuery, useApiMutation } from '@/lib/api/react-query-client';
import { api } from '@/lib/api/api-client';
import { ENDPOINTS } from '@/lib/endpoints';
import { toast } from 'sonner';
import { invalidateQueries } from '@/lib/api/react-query-client';

export interface IdentityVerification {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  dniNumber: string;
  frontPhotoUrl: string;
  backPhotoUrl: string;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  verifiedAt?: Date;
  verifiedBy?: number;
  verifiedByName?: string;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PendingVerificationsResponse {
  verifications: IdentityVerification[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IdentityVerificationStats {
  totalPending: number;
  approvedToday: number;
  rejectedToday: number;
  approvalRate: number;
}

export interface ApproveIdentityVerificationInput {
  notes?: string;
}

export interface RejectIdentityVerificationInput {
  rejectionReason: string;
  notes?: string;
}

// Get pending identity verifications hook
export function usePendingIdentityVerifications(page: number = 1, limit: number = 20) {
  return useApiQuery(
    ['identity-verifications', 'pending', page, limit],
    async (): Promise<PendingVerificationsResponse> => {
      try {
        const response = await api.get<PendingVerificationsResponse>(
          ENDPOINTS.users.identityVerifications.pending,
          {
            params: {
              page,
              limit,
            },
          }
        );
        if (!response || !response.data) {
          throw new Error('Invalid API response: no data received');
        }
        return response.data;
      } catch (error: any) {
        console.error('Error fetching pending identity verifications:', error);
        throw error;
      }
    },
    {
      enabled: true,
    }
  );
}

// Get identity verification for a specific user hook
export function useUserIdentityVerification(userId: string | number) {
  return useApiQuery(
    ['identity-verification', 'user', userId],
    async (): Promise<IdentityVerification | null> => {
      try {
        const response = await api.get<IdentityVerification>(
          ENDPOINTS.users.identityVerifications.byUserId(userId)
        );
        if (!response || !response.data) {
          return null;
        }
        return response.data;
      } catch (error: any) {
        // If 404, return null (no verification exists)
        if (error?.response?.status === 404) {
          return null;
        }
        console.error('Error fetching user identity verification:', error);
        throw error;
      }
    },
    {
      enabled: !!userId,
    }
  );
}

// Approve identity verification hook
export function useApproveIdentityVerification() {
  return useApiMutation(
    async ({
      userId,
      data,
    }: {
      userId: string | number;
      data: ApproveIdentityVerificationInput;
    }): Promise<{ message: string }> => {
      try {
        const response = await api.post<{ message: string }>(
          ENDPOINTS.users.identityVerifications.approve(userId),
          data
        );
        toast.success('Verificación de identidad aprobada exitosamente');
        return response.data;
      } catch (error: any) {
        console.error('Error approving identity verification:', error);
        const errorMessage =
          error?.response?.data?.message ||
          error?.message ||
          'Error al aprobar verificación de identidad';
        toast.error(errorMessage);
        throw error;
      }
    },
    {
      onSuccess: () => {
        invalidateQueries(['identity-verifications']);
        invalidateQueries(['users']);
      },
    }
  );
}

// Reject identity verification hook
export function useRejectIdentityVerification() {
  return useApiMutation(
    async ({
      userId,
      data,
    }: {
      userId: string | number;
      data: RejectIdentityVerificationInput;
    }): Promise<{ message: string }> => {
      try {
        const response = await api.post<{ message: string }>(
          ENDPOINTS.users.identityVerifications.reject(userId),
          data
        );
        toast.success('Verificación de identidad rechazada exitosamente');
        return response.data;
      } catch (error: any) {
        console.error('Error rejecting identity verification:', error);
        const errorMessage =
          error?.response?.data?.message ||
          error?.message ||
          'Error al rechazar verificación de identidad';
        toast.error(errorMessage);
        throw error;
      }
    },
    {
      onSuccess: () => {
        invalidateQueries(['identity-verifications']);
        invalidateQueries(['users']);
      },
    }
  );
}

// Get identity verification stats hook
export function useIdentityVerificationStats() {
  return useApiQuery(
    ['identity-verifications', 'stats'],
    async (): Promise<IdentityVerificationStats> => {
      try {
        const response = await api.get<IdentityVerificationStats>(
          ENDPOINTS.users.identityVerifications.stats
        );
        if (!response || !response.data) {
          throw new Error('Invalid API response: no data received');
        }
        return response.data;
      } catch (error: any) {
        console.error('Error fetching identity verification stats:', error);
        throw error;
      }
    },
    {
      enabled: true,
    }
  );
}

