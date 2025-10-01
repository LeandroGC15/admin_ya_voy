'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal } from '@/features/core/components';
import { useForceRotateApiKey } from '../../hooks/use-api-keys';
import { forceRotateApiKeySchema, type ForceRotateApiKeyInput, type ApiKey } from '../../schemas/api-keys.schemas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertTriangle, Shield, Zap } from 'lucide-react';
import { invalidateQueries } from '@/lib/api/react-query-client';

interface ApiKeysForceRotateModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: ApiKey | null;
  onSuccess?: () => void;
}

export function ApiKeysForceRotateModal({ isOpen, onClose, apiKey, onSuccess }: ApiKeysForceRotateModalProps) {
  const form = useForm<ForceRotateApiKeyInput>({
    resolver: zodResolver(forceRotateApiKeySchema),
    defaultValues: {
      reason: '',
    },
  });

  const forceRotateApiKeyMutation = useForceRotateApiKey();

  const handleSubmit = (data: ForceRotateApiKeyInput) => {
    if (!apiKey) return;

    forceRotateApiKeyMutation.mutate(
      { id: apiKey.id, data },
      {
        onSuccess: () => {
          form.reset();
          onClose();
          invalidateQueries(['apiKeys']);
          onSuccess?.();
        },
      }
    );
  };

  if (!apiKey) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Rotación Forzada de API Key"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={form.handleSubmit(handleSubmit)}
            disabled={forceRotateApiKeyMutation.isPending}
            className="bg-red-600 hover:bg-red-700"
          >
            {forceRotateApiKeyMutation.isPending ? 'Forzando rotación...' : 'Forzar Rotación'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="relative">
            <Shield className="h-8 w-8 text-red-500" />
            <Zap className="h-4 w-4 text-red-600 absolute -top-1 -right-1" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-red-900">
              Rotación Forzada de Emergencia
            </h3>
            <p className="text-sm text-red-700 mt-1">
              Acción crítica que requiere justificación obligatoria. Use solo en casos de compromiso de seguridad.
            </p>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 mb-3">API Key comprometida</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Nombre:</span> {apiKey.name}
            </div>
            <div>
              <span className="font-medium">Servicio:</span> {apiKey.service}
            </div>
            <div>
              <span className="font-medium">Ambiente:</span> {apiKey.environment}
            </div>
            <div>
              <span className="font-medium">Estado:</span> {apiKey.isActive ? 'Activa' : 'Inactiva'}
            </div>
          </div>
        </div>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="reason">Razón de la rotación forzada *</Label>
            <Input
              id="reason"
              {...form.register('reason')}
              placeholder="Ej: Posible compromiso de seguridad detectado"
              className="border-red-300 focus:border-red-500"
            />
            {form.formState.errors.reason && (
              <p className="text-sm text-red-500">{form.formState.errors.reason.message}</p>
            )}
          </div>
        </form>

        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
            <div>
              <p className="text-sm text-red-800 font-medium">
                ⚠️ Acción irreversible con impacto crítico
              </p>
              <ul className="text-sm text-red-700 mt-1 space-y-1">
                <li>• La clave actual será invalidada inmediatamente</li>
                <li>• Todos los servicios que la usan dejarán de funcionar</li>
                <li>• Se requiere actualización urgente en todos los sistemas</li>
                <li>• Esta acción será auditada y requiere justificación</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>¿Estás seguro?</strong> Esta acción debería usarse solo en casos de:
          </p>
          <ul className="text-sm text-blue-700 mt-2 space-y-1 ml-4">
            <li>• Exposición accidental de la clave en logs o código</li>
            <li>• Compromiso de seguridad confirmado</li>
            <li>• Violación de políticas de seguridad</li>
            <li>• Cambio obligatorio por requerimientos de cumplimiento</li>
          </ul>
        </div>
      </div>
    </Modal>
  );
}

export default ApiKeysForceRotateModal;

