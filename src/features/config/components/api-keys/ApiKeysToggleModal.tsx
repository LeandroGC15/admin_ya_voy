'use client';

import React from 'react';
import { Modal } from '@/features/core/components';
import { useToggleApiKey } from '../../hooks/use-api-keys';
import { ApiKey } from '../../schemas/api-keys.schemas';
import { Button } from '@/components/ui/button';
import { Power, PowerOff, AlertTriangle } from 'lucide-react';
import { invalidateQueries } from '@/lib/api/react-query-client';

interface ApiKeysToggleModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: ApiKey | null;
  onSuccess?: () => void;
}

export function ApiKeysToggleModal({ isOpen, onClose, apiKey, onSuccess }: ApiKeysToggleModalProps) {
  const toggleApiKeyMutation = useToggleApiKey();

  const handleToggle = () => {
    if (!apiKey) return;

    toggleApiKeyMutation.mutate(
      { id: apiKey.id, data: { active: !apiKey.isActive } },
      {
        onSuccess: () => {
          onClose();
          invalidateQueries(['apiKeys']);
          onSuccess?.();
        },
      }
    );
  };

  if (!apiKey) return null;

  const isActive = apiKey.isActive;
  const newState = !isActive;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${isActive ? 'Desactivar' : 'Activar'} API Key`}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleToggle}
            disabled={toggleApiKeyMutation.isPending}
            className={newState ? 'bg-green-500 hover:bg-green-600' : 'bg-yellow-500 hover:bg-yellow-600'}
          >
            {toggleApiKeyMutation.isPending ? 'Cambiando...' : `${isActive ? 'Desactivar' : 'Activar'} Clave`}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className={`flex items-center gap-3 p-4 border rounded-lg ${
          newState ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'
        }`}>
          {newState ? (
            <Power className="h-8 w-8 text-green-500" />
          ) : (
            <PowerOff className="h-8 w-8 text-yellow-500" />
          )}
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              {isActive ? 'Desactivar' : 'Activar'} API Key
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {isActive
                ? 'La clave será desactivada y no podrá ser usada hasta que se reactive.'
                : 'La clave será activada y podrá ser usada nuevamente.'
              }
            </p>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Detalles de la clave</h4>
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
              <span className="font-medium">Estado actual:</span>
              <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {isActive ? 'Activa' : 'Inactiva'}
              </span>
            </div>
            <div>
              <span className="font-medium">Nuevo estado:</span>
              <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                newState ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {newState ? 'Activa' : 'Inactiva'}
              </span>
            </div>
          </div>
        </div>

        {!isActive && apiKey.usageCount === 0 && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              💡 Esta clave nunca ha sido usada. Es seguro activarla.
            </p>
          </div>
        )}

        {isActive && apiKey.usageCount > 0 && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="text-sm text-yellow-800 font-medium">
                  Advertencia: Clave en uso activo
                </p>
                <p className="text-sm text-yellow-700 mt-1">
                  Esta clave ha sido usada {apiKey.usageCount} veces. Desactivarla puede causar errores en servicios que dependan de ella.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="text-sm text-gray-500">
          <p>• El cambio de estado será inmediato</p>
          <p>• Los servicios pueden requerir reinicio para detectar el cambio</p>
          <p>• Puedes revertir esta acción en cualquier momento</p>
        </div>
      </div>
    </Modal>
  );
}

export default ApiKeysToggleModal;

