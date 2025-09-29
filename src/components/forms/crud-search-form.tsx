'use client';

import React from 'react';
import { Search, X } from 'lucide-react';
import { useFormContext } from '@/hooks/use-form-manager';
import { FormComponentProps } from '@/types/form-system';
import { FieldRenderer } from './field-renderer';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CrudSearchFormProps<T extends Record<string, any> = any, TData = any, TVariables = any>
  extends FormComponentProps<T, TData, TVariables> {
  className?: string;
  showSearchButton?: boolean;
  showClearButton?: boolean;
  searchButtonText?: string;
  clearButtonText?: string;
  onSearch?: (filters: Partial<T>) => void;
  onClear?: () => void;
  autoSearch?: boolean; // Buscar automáticamente al cambiar filtros
  autoSearchDelay?: number; // Delay en ms para búsqueda automática
}

export function CrudSearchForm<T extends Record<string, any> = any, TData = any, TVariables = any>({
  config,
  className,
  showSearchButton = true,
  showClearButton = true,
  searchButtonText = 'Buscar',
  clearButtonText = 'Limpiar',
  onSearch,
  onClear,
  autoSearch = false,
  autoSearchDelay = 500,
}: CrudSearchFormProps<T, TData, TVariables>) {
  const { state, form, setSearchFilters, submit } = useFormContext<T, TData, TVariables>();
  const { watch } = form;

  // Auto-search con debounce
  React.useEffect(() => {
    if (!autoSearch) return;

    const subscription = watch((value) => {
      const timer = setTimeout(() => {
        setSearchFilters(value as Partial<T>);
        onSearch?.(value as Partial<T>);
      }, autoSearchDelay);

      return () => clearTimeout(timer);
    });

    return () => subscription.unsubscribe();
  }, [watch, autoSearch, autoSearchDelay, setSearchFilters, onSearch]);

  const handleSearch = async () => {
    const formData = form.getValues();
    setSearchFilters(formData);
    onSearch?.(formData);
  };

  const handleClear = () => {
    form.reset(config.defaultValues as any);
    setSearchFilters({});
    onClear?.();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!autoSearch) {
      await handleSearch();
    }
  };

  // Filtrar campos de búsqueda (excluir campos hidden y campos que no deberían estar en búsqueda)
  const searchFields = config.fields.filter(field =>
    !field.hidden && field.type !== 'hidden'
  );

  const layout = config.layout || { columns: 1, gap: '1rem', responsive: true };
  const { columns = 1, gap = '1rem', responsive = true } = layout;

  // Para formularios de búsqueda, usualmente queremos más columnas para filtros
  const searchColumns = Math.max(columns, 2);

  // Agrupar campos en filas
  const fieldRows: Array<Array<typeof searchFields[0]>> = [];
  for (let i = 0; i < searchFields.length; i += searchColumns) {
    fieldRows.push(searchFields.slice(i, i + searchColumns));
  }

  return (
    <div className={cn('space-y-4', className)}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {fieldRows.map((row, rowIndex) => (
          <div
            key={rowIndex}
            className={cn(
              'grid gap-4',
              {
                'grid-cols-1': searchColumns === 1,
                'grid-cols-1 md:grid-cols-2': searchColumns === 2 && responsive,
                'grid-cols-1 md:grid-cols-2 lg:grid-cols-3': searchColumns === 3 && responsive,
                'grid-cols-1 md:grid-cols-2 lg:grid-cols-4': searchColumns >= 4 && responsive,
                'grid-cols-2': searchColumns === 2 && !responsive,
                'grid-cols-3': searchColumns === 3 && !responsive,
                'grid-cols-4': searchColumns >= 4 && !responsive,
              }
            )}
            style={{ gap }}
          >
            {row.map((field) => (
              <FieldRenderer
                key={field.name as string}
                config={config}
                field={field}
              />
            ))}
          </div>
        ))}

        {/* Botones de acción */}
        {(showSearchButton || showClearButton) && (
          <div className="flex flex-wrap gap-2 pt-2">
            {showSearchButton && !autoSearch && (
              <Button
                type="submit"
                disabled={state.isSubmitting}
                className="flex items-center gap-2"
              >
                <Search className="h-4 w-4" />
                {searchButtonText}
              </Button>
            )}

            {showClearButton && (
              <Button
                type="button"
                variant="outline"
                onClick={handleClear}
                disabled={state.isSubmitting}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                {clearButtonText}
              </Button>
            )}
          </div>
        )}

        {/* Mostrar estado de carga para búsqueda */}
        {config.operations?.search?.isLoading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            Buscando...
          </div>
        )}

        {/* Mostrar errores de búsqueda */}
        {config.operations?.search?.isError && (
          <div className="rounded-md bg-red-50 p-3 dark:bg-red-900/20">
            <div className="text-sm text-red-800 dark:text-red-200">
              Error en la búsqueda: {config.operations.search.error?.message || 'Error desconocido'}
            </div>
          </div>
        )}

        {/* Mostrar resultados encontrados */}
        {config.operations?.search?.data && (
          <div className="text-sm text-muted-foreground">
            {Array.isArray(config.operations.search.data)
              ? `${config.operations.search.data.length} resultado(s) encontrado(s)`
              : 'Búsqueda completada'
            }
          </div>
        )}
      </form>
    </div>
  );
}

export default CrudSearchForm;
