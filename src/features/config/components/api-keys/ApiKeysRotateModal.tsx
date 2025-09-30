'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal } from '@/features/core/components';
import { useRotateApiKey } from '../../hooks/use-api-keys';
import { rotateApiKeySchema, type RotateApiKeyInput, type ApiKey } from '../../schemas/api-keys.schemas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RefreshCw, AlertTriangle } from 'lucide-react';

interface ApiKeysRotateModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: ApiKey | null;
  onSuccess?: () => void;
}

export function ApiKeysRotateModal({ isOpen, onClose, apiKey, onSuccess }: ApiKeysRotateModalProps) {
  const form = useForm<RotateApiKeyInput>({
    resolver: zodResolver(rotateApiKeySchema),
    defaultValues: {
      newKeyValue: '',
      reason: '',
    },
  });

  const rotateApiKeyMutation = useRotateApiKey();

  const handleSubmit = (data: RotateApiKeyInput) => {
    if (!apiKey) return;

    rotateApiKeyMutation.mutate(
      { id: apiKey.id, data },
      {
        onSuccess: () => {
          form.reset();
          onClose();
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
      title="Rotar API Key"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={form.handleSubmit(handleSubmit)}
            disabled={rotateApiKeyMutation.isPending}
            className="bg-purple-500 hover:bg-purple-600"
          >
            {rotateApiKeyMutation.isPending ? 'Rotando...' : 'Rotar Clave'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <RefreshCw className="h-8 w-8 text-purple-500" />
          <div>
            <h3 className="text-lg font-medium text-purple-900">
              Rotar API Key
            </h3>
            <p className="text-sm text-purple-700 mt-1">
              Proporciona el nuevo valor de la clave. La clave actual quedará inactiva y deberá actualizarse en todos los servicios.
            </p>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 mb-3">API Key a rotar</h4>
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
              <span className="font-medium">Última rotación:</span>
              {apiKey.lastRotated ? new Date(apiKey.lastRotated).toLocaleDateString() : 'Nunca'}
            </div>
          </div>
        </div>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="newKeyValue">Nuevo valor de la clave *</Label>
            <Input
              id="newKeyValue"
              type="password"
              {...form.register('newKeyValue')}
              placeholder="Ingresa el nuevo valor de la API key"
            />
            {form.formState.errors.newKeyValue && (
              <p className="text-sm text-red-500">{form.formState.errors.newKeyValue.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="reason">Razón de la rotación (opcional)</Label>
            <Input
              id="reason"
              {...form.register('reason')}
              placeholder="Ej: Cambio de seguridad programado"
            />
            {form.formState.errors.reason && (
              <p className="text-sm text-red-500">{form.formState.errors.reason.message}</p>
            )}
          </div>
        </form>

        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <p className="text-sm text-yellow-800 font-medium">
                Importante: Actualización requerida
              </p>
              <p className="text-sm text-yellow-700 mt-1">
                La clave actual quedará inactiva inmediatamente. Asegúrate de que el nuevo valor sea válido antes de proceder.
              </p>
            </div>
          </div>
        </div>

        <div className="text-sm text-gray-500">
          <p>• El nuevo valor de la clave será establecido inmediatamente</p>
          <p>• La clave anterior quedará inactiva inmediatamente</p>
          <p>• Los servicios que usen la clave antigua dejarán de funcionar</p>
          <p>• La configuración de la clave (permisos, políticas, etc.) se mantendrá</p>
        </div>
      </div>
    </Modal>
  );
}

export default ApiKeysRotateModal;
