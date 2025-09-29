import { useEffect, useCallback } from 'react';
import { UseFormReturn, FieldValues, Path, PathValue } from 'react-hook-form';

interface DraftPersistenceOptions<T extends FieldValues> {
  key: string; // Clave única para identificar el draft en localStorage
  form: UseFormReturn<T>;
  enabled?: boolean; // Habilitar/deshabilitar la persistencia
  debounceMs?: number; // Tiempo de debounce para guardar
  excludeFields?: Path<T>[]; // Campos que no se deben persistir
  onLoad?: (savedData: Partial<T>) => void; // Callback cuando se carga un draft
  onSave?: (data: Partial<T>) => void; // Callback cuando se guarda un draft
}

export function useDraftPersistence<T extends FieldValues>({
  key,
  form,
  enabled = true,
  debounceMs = 1000,
  excludeFields = [],
  onLoad,
  onSave,
}: DraftPersistenceOptions<T>) {
  const { watch, reset, getValues } = form;

  // Función para guardar el draft en localStorage
  const saveDraft = useCallback(
    (data: Partial<T>) => {
      if (!enabled) return;

      try {
        // Excluir campos especificados
        const filteredData = { ...data };
        excludeFields.forEach(field => {
          delete filteredData[field as keyof T];
        });

        const draftData = {
          data: filteredData,
          timestamp: Date.now(),
          formKey: key,
        };

        localStorage.setItem(`form-draft-${key}`, JSON.stringify(draftData));
        onSave?.(filteredData);
      } catch (error) {
        console.warn('Error saving form draft:', error);
      }
    },
    [key, enabled, excludeFields, onSave]
  );

  // Función para cargar el draft desde localStorage
  const loadDraft = useCallback((): Partial<T> | null => {
    if (!enabled) return null;

    try {
      const saved = localStorage.getItem(`form-draft-${key}`);
      if (!saved) return null;

      const draftData = JSON.parse(saved);

      // Verificar que el draft sea válido y no demasiado antiguo (24 horas)
      const isExpired = Date.now() - draftData.timestamp > 24 * 60 * 60 * 1000;
      if (isExpired || draftData.formKey !== key) {
        localStorage.removeItem(`form-draft-${key}`);
        return null;
      }

      onLoad?.(draftData.data);
      return draftData.data;
    } catch (error) {
      console.warn('Error loading form draft:', error);
      return null;
    }
  }, [key, enabled, onLoad]);

  // Función para limpiar el draft
  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(`form-draft-${key}`);
    } catch (error) {
      console.warn('Error clearing form draft:', error);
    }
  }, [key]);

  // Función para verificar si existe un draft
  const hasDraft = useCallback((): boolean => {
    try {
      const saved = localStorage.getItem(`form-draft-${key}`);
      return !!saved;
    } catch {
      return false;
    }
  }, [key]);

  // Auto-guardar con debounce cuando cambian los valores
  useEffect(() => {
    if (!enabled) return;

    let timeoutId: NodeJS.Timeout;

    const subscription = watch((data) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        saveDraft(data as Partial<T>);
      }, debounceMs);
    });

    return () => {
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, [watch, saveDraft, enabled, debounceMs]);

  // Cargar draft al montar el componente
  useEffect(() => {
    const savedData = loadDraft();
    if (savedData) {
      // Resetear el formulario con los datos guardados
      reset(savedData as any);
    }
  }, [loadDraft, reset]);

  return {
    saveDraft,
    loadDraft,
    clearDraft,
    hasDraft,
  };
}

// Hook para manejar múltiples drafts
export function useMultipleDrafts() {
  const getAllDrafts = useCallback(() => {
    try {
      const drafts: Array<{ key: string; timestamp: number; data: any }> = [];

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('form-draft-')) {
          try {
            const value = localStorage.getItem(key);
            if (value) {
              const draft = JSON.parse(value);
              drafts.push({
                key: key.replace('form-draft-', ''),
                timestamp: draft.timestamp,
                data: draft.data,
              });
            }
          } catch {
            // Ignorar drafts corruptos
          }
        }
      }

      return drafts.sort((a, b) => b.timestamp - a.timestamp);
    } catch {
      return [];
    }
  }, []);

  const clearAllDrafts = useCallback(() => {
    try {
      const keysToRemove: string[] = [];

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('form-draft-')) {
          keysToRemove.push(key);
        }
      }

      keysToRemove.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.warn('Error clearing all drafts:', error);
    }
  }, []);

  const clearExpiredDrafts = useCallback((maxAgeMs: number = 24 * 60 * 60 * 1000) => {
    try {
      const now = Date.now();
      const keysToRemove: string[] = [];

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('form-draft-')) {
          try {
            const value = localStorage.getItem(key);
            if (value) {
              const draft = JSON.parse(value);
              if (now - draft.timestamp > maxAgeMs) {
                keysToRemove.push(key);
              }
            }
          } catch {
            keysToRemove.push(key);
          }
        }
      }

      keysToRemove.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.warn('Error clearing expired drafts:', error);
    }
  }, []);

  return {
    getAllDrafts,
    clearAllDrafts,
    clearExpiredDrafts,
  };
}
