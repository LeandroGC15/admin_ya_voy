'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useFormContext } from '@/hooks/use-form-manager';
import { FormComponentProps } from '@/types/form-system';
import { cn } from '@/lib/utils';

const modalSizes = {
  sm: 'sm:max-w-md',
  md: 'sm:max-w-lg',
  lg: 'sm:max-w-2xl',
  xl: 'sm:max-w-4xl',
  full: 'sm:max-w-full',
};

export function CrudModal<T extends Record<string, unknown> = Record<string, unknown>, TData = unknown, TVariables = unknown>({
  config,
  children,
  className,
}: FormComponentProps<T, TData, TVariables> & { className?: string }) {
  const { state, close, submit } = useFormContext<T, TData, TVariables>();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submit();
  };

  const modalSize = modalSizes[config.ui?.modalSize || 'md'];
  const showCancelButton = config.ui?.showCancelButton ?? true;

  return (
    <Dialog open={state.isOpen} onOpenChange={(open) => !open && close()}>
      <DialogContent className={cn(modalSize, className)}>
        <DialogHeader>
          <DialogTitle>{config.title}</DialogTitle>
          {config.description && (
            <DialogDescription>{config.description}</DialogDescription>
          )}
        </DialogHeader>

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
      </DialogContent>
    </Dialog>
  );
}

export default CrudModal;
