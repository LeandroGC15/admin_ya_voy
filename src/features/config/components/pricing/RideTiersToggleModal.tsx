'use client';

import React from 'react';
import { Modal } from '@/features/core/components';
import { useToggleRideTierStatus } from '../../hooks/use-pricing';
import { RideTier } from '../../schemas/pricing.schemas';
import { Button } from '@/components/ui/button';
import { Power, PowerOff, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface RideTiersToggleModalProps {
  isOpen: boolean;
  onClose: () => void;
  tier: RideTier | null;
  onSuccess?: () => void;
}

export function RideTiersToggleModal({ isOpen, onClose, tier, onSuccess }: RideTiersToggleModalProps) {
  const toggleTierMutation = useToggleRideTierStatus();

  const handleToggle = () => {
    if (!tier) return;

    toggleTierMutation.mutate(
      { id: tier.id },
      {
        onSuccess: () => {
          onClose();
          onSuccess?.();
        },
      }
    );
  };

  if (!tier) return null;

  const isActive = tier.isActive;
  const newState = !isActive;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${isActive ? 'Desactivar' : 'Activar'} Nivel de Tarifa`}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            variant={isActive ? "destructive" : "default"}
            onClick={handleToggle}
            disabled={toggleTierMutation.isPending}
          >
            {toggleTierMutation.isPending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                {isActive ? 'Desactivando...' : 'Activando...'}
              </>
            ) : (
              <>
                {isActive ? <PowerOff className="h-4 w-4 mr-2" /> : <Power className="h-4 w-4 mr-2" />}
                {isActive ? 'Desactivar' : 'Activar'}
              </>
            )}
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-full ${isActive ? 'bg-green-100' : 'bg-red-100'}`}>
            {isActive ? (
              <CheckCircle className="h-6 w-6 text-green-600" />
            ) : (
              <XCircle className="h-6 w-6 text-red-600" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold">{tier.name}</h3>
            <p className="text-sm text-muted-foreground">
              Estado actual: <span className={`font-medium ${isActive ? 'text-green-600' : 'text-red-600'}`}>
                {isActive ? 'Activo' : 'Inactivo'}
              </span>
            </p>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">
                ¿Estás seguro de que quieres {isActive ? 'desactivar' : 'activar'} este nivel de tarifa?
              </h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p>
                  Al {isActive ? 'desactivar' : 'activar'} el nivel &ldquo;{tier.name}&rdquo;, sucederá lo siguiente:
                </p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Los usuarios ya no podrán seleccionar este nivel para nuevos viajes</li>
                  <li>Los viajes en progreso no se verán afectados</li>
                  <li>El estado cambiará inmediatamente en el sistema</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className={`p-1 rounded ${newState ? 'bg-green-100' : 'bg-red-100'}`}>
              {newState ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
            </div>
            <div>
              <h4 className="font-medium text-gray-900">
                Nuevo estado: <span className={`font-bold ${newState ? 'text-green-600' : 'text-red-600'}`}>
                  {newState ? 'ACTIVO' : 'INACTIVO'}
                </span>
              </h4>
              <p className="text-sm text-gray-600 mt-1">
                {newState
                  ? 'El nivel estará disponible para nuevos viajes'
                  : 'El nivel ya no estará disponible para nuevos viajes'
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

