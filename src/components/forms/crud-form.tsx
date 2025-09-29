'use client';

import React from 'react';
import { useFormContext } from '@/hooks/use-form-manager';
import { FormComponentProps } from '@/types/form-system';
import { FieldRenderer } from './field-renderer';
import { cn } from '@/lib/utils';

export function CrudForm<T extends Record<string, any> = any, TData = any, TVariables = any>({
  config,
  className,
}: FormComponentProps<T, TData, TVariables> & { className?: string }) {
  const { state } = useFormContext<T, TData, TVariables>();

  const layout = config.layout || { columns: 1, gap: '1rem', responsive: true };
  const { columns = 1, gap = '1rem', responsive = true } = layout;

  // Filtrar campos visibles (no hidden)
  const visibleFields = config.fields.filter(field => !field.hidden);

  // Agrupar campos en filas según el número de columnas
  const fieldRows: Array<Array<typeof visibleFields[0]>> = [];
  for (let i = 0; i < visibleFields.length; i += columns) {
    fieldRows.push(visibleFields.slice(i, i + columns));
  }

  return (
    <div className={cn('space-y-6', className)}>
      {fieldRows.map((row, rowIndex) => (
        <div
          key={rowIndex}
          className={cn(
            'grid gap-4',
            {
              'grid-cols-1': columns === 1,
              'grid-cols-1 md:grid-cols-2': columns === 2 && responsive,
              'grid-cols-1 md:grid-cols-2 lg:grid-cols-3': columns === 3 && responsive,
              'grid-cols-1 md:grid-cols-2 lg:grid-cols-4': columns === 4 && responsive,
              'grid-cols-2': columns === 2 && !responsive,
              'grid-cols-3': columns === 3 && !responsive,
              'grid-cols-4': columns === 4 && !responsive,
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

      {/* Mostrar errores de la operación si existen */}
      {state.operation === 'create' && config.operations?.create?.isError && (
        <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/20">
          <div className="text-sm text-red-800 dark:text-red-200">
            Error al crear: {config.operations.create.error?.message || 'Error desconocido'}
          </div>
        </div>
      )}

      {state.operation === 'update' && config.operations?.update?.isError && (
        <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/20">
          <div className="text-sm text-red-800 dark:text-red-200">
            Error al actualizar: {config.operations.update.error?.message || 'Error desconocido'}
          </div>
        </div>
      )}

      {state.operation === 'delete' && config.operations?.delete?.isError && (
        <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/20">
          <div className="text-sm text-red-800 dark:text-red-200">
            Error al eliminar: {config.operations.delete.error?.message || 'Error desconocido'}
          </div>
        </div>
      )}

      {/* Mostrar mensajes de éxito */}
      {state.operation === 'create' && config.operations?.create?.isSuccess && (
        <div className="rounded-md bg-green-50 p-4 dark:bg-green-900/20">
          <div className="text-sm text-green-800 dark:text-green-200">
            ¡Registro creado exitosamente!
          </div>
        </div>
      )}

      {state.operation === 'update' && config.operations?.update?.isSuccess && (
        <div className="rounded-md bg-green-50 p-4 dark:bg-green-900/20">
          <div className="text-sm text-green-800 dark:text-green-200">
            ¡Registro actualizado exitosamente!
          </div>
        </div>
      )}

      {state.operation === 'delete' && config.operations?.delete?.isSuccess && (
        <div className="rounded-md bg-green-50 p-4 dark:bg-green-900/20">
          <div className="text-sm text-green-800 dark:text-green-200">
            ¡Registro eliminado exitosamente!
          </div>
        </div>
      )}
    </div>
  );
}

export default CrudForm;
