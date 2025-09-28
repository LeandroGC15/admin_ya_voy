'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface UseCrudDataOptions<T, TCreate, TUpdate> {
  entityName: string;
  queryKey: string[];
  fetchFn: (params?: any) => Promise<{ data: T[]; total: number; page: number; totalPages: number }>;
  createFn?: (data: TCreate) => Promise<T>;
  updateFn?: (id: string, data: TUpdate) => Promise<T>;
  deleteFn?: (id: string) => Promise<void>;
  onSuccess?: {
    create?: (data: T) => void;
    update?: (data: T) => void;
    delete?: () => void;
  };
}

export function useCrudData<T, TCreate = any, TUpdate = any>({
  entityName,
  queryKey,
  fetchFn,
  createFn,
  updateFn,
  deleteFn,
  onSuccess,
}: UseCrudDataOptions<T, TCreate, TUpdate>) {
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchParams, setSearchParams] = useState<Record<string, any>>({});

  // Query para obtener datos
  const {
    data: response,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: [...queryKey, currentPage, searchParams],
    queryFn: () => fetchFn({ page: currentPage, limit: 10, ...searchParams }),
  });

  const data = response?.data || [];
  const pagination = response ? {
    currentPage: response.page,
    totalPages: response.totalPages,
    totalItems: response.total,
  } : null;

  // Mutation para crear
  const createMutation = useMutation({
    mutationFn: createFn,
    onSuccess: (newData) => {
      queryClient.invalidateQueries({ queryKey });
      toast.success(`${entityName} creado exitosamente`);
      onSuccess?.create?.(newData);
    },
    onError: (error: any) => {
      toast.error(`Error al crear ${entityName}: ${error.message || 'Error desconocido'}`);
    },
  });

  // Mutation para actualizar
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: TUpdate }) =>
      updateFn!(id, data),
    onSuccess: (updatedData) => {
      queryClient.invalidateQueries({ queryKey });
      toast.success(`${entityName} actualizado exitosamente`);
      onSuccess?.update?.(updatedData);
    },
    onError: (error: any) => {
      toast.error(`Error al actualizar ${entityName}: ${error.message || 'Error desconocido'}`);
    },
  });

  // Mutation para eliminar
  const deleteMutation = useMutation({
    mutationFn: deleteFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success(`${entityName} eliminado exitosamente`);
      onSuccess?.delete?.();
    },
    onError: (error: any) => {
      toast.error(`Error al eliminar ${entityName}: ${error.message || 'Error desconocido'}`);
    },
  });

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearch = (params: Record<string, any>) => {
    setSearchParams(params);
    setCurrentPage(1); // Reset to first page when searching
  };

  const create = (data: TCreate) => {
    if (createFn) {
      createMutation.mutate(data);
    }
  };

  const update = (id: string, data: TUpdate) => {
    if (updateFn) {
      updateMutation.mutate({ id, data });
    }
  };

  const remove = (id: string) => {
    if (deleteFn) {
      deleteMutation.mutate(id);
    }
  };

  return {
    // Data
    data,
    isLoading,
    error,
    pagination,

    // Actions
    create,
    update,
    remove,
    refetch,
    handlePageChange,
    handleSearch,

    // States
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

