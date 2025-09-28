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
      try {
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
      } catch (error: any) {
        console.error('Error fetching users:', error);
        alert(`Error al cargar usuarios: ${error.message || 'Error desconocido'}`);
        throw error;
      }
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
      try {
        const response = await api.post<User>('admin/users', userData);
        alert('Usuario creado exitosamente');
        return response;
      } catch (error: any) {
        console.error('Error creating user:', error);
        alert(`Error al crear usuario: ${error.message || 'Error desconocido'}`);
        throw error;
      }
    },
    {
      onSuccess: (newUser) => {
        // Invalidate and refetch users list
        // This will be handled by the component using the hook
      },
      onError: (error: any) => {
        console.error('Create user mutation error:', error);
        alert(`Error al crear usuario: ${error.message || 'Error desconocido'}`);
      },
    }
  );
}

// Update user hook
export function useUpdateUser() {
  return useApiMutation(
    async ({ userId, userData }: { userId: string; userData: UpdateUserInput }): Promise<User> => {
      try {
        const response = await api.put<User>(`admin/users/${userId}`, userData);
        alert('Usuario actualizado exitosamente');
        return response;
      } catch (error: any) {
        console.error('Error updating user:', error);
        alert(`Error al actualizar usuario: ${error.message || 'Error desconocido'}`);
        throw error;
      }
    },
    {
      onSuccess: (updatedUser) => {
        // Invalidate and refetch users list and specific user
        // This will be handled by the component using the hook
      },
      onError: (error: any) => {
        console.error('Update user mutation error:', error);
        alert(`Error al actualizar usuario: ${error.message || 'Error desconocido'}`);
      },
    }
  );
}

// Delete user hook
export function useDeleteUser() {
  return useApiMutation(
    async (userId: string): Promise<void> => {
      try {
        await api.delete<void>(`admin/users/${userId}`);
        alert('Usuario eliminado exitosamente');
      } catch (error: any) {
        console.error('Error deleting user:', error);
        alert(`Error al eliminar usuario: ${error.message || 'Error desconocido'}`);
        throw error;
      }
    },
    {
      onSuccess: () => {
        // Invalidate and refetch users list
        // This will be handled by the component using the hook
      },
      onError: (error: any) => {
        console.error('Delete user mutation error:', error);
        alert(`Error al eliminar usuario: ${error.message || 'Error desconocido'}`);
      },
    }
  );
}

// Search users by email hook
export function useSearchUsersByEmail() {
  return useApiMutation(
    async (email: string): Promise<UserListResponse> => {
      try {
        const response = await api.get<UserListResponse>('admin/users/search', {
          params: { email },
        });
        return response;
      } catch (error: any) {
        console.error('Error searching users by email:', error);
        alert(`Error al buscar usuarios: ${error.message || 'Error desconocido'}`);
        throw error;
      }
    },
    {
      onError: (error: any) => {
        console.error('Search users mutation error:', error);
        alert(`Error al buscar usuarios: ${error.message || 'Error desconocido'}`);
      },
    }
  );
}

// Get user by ID hook
export function useUser(userId: string) {
  return useApiQuery(
    userKeys.detail(userId),
    async (): Promise<User> => {
      try {
        const response = await api.get<User>(`admin/users/${userId}`);
        return response;
      } catch (error: any) {
        console.error('Error fetching user:', error);
        alert(`Error al cargar usuario: ${error.message || 'Error desconocido'}`);
        throw error;
      }
    },
    {
      enabled: !!userId,
    }
  );
}
