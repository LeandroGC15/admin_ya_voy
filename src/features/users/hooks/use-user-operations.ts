import { useApiMutation } from '@/lib/api/react-query-client';
import { ENDPOINTS } from '@/lib/endpoints';

// Hook para crear usuario (usando API legacy)
export function useCreateUserLegacy() {
  return useApiMutation(
    async (userData: {
      name: string;
      email: string;
      clerkId?: string;
    }) => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${ENDPOINTS.legacy.users}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error('Failed to create user');
      }

      return response.json();
    }
  );
}

// Hook para actualizar usuario (usando API legacy)
export function useUpdateUserLegacy() {
  return useApiMutation(
    async ({
      userId,
      userData
    }: {
      userId: string;
      userData: Record<string, any>
    }) => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${ENDPOINTS.legacy.userById(userId)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error('Failed to update user');
      }

      return response.json();
    }
  );
}

// Hook para eliminar usuario (usando API legacy)
export function useDeleteUserLegacy() {
  return useApiMutation(
    async (userId: string) => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${ENDPOINTS.legacy.userById(userId)}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }

      return response.json();
    }
  );
}
