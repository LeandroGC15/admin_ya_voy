'use client';

import React from 'react';
import { Modal } from '@/features/core/components';
import { useDeleteRideTier } from '../../hooks';
import { RideTier } from '../../schemas/pricing.schemas';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { invalidateQueries } from '@/lib/api/react-query-client';

interface RideTiersDeleteModalProps {
  tier: RideTier | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function RideTiersDeleteModal({ tier, isOpen, onClose, onSuccess }: RideTiersDeleteModalProps) {
  const deleteRideTierMutation = useDeleteRideTier();

  const handleDelete = () => {
    if (!tier) return;

    deleteRideTierMutation.mutate(tier.id, {
      onSuccess: () => {
        onClose();
        invalidateQueries(['pricing']);
        onSuccess?.();
      },
    });
  };

  if (!tier) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Eliminar Nivel de Tarifa"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteRideTierMutation.isPending}
          >
            {deleteRideTierMutation.isPending ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Esta acción no se puede deshacer. Eliminará permanentemente el nivel de tarifa
            y puede afectar a los cálculos de precios existentes.
          </AlertDescription>
        </Alert>

        <div className="p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-lg mb-2">Detalles del nivel a eliminar:</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="font-medium">Nombre:</span>
              <span>{tier.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Tarifa Base:</span>
              <span>${(tier.baseFare / 100).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Estado:</span>
              <span className={tier.isActive ? 'text-green-600' : 'text-red-600'}>
                {tier.isActive ? 'Activo' : 'Inactivo'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Prioridad:</span>
              <span>{tier.priority}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Pasajeros:</span>
              <span>{tier.minPassengers}-{tier.maxPassengers}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <AlertTriangle className="h-5 w-5 text-yellow-600" />
          <div>
            <p className="text-sm font-medium text-yellow-800">
              ¿Está seguro de que desea eliminar este nivel de tarifa?
            </p>
            <p className="text-xs text-yellow-700 mt-1">
              Los viajes existentes que usen este nivel no se verán afectados,
              pero no podrá crear nuevos viajes con este nivel.
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default RideTiersDeleteModal;
