import { useApiQuery, useApiMutation } from '@/lib/api/react-query-client';
import { api } from '@/lib/api/api-client';
import { ENDPOINTS } from '@/lib/endpoints';
import type {
  User,
  CreateUserInput,
  UpdateUserInput,
  SearchUsersInput,
  UserListResponse
} from '../schemas/user-schemas';

// Fetch users hook
export function useUsers(params: SearchUsersInput = {}) {
  return useApiQuery(
    ['users', 'list', params],
    async (): Promise<UserListResponse> => {
      try {
        const response = await api.get<UserListResponse>(ENDPOINTS.users.base, {
          params: { 
            page: params.page || 1,
            limit: params.limit || 10,
            search: params.search,
            isActive: params.isActive,
            userType: params.userType,
          },
        });
        if (!response || !response.data) {
          throw new Error('Invalid API response: no data received');
        }
        return response.data;
      } catch (error: any) {
        console.error('Error fetching users:', error);
        throw error;
      }
    },
    {
      enabled: true,
    }
  );
}

// Create user hook - creates basic user then updates with additional fields
export function useCreateUser() {
  return useApiMutation(
    async (userData: CreateUserInput): Promise<User> => {
      try {
        // Step 1: Create basic user with legacy endpoint
        const createPayload = {
          name: userData.name,
          email: userData.email,
          clerkId: `admin_created_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` // Generate temporary clerkId
        };

        const createResponse = await api.post<{ data: User[] }>(ENDPOINTS.legacy.users, createPayload);
        if (!createResponse || !createResponse.data || !createResponse.data.data || createResponse.data.data.length === 0) {
          throw new Error('Invalid API response: no data received');
        }

        const newUser = createResponse.data.data[0];

        // Step 2: If there are additional fields, update the user immediately
        const hasAdditionalFields = userData.phone || userData.city || userData.state || userData.country || userData.userType;

        if (hasAdditionalFields) {
          const updatePayload: any = {};

          // Only include fields that have values and are different from current user data
          if (userData.phone && userData.phone.trim() !== '') {
            updatePayload.phone = userData.phone;
          }
          if (userData.city && userData.city.trim() !== '') {
            updatePayload.city = userData.city;
          }
          if (userData.state && userData.state.trim() !== '') {
            updatePayload.state = userData.state;
          }
          if (userData.country && userData.country.trim() !== '') {
            updatePayload.country = userData.country;
          }
          // Note: userType is not supported in the regular API, it's handled by the backend

          if (Object.keys(updatePayload).length > 0) {
            await api.put<User>(ENDPOINTS.legacy.userById(newUser.id), updatePayload);
          }
        }

        alert('Usuario creado exitosamente');
        return newUser;
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

// Update user hook - supports full user updates using regular API endpoint
export function useUpdateUser() {
  return useApiMutation(
    async ({ userId, userData }: { userId: string; userData: UpdateUserInput }): Promise<User> => {
      try {
        // Check if only isActive is being changed - use admin endpoint for status
        const isOnlyStatusChange = Object.keys(userData).length === 1 && userData.isActive !== undefined;

        let endpoint: string;
        let payload: any;

        if (isOnlyStatusChange) {
          // Use admin endpoint for status changes only
          endpoint = ENDPOINTS.users.status(userId);
          payload = { isActive: userData.isActive };
        } else {
          // Use regular API endpoint for full user updates
          endpoint = ENDPOINTS.legacy.userById(userId);
          // Filter out isActive from the payload since it's handled separately
          const { isActive, ...updateData } = userData;
          payload = updateData;
        }

        const response = await api.put<User>(endpoint, payload);
        alert('Usuario actualizado exitosamente');
        if (!response || !response.data) {
          throw new Error('Invalid API response: no data received');
        }
        return response.data;
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

// Delete user hook - uses admin API endpoint (soft delete)
export function useDeleteUser() {
  return useApiMutation(
    async (userId: string): Promise<void> => {
      try {
        const response = await api.delete(ENDPOINTS.users.byId(userId));
        alert('Usuario eliminado exitosamente');
        console.log('Delete response:', response);
      } catch (error: any) {
        console.error('Error deleting user:', error);

        // Provide more specific error messages
        let errorMessage = 'Error desconocido al eliminar usuario';
        if (error.response?.status === 404) {
          errorMessage = 'Usuario no encontrado';
        } else if (error.response?.status === 403) {
          errorMessage = 'No tienes permisos para eliminar este usuario';
        } else if (error.response?.status === 409) {
          errorMessage = 'No se puede eliminar el usuario porque tiene viajes o pedidos activos';
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        }

        alert(`Error al eliminar usuario: ${errorMessage}`);
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
        const response = await api.get<UserListResponse>(ENDPOINTS.users.search, {
          params: { email },
        });
        if (!response || !response.data) {
          throw new Error('Invalid API response: no data received');
        }
        return response.data;
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
    ['users', 'detail', userId],
    async (): Promise<User> => {
      try {
        const response = await api.get<User>(ENDPOINTS.users.byId(userId));
        if (!response || !response.data) {
          throw new Error('Invalid API response: no data received');
        }
        return response.data;
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
