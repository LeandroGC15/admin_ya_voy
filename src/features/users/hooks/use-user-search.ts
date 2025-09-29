import { useApiQuery } from '@/lib/api/react-query-client';
import { ENDPOINTS } from '@/lib/endpoints';
import type { User } from '../schemas/user-schemas';

export interface UserSearchFilters {
  email?: string;
  name?: string;
  phone?: string;
  city?: string;
  state?: string;
  country?: string;
  isActive?: boolean;
  userType?: 'passenger' | 'driver';
  page?: number;
  limit?: number;
}

export interface UserSearchResult {
  users: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Query Keys
export const userSearchKeys = {
  all: ['userSearch'] as const,
  search: (filters: UserSearchFilters) => [...userSearchKeys.all, filters] as const,
};

// Hook para buscar usuarios con filtros
export function useUserSearch(filters: UserSearchFilters, enabled: boolean = true) {
  return useApiQuery(
    userSearchKeys.search(filters),
    async (): Promise<UserSearchResult> => {
      const params = new URLSearchParams();

      if (filters.email) params.append('email', filters.email);
      if (filters.name) params.append('name', filters.name);
      if (filters.phone) params.append('phone', filters.phone);
      if (filters.city) params.append('city', filters.city);
      if (filters.state) params.append('state', filters.state);
      if (filters.country) params.append('country', filters.country);
      if (filters.isActive !== undefined) params.append('isActive', filters.isActive.toString());
      if (filters.userType) params.append('userType', filters.userType);
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());

      const url = `${ENDPOINTS.legacy.users}${params.toString() ? `?${params.toString()}` : ''}`;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${url}`);
      const data = await response.json();

      return {
        users: data.data?.data || [],
        total: data.data?.pagination?.total || 0,
        page: data.data?.pagination?.page || 1,
        limit: data.data?.pagination?.limit || 10,
        totalPages: data.data?.pagination?.totalPages || 1,
      };
    },
    {
      enabled,
      staleTime: 2 * 60 * 1000, // 2 minutes
      refetchOnWindowFocus: false,
    }
  );
}

// Hook para buscar usuario por email
export function useUserByEmail(email: string, enabled: boolean = true) {
  return useUserSearch({ email, limit: 1 }, enabled);
}
