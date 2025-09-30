'use client';

import React, { createContext, useContext, useCallback, useState, useMemo } from 'react';
import { useForm, UseFormReturn, FieldValues, DefaultValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ZodType } from 'zod';
import { useQueryClient } from '@tanstack/react-query';
import { useDraftPersistence } from './use-draft-persistence';
import {
  FormConfig,
  FormState,
  FormContextValue,
  FormOperation,
  TData,
  TVariables,
} from '@/types/form-system';

// Contexto para el formulario
const FormContext = createContext<FormContextValue | null>(null);

// Hook para usar el contexto del formulario
export function useFormContext<T extends FieldValues = any, TData = any, TVariables = any>() {
  const context = useContext(FormContext) as FormContextValue<T, TData, TVariables> | null;
  if (!context) {
    throw new Error('useFormContext must be used within a FormProvider');
  }
  return context;
}

// Provider del formulario
interface FormProviderProps<T extends FieldValues = any, TData = any, TVariables = any> {
  config: FormConfig<T, TData, TVariables>;
  children: React.ReactNode;
}

export function FormProvider<T extends FieldValues = any, TData = any, TVariables = any>({
  config,
  children,
}: FormProviderProps<T, TData, TVariables>) {
  const queryClient = useQueryClient();

  // Estado del formulario
  const [state, setState] = useState<FormState<T, TData>>({
    operation: 'create',
    isOpen: false,
    isSubmitting: false,
  });

  // Configuración del formulario react-hook-form
  const form = useForm<T>({
    resolver: zodResolver(config.schema),
    defaultValues: config.defaultValues as DefaultValues<T>,
    mode: config.validation?.mode || 'onChange',
    reValidateMode: config.validation?.reValidateMode || 'onChange',
  });

  // Persistencia de drafts
  const draftKey = config.persistence?.key || config.id;
  const draftPersistence = useDraftPersistence({
    key: draftKey,
    form,
    enabled: config.persistence?.enabled ?? false,
    debounceMs: config.persistence?.debounceMs ?? 1000,
    excludeFields: (config.persistence?.excludeFields as any) ?? [],
  });

  // Funciones de acción
  const openCreate = useCallback((initialData?: Partial<T>) => {
    setState(prev => ({
      ...prev,
      operation: 'create',
      isOpen: true,
      selectedItem: undefined,
      currentData: undefined,
    }));
    form.reset({ ...config.defaultValues, ...initialData } as DefaultValues<T>);
  }, [form, config.defaultValues]);

  const openUpdate = useCallback((item: TData, data?: Partial<T>) => {
    setState(prev => ({
      ...prev,
      operation: 'update',
      isOpen: true,
      selectedItem: item,
      currentData: data as T | undefined,
    }));
    form.reset({ ...config.defaultValues, ...data } as DefaultValues<T>);
  }, [form, config.defaultValues]);

  const openDelete = useCallback((item: TData) => {
    setState(prev => ({
      ...prev,
      operation: 'delete',
      isOpen: true,
      selectedItem: item,
      currentData: undefined,
    }));
  }, []);

  const openSearch = useCallback((filters?: Partial<T>) => {
    setState(prev => ({
      ...prev,
      operation: 'search',
      isOpen: true,
      searchFilters: filters,
    }));
    if (filters) {
      form.reset(filters as DefaultValues<T>);
    }
  }, [form]);

  const openView = useCallback((item: TData) => {
    setState(prev => ({
      ...prev,
      operation: 'view',
      isOpen: true,
      selectedItem: item,
    }));
  }, []);

  const close = useCallback(() => {
    setState(prev => ({
      ...prev,
      isOpen: false,
      isSubmitting: false,
    }));
    form.reset(config.defaultValues as DefaultValues<T>);
  }, [form, config.defaultValues]);

  const submit = useCallback(async () => {
    const isValid = await form.trigger();
    if (!isValid) return;

    const formData = form.getValues();

    setState(prev => ({ ...prev, isSubmitting: true }));

    try {
      let result;

      switch (state.operation) {
        case 'create':
          if (config.operations.create) {
            result = await config.operations.create.mutateAsync(formData as unknown as TVariables);
          }
          break;
        case 'update':
          if (config.operations.update && state.selectedItem) {
            result = await config.operations.update.mutateAsync({
              ...formData,
              id: (state.selectedItem as any).id,
            } as unknown as TVariables);
          }
          break;
        case 'delete':
          if (config.operations.delete && state.selectedItem) {
            result = await config.operations.delete.mutateAsync((state.selectedItem as any).id as unknown as TVariables);
          }
          break;
        case 'search':
          // Para búsqueda, no necesitamos submit, solo actualizar filtros
          setState(prev => ({ ...prev, searchFilters: formData }));
          break;
      }

      // Invalidate queries relacionadas
      if (config.id) {
        queryClient.invalidateQueries({ queryKey: [config.id] });
      }

      // Limpiar draft si la operación fue exitosa
      if (config.persistence?.enabled && state.operation !== 'search') {
        draftPersistence.clearDraft();
      }

      // Cerrar modal si no es búsqueda
      if (state.operation !== 'search') {
        close();
      }

    } catch (error) {
      console.error(`Error in ${state.operation} operation:`, error);
      // El error ya se maneja en las mutaciones de React Query
    } finally {
      setState(prev => ({ ...prev, isSubmitting: false }));
    }
  }, [form, state.operation, state.selectedItem, config.operations, config.id, queryClient, close, config.persistence?.enabled, draftPersistence]);

  const reset = useCallback((clearDraft = false) => {
    form.reset(config.defaultValues as DefaultValues<T>);
    setState(prev => ({
      ...prev,
      selectedItem: undefined,
      currentData: undefined,
      searchFilters: undefined,
    }));

    if (clearDraft) {
      draftPersistence.clearDraft();
    }
  }, [form, config.defaultValues, draftPersistence]);

  const setSearchFilters = useCallback((filters: Partial<T>) => {
    setState(prev => ({ ...prev, searchFilters: filters }));
    form.reset(filters as DefaultValues<T>);
  }, [form]);

  // Valor del contexto
  const contextValue = useMemo<FormContextValue<T, TData, TVariables>>(() => ({
    config,
    state,
    form,
    openCreate,
    openUpdate,
    openDelete,
    openSearch,
    openView,
    close,
    submit,
    reset,
    setSearchFilters,
    // Funciones de draft persistence
    draft: {
      save: draftPersistence.saveDraft,
      load: draftPersistence.loadDraft,
      clear: draftPersistence.clearDraft,
      has: draftPersistence.hasDraft,
    },
  }), [
    config,
    state,
    form,
    openCreate,
    openUpdate,
    openDelete,
    openSearch,
    openView,
    close,
    submit,
    reset,
    setSearchFilters,
    draftPersistence,
  ]);

  return (
    <FormContext.Provider value={contextValue as FormContextValue}>
      {children}
    </FormContext.Provider>
  );
}

// Hook principal para manejar formularios
export function useFormManager<T extends FieldValues = any, TData = any, TVariables = any>(
  config: FormConfig<T, TData, TVariables>
) {
  return useFormContext<T, TData, TVariables>();
}

// Hook para crear una configuración de formulario fácilmente
export function createFormConfig<T extends FieldValues, TData = any, TVariables = any>(
  config: FormConfig<T, TData, TVariables>
): FormConfig<T, TData, TVariables> {
  return config;
}
