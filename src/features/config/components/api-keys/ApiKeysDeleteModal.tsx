'use client';

import React from 'react';
import { Modal } from '@/features/core/components';
import { useDeleteApiKey } from '../../hooks/use-api-keys';
import { ApiKey } from '../../schemas/api-keys.schemas';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Key, Shield } from 'lucide-react';
import { invalidateQueries } from '@/lib/api/react-query-client';

interface ApiKeysDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: ApiKey | null;
  onSuccess?: () => void;
}

export function ApiKeysDeleteModal({ isOpen, onClose, apiKey, onSuccess }: ApiKeysDeleteModalProps) {
  const deleteApiKeyMutation = useDeleteApiKey();

  const handleDelete = () => {
    if (!apiKey) return;

    deleteApiKeyMutation.mutate(apiKey.id, {
      onSuccess: () => {
        onClose();
        invalidateQueries(['apiKeys']);
        onSuccess?.();
      },
    });
  };

  if (!apiKey) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Eliminar API Key"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteApiKeyMutation.isPending}
          >
            {deleteApiKeyMutation.isPending ? 'Eliminando...' : 'Eliminar API Key'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertTriangle className="h-8 w-8 text-red-500" />
          <div>
            <h3 className="text-lg font-medium text-red-900">
              ¿Estás seguro de que quieres eliminar esta API key?
            </h3>
            <p className="text-sm text-red-700 mt-1">
              Esta acción no se puede deshacer y puede afectar la funcionalidad del sistema.
            </p>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-start gap-3">
            <Key className="h-5 w-5 text-gray-400 mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h4 className="font-medium text-gray-900">{apiKey.name}</h4>
                {apiKey.isPrimary && (
                  <Shield className="h-4 w-4 text-blue-500" />
                )}
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Servicio:</span> {apiKey.service}
                </div>
                <div>
                  <span className="font-medium">Ambiente:</span> {apiKey.environment}
                </div>
                <div>
                  <span className="font-medium">Tipo:</span> {apiKey.keyType}
                </div>
                <div>
                  <span className="font-medium">Estado:</span> {apiKey.isActive ? 'Activa' : 'Inactiva'}
                </div>
              </div>
              {apiKey.description && (
                <p className="text-sm text-gray-600 mt-2">{apiKey.description}</p>
              )}
              {apiKey.usageCount > 0 && (
                <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="text-sm text-yellow-800">
                    ⚠️ Esta clave ha sido usada {apiKey.usageCount} veces. Eliminarla puede causar errores en el sistema.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="text-sm text-gray-500">
          <p>• La clave será eliminada permanentemente</p>
          <p>• No se podrá recuperar después de la eliminación</p>
          <p>• Asegúrate de que no esté siendo usada por ningún servicio activo</p>
        </div>
      </div>
    </Modal>
  );
}

export default ApiKeysDeleteModal;
