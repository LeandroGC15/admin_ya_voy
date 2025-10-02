'use client';

import React from 'react';
import { Modal } from '@/features/core/components';
import { useDeleteState } from '../../hooks/use-geography';
import { State } from '../../schemas/geography.schemas';
import { Button } from '@/components/ui/button';
import { AlertTriangle, MapPin, Navigation, Users } from 'lucide-react';
import { invalidateQueries } from '@/lib/api/react-query-client';

interface StatesDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: State | null;
  onSuccess?: () => void;
}

export function StatesDeleteModal({ isOpen, onClose, state, onSuccess }: StatesDeleteModalProps) {
  const deleteStateMutation = useDeleteState();

  const handleDelete = () => {
    if (!state) return;

    deleteStateMutation.mutate(state.id, {
      onSuccess: () => {
        onClose();
        invalidateQueries(['geography']);
        onSuccess?.();
      },
    });
  };

  if (!state) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Eliminar Estado"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteStateMutation.isPending}
          >
            {deleteStateMutation.isPending ? 'Eliminando...' : 'Eliminar Estado'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertTriangle className="h-8 w-8 text-red-500" />
          <div>
            <h3 className="text-lg font-medium text-red-900">
              ¿Estás seguro de que quieres eliminar este estado?
            </h3>
            <p className="text-sm text-red-700 mt-1">
              Esta acción no se puede deshacer y puede afectar la configuración geográfica del sistema.
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
                  <span className="font-medium">Estado:</span> {state.isActive ? 'Activo' : 'Inactivo'}
                </div>
                <div>
                  <span className="font-medium">Multiplicador:</span> {state.pricingMultiplier ? `${state.pricingMultiplier}x` : 'No definido'}
                </div>
              </div>
              {state.population && (
                <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                  <Users className="h-4 w-4" />
                  <span>Población: {state.population.toLocaleString()}</span>
                </div>
              )}
              {state.citiesCount !== undefined && state.citiesCount > 0 && (
                <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="text-sm text-yellow-800 flex items-center gap-2">
                    <Navigation className="h-4 w-4" />
                    Este estado tiene {state.citiesCount} ciudades configuradas. Eliminarlo afectará toda la configuración geográfica relacionada.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="text-sm text-gray-500">
          <p>• El estado será eliminado permanentemente</p>
          <p>• No se podrá recuperar después de la eliminación</p>
          <p>• Todas las ciudades asociadas serán afectadas</p>
          <p>• Asegúrate de que no esté siendo usado por ningún servicio activo</p>
        </div>
      </div>
    </Modal>
  );
}

export default StatesDeleteModal;
