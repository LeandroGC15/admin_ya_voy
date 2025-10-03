'use client';

import React from 'react';
import { Modal } from '@/features/core/components';
import { useToggleStateStatus } from '../../hooks/use-geography';
import { State } from '../../schemas/geography.schemas';
import { Button } from '@/components/ui/button';
import { Power, PowerOff, AlertTriangle, MapPin, Navigation } from 'lucide-react';
import { invalidateQueries } from '@/lib/api/react-query-client';

interface StatesToggleModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: State | null;
  onSuccess?: () => void;
}

export function StatesToggleModal({ isOpen, onClose, state, onSuccess }: StatesToggleModalProps) {
  const toggleStateMutation = useToggleStateStatus();

  const handleToggle = () => {
    if (!state) return;

    toggleStateMutation.mutate(state.id, {
      onSuccess: () => {
        onClose();
        invalidateQueries(['geography']);
        onSuccess?.();
      },
    });
  };

  if (!state) return null;

  const isActive = state.isActive;
  const newState = !isActive;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${isActive ? 'Desactivar' : 'Activar'} Estado`}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleToggle}
            disabled={toggleStateMutation.isPending}
            className={newState ? 'bg-green-500 hover:bg-green-600' : 'bg-yellow-500 hover:bg-yellow-600'}
          >
            {toggleStateMutation.isPending ? 'Cambiando...' : `${isActive ? 'Desactivar' : 'Activar'} Estado`}
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
              {isActive ? 'Desactivar' : 'Activar'} Estado
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {isActive
                ? 'El estado será desactivado y no estará disponible para nuevos registros.'
                : 'El estado será activado y estará disponible para nuevos registros.'
              }
            </p>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h4 className="font-medium text-gray-900">{state.name}</h4>
                <span className="text-sm text-gray-500">({state.code})</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <span className="font-medium">País:</span> {state.country?.name}
                </div>
                <div>
                  <span className="font-medium">Capital:</span> {state.capital || 'No especificada'}
                </div>
                <div>
                  <span className="font-medium">Estado actual:</span> {isActive ? 'Activo' : 'Inactivo'}
                </div>
                <div>
                  <span className="font-medium">Multiplicador:</span> {state.pricingMultiplier ? `${state.pricingMultiplier}x` : 'No definido'}
                </div>
              </div>
              {state.citiesCount !== undefined && state.citiesCount > 0 && (
                <div className={`mt-2 p-2 border rounded ${
                  isActive
                    ? 'bg-red-50 border-red-200'
                    : 'bg-green-50 border-green-200'
                }`}>
                  <p className={`text-sm flex items-center gap-2 ${
                    isActive ? 'text-red-800' : 'text-green-800'
                  }`}>
                    <Navigation className="h-4 w-4" />
                    {isActive
                      ? `Desactivar afectará ${state.citiesCount} ciudades configuradas.`
                      : `Activar permitirá el uso de ${state.citiesCount} ciudades configuradas.`
                    }
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {isActive && (
          <div className="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium">Advertencia</p>
              <p>Desactivar este estado puede afectar:</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Nuevos registros de usuarios de este estado</li>
                <li>Cálculos de tarifas y precios</li>
                <li>Servicios de geolocalización</li>
                <li>Reportes y estadísticas</li>
              </ul>
            </div>
          </div>
        )}

        <div className="text-sm text-gray-500">
          <p>• El estado del estado cambiará inmediatamente</p>
          <p>• Los usuarios existentes no serán afectados</p>
          <p>• Puedes revertir esta acción en cualquier momento</p>
        </div>
      </div>
    </Modal>
  );
}

export default StatesToggleModal;
