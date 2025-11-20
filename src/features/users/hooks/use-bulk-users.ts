import { useApiMutation } from '@/lib/api/react-query-client';
import { api } from '@/lib/api/api-client';
import { ENDPOINTS } from '@/lib/endpoints';
import { toast } from 'sonner';

export interface BulkUpdateUsersInput {
  userIds: number[];
  isActive: boolean;
  reason?: string;
}

export interface BulkUpdateUsersResponse {
  success: boolean;
  updatedCount: number;
  failedCount: number;
  errors?: string[];
  message: string;
}

// Hook para operaciones masivas de usuarios
export function useBulkUpdateUsers() {
  return useApiMutation(
    async (data: BulkUpdateUsersInput): Promise<BulkUpdateUsersResponse> => {
      try {
        // Validar que se proporcionen IDs de usuarios
        if (!data.userIds || data.userIds.length === 0) {
          throw new Error('Debe seleccionar al menos un usuario');
        }

        // Validar que todos los IDs sean números válidos
        const invalidIds = data.userIds.filter(id => !Number.isInteger(id) || id <= 0);
        if (invalidIds.length > 0) {
          throw new Error(`IDs de usuario inválidos: ${invalidIds.join(', ')}`);
        }

        // Validar razón si se proporciona
        if (data.reason && data.reason.trim().length === 0) {
          throw new Error('La razón no puede estar vacía');
        }

        console.log('[BulkUsers] Enviando operación masiva:', {
          userIds: data.userIds,
          isActive: data.isActive,
          reason: data.reason,
          count: data.userIds.length
        });

        const response = await api.post<BulkUpdateUsersResponse>(
          ENDPOINTS.users.bulkStatus,
          {
            userIds: data.userIds,
            isActive: data.isActive,
            reason: data.reason?.trim() || (data.isActive ? 'Activación masiva' : 'Desactivación masiva')
          }
        );

        if (!response || !response.data) {
          throw new Error('Respuesta inválida del servidor');
        }

        const result = response.data;
        
        // Mostrar mensaje de éxito apropiado
        const action = data.isActive ? 'activados' : 'desactivados';
        const count = result.updatedCount || data.userIds.length;
        
        if (result.failedCount && result.failedCount > 0) {
          toast.warning(
            `${count} usuarios ${action} exitosamente. ${result.failedCount} usuarios no pudieron ser procesados.`
          );
        } else {
          toast.success(`${count} usuarios ${action} exitosamente`);
        }

        return result;
      } catch (error: any) {
        console.error('[BulkUsers] Error en operación masiva:', error);
        
        // Manejar diferentes tipos de errores
        let errorMessage = 'Error desconocido al procesar usuarios';
        
        if (error.response?.status === 400) {
          errorMessage = error.response.data?.message || 'Datos inválidos para la operación masiva';
        } else if (error.response?.status === 401) {
          errorMessage = 'No autorizado para realizar operaciones masivas';
        } else if (error.response?.status === 403) {
          errorMessage = 'Permisos insuficientes para operaciones masivas';
        } else if (error.response?.status === 404) {
          errorMessage = 'Algunos usuarios no fueron encontrados';
        } else if (error.response?.status >= 500) {
          errorMessage = 'Error del servidor. Intente nuevamente más tarde';
        } else if (error.message) {
          errorMessage = error.message;
        }

        toast.error(`Error en operación masiva: ${errorMessage}`);
        throw error;
      }
    },
    {
      onSuccess: (result) => {
        console.log('[BulkUsers] Operación masiva exitosa:', result);
        // La invalidación de queries se manejará en el componente
      },
      onError: (error: any) => {
        console.error('[BulkUsers] Error en mutación:', error);
        // El manejo de errores ya se hizo en la función principal
      },
    }
  );
}

// Hook para obtener estadísticas de usuarios seleccionados
export function useBulkUsersStats() {
  return {
    // Esta función puede ser expandida en el futuro para obtener estadísticas
    // de los usuarios seleccionados antes de realizar la operación masiva
    getSelectedUsersStats: (userIds: number[], users: any[]) => {
      const selectedUsers = users.filter(user => userIds.includes(user.id));
      
      return {
        total: selectedUsers.length,
        active: selectedUsers.filter(user => user.isActive && !user.deletedAt).length,
        inactive: selectedUsers.filter(user => !user.isActive && !user.deletedAt).length,
        softDeleted: selectedUsers.filter(user => user.deletedAt).length,
        drivers: selectedUsers.filter(user => user.userType === 'driver').length,
        passengers: selectedUsers.filter(user => user.userType === 'passenger').length,
      };
    }
  };
}

