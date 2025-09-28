import { useApiQuery, useApiMutation, createQueryKey } from '@/lib/api/react-query-client';
import { api } from '@/lib/api/api-client';
import type {
  User,
  CreateUserInput,
  UpdateUserInput,
  SearchUsersInput,
  UserListResponse
} from '../schemas/user-schemas';

// Query Keys
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (params: SearchUsersInput) => [...userKeys.lists(), params] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
};

// Fetch users hook
export function useUsers(params: SearchUsersInput = {}) {
  return useApiQuery(
    userKeys.list(params),
    async (): Promise<UserListResponse> => {
      const response = await api.get<UserListResponse>('admin/users', {
        params: {
          page: params.page || 1,
          limit: params.limit || 10,
          search: params.search,
          isActive: params.isActive,
          userType: params.userType,
        },
      });
      return response;
    },
    {
      enabled: true,
    }
  );
}

// Create user hook
export function useCreateUser() {
  return useApiMutation(
    async (userData: CreateUserInput): Promise<User> => {
      const response = await api.post<User>('admin/users', userData);
      return response;
    },
    {
      onSuccess: (newUser) => {
        // Invalidate and refetch users list
        // This will be handled by the component using the hook
      },
    }
  );
}

// Update user hook
export function useUpdateUser() {
  return useApiMutation(
    async ({ userId, userData }: { userId: string; userData: UpdateUserInput }): Promise<User> => {
      const response = await api.put<User>(`admin/users/${userId}`, userData);
      return response;
    },
    {
      onSuccess: (updatedUser) => {
        // Invalidate and refetch users list and specific user
        // This will be handled by the component using the hook
      },
    }
  );
}

// Delete user hook
export function useDeleteUser() {
  return useApiMutation(
    async (userId: string): Promise<void> => {
      await api.delete<void>(`admin/users/${userId}`);
    },
    {
      onSuccess: () => {
        // Invalidate and refetch users list
        // This will be handled by the component using the hook
      },
    }
  );
}

// Search users by email hook
export function useSearchUsersByEmail() {
  return useApiMutation(
    async (email: string): Promise<UserListResponse> => {
      const response = await api.get<UserListResponse>('admin/users/search', {
        params: { email },
      });
      return response;
    }
  );
}

// Get user by ID hook
export function useUser(userId: string) {
  return useApiQuery(
    userKeys.detail(userId),
    async (): Promise<User> => {
      const response = await api.get<User>(`admin/users/${userId}`);
      return response;
    },
    {
      enabled: !!userId,
    }
  );
}
