import { useApiQuery, useApiMutation } from '@/lib/api/react-query-client';
import { api } from '@/lib/api/api-client';
import { ENDPOINTS } from '@/lib/endpoints';
import { toast } from 'sonner';
import type {
  TrainingModule,
  CreateModuleInput,
  UpdateModuleInput,
  SearchModulesInput,
  ModuleListResponse,
} from '../schemas/module-schemas';

// Fetch modules hook
export function useModules(params: SearchModulesInput = {}) {
  return useApiQuery(
    ['programa-yavoy', 'modules', { ...params }],
    async (): Promise<ModuleListResponse> => {
      try {
        const response = await api.get<ModuleListResponse>(ENDPOINTS.programaYavoy.modules, {
          params: {
            page: params.page || 1,
            limit: params.limit || 10,
            search: params.search,
            isActive: params.isActive,
          },
        });
        if (!response || !response.data) {
          throw new Error('Invalid API response: no data received');
        }
        return response.data;
      } catch (error: any) {
        console.error('Error fetching modules:', error);
        throw error;
      }
    },
    {
      enabled: true,
    }
  );
}

// Fetch single module hook
export function useModule(id: string | number) {
  return useApiQuery(
    ['programa-yavoy', 'module', id],
    async (): Promise<TrainingModule> => {
      try {
        const response = await api.get<TrainingModule>(ENDPOINTS.programaYavoy.moduleById(id));
        if (!response || !response.data) {
          throw new Error('Invalid API response: no data received');
        }
        return response.data;
      } catch (error: any) {
        console.error('Error fetching module:', error);
        throw error;
      }
    },
    {
      enabled: !!id,
    }
  );
}

// Create module hook
export function useCreateModule() {
  return useApiMutation<TrainingModule, CreateModuleInput>(
    async (data: CreateModuleInput) => {
      try {
        const response = await api.post<TrainingModule>(ENDPOINTS.programaYavoy.modules, data);
        if (!response || !response.data) {
          throw new Error('Invalid API response: no data received');
        }
        return response.data;
      } catch (error: any) {
        console.error('Error creating module:', error);
        throw error;
      }
    },
    {
      onSuccess: () => {
        toast.success('Módulo creado exitosamente');
      },
      onError: (error: any) => {
        const message = error?.response?.data?.message || error?.message || 'Error al crear el módulo';
        toast.error('Error al crear el módulo', { description: message });
      },
    }
  );
}

// Update module hook
export function useUpdateModule() {
  return useApiMutation<TrainingModule, UpdateModuleInput>(
    async (data: UpdateModuleInput) => {
      try {
        const { id, ...updateData } = data;
        const response = await api.patch<TrainingModule>(
          ENDPOINTS.programaYavoy.moduleById(id),
          updateData
        );
        if (!response || !response.data) {
          throw new Error('Invalid API response: no data received');
        }
        return response.data;
      } catch (error: any) {
        console.error('Error updating module:', error);
        throw error;
      }
    },
    {
      onSuccess: () => {
        toast.success('Módulo actualizado exitosamente');
      },
      onError: (error: any) => {
        const message = error?.response?.data?.message || error?.message || 'Error al actualizar el módulo';
        toast.error('Error al actualizar el módulo', { description: message });
      },
    }
  );
}

// Delete module hook
export function useDeleteModule() {
  return useApiMutation<void, number>(
    async (id: number) => {
      try {
        await api.delete(ENDPOINTS.programaYavoy.moduleById(id));
      } catch (error: any) {
        console.error('Error deleting module:', error);
        throw error;
      }
    },
    {
      onSuccess: () => {
        toast.success('Módulo eliminado exitosamente');
      },
      onError: (error: any) => {
        const message = error?.response?.data?.message || error?.message || 'Error al eliminar el módulo';
        toast.error('Error al eliminar el módulo', { description: message });
      },
    }
  );
}

// Toggle module status hook
export function useToggleModuleStatus() {
  return useApiMutation<TrainingModule, number>(
    async (id: number) => {
      try {
        const response = await api.patch<TrainingModule>(ENDPOINTS.programaYavoy.toggleStatus(id));
        if (!response || !response.data) {
          throw new Error('Invalid API response: no data received');
        }
        return response.data;
      } catch (error: any) {
        console.error('Error toggling module status:', error);
        throw error;
      }
    },
    {
      onSuccess: () => {
        toast.success('Estado del módulo actualizado');
      },
      onError: (error: any) => {
        const message = error?.response?.data?.message || error?.message || 'Error al cambiar el estado del módulo';
        toast.error('Error al cambiar el estado', { description: message });
      },
    }
  );
}

