'use client';

import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFormContext } from '@/hooks/use-form-manager';
import { FormComponentProps } from '@/types/form-system';
import { cn } from '@/lib/utils';

const modalSizes = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-full',
};

export function CrudModal<T extends Record<string, any> = any, TData = any, TVariables = any>({
  config,
  children,
  className,
}: FormComponentProps<T, TData, TVariables> & { className?: string }) {
  const { state, close, submit } = useFormContext<T, TData, TVariables>();

  if (!state.isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      close();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submit();
  };

  const modalSize = modalSizes[config.ui?.modalSize || 'md'];
  const showCancelButton = config.ui?.showCancelButton ?? true;
  const showCloseButton = config.ui?.showCloseButton ?? true;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-white/10 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div
        className={cn(
          'w-full rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800',
          modalSize,
          className
        )}
      >
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {config.title}
            </h2>
            {config.description && (
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                {config.description}
              </p>
            )}
          </div>
          {showCloseButton && (
            <button
              onClick={close}
              className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-200"
              type="button"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {children}

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-4">
            {showCancelButton && (
              <Button
                type="button"
                variant="outline"
                onClick={close}
                disabled={state.isSubmitting}
              >
                {config.ui?.cancelButtonText || 'Cancelar'}
              </Button>
            )}
            <Button
              type="submit"
              disabled={state.isSubmitting}
            >
              {state.isSubmitting ? 'Procesando...' : (config.ui?.submitButtonText || 'Guardar')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CrudModal;
