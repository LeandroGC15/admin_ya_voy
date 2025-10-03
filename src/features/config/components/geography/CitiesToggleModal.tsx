'use client';

import React from 'react';
import { Modal } from '@/features/core/components';
import { useToggleCityStatus } from '../../hooks/use-geography';
import { City } from '../../schemas/geography.schemas';
import { Button } from '@/components/ui/button';
import { Power, PowerOff, AlertTriangle, Navigation, MapPin } from 'lucide-react';
import { invalidateQueries } from '@/lib/api/react-query-client';

interface CitiesToggleModalProps {
  isOpen: boolean;
  onClose: () => void;
  city: City | null;
  onSuccess?: () => void;
}

export function CitiesToggleModal({ isOpen, onClose, city, onSuccess }: CitiesToggleModalProps) {
  const toggleCityMutation = useToggleCityStatus();

  const handleToggle = () => {
    if (!city) return;

    toggleCityMutation.mutate(city.id, {
      onSuccess: () => {
        onClose();
        invalidateQueries(['geography']);
        onSuccess?.();
      },
    });
  };

  if (!city) return null;

  const isActive = city.isActive;
  const newState = !isActive;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${isActive ? 'Desactivar' : 'Activar'} Ciudad`}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleToggle}
            disabled={toggleCityMutation.isPending}
            className={newState ? 'bg-green-500 hover:bg-green-600' : 'bg-yellow-500 hover:bg-yellow-600'}
          >
            {toggleCityMutation.isPending ? 'Cambiando...' : `${isActive ? 'Desactivar' : 'Activar'} Ciudad`}
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
              {isActive ? 'Desactivar' : 'Activar'} Ciudad
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {isActive
                ? 'La ciudad será desactivada y no estará disponible para nuevos registros.'
                : 'La ciudad será activada y estará disponible para nuevos registros.'
              }
            </p>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-start gap-3">
            <Navigation className="h-5 w-5 text-gray-400 mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h4 className="font-medium text-gray-900">{city.name}</h4>
                <span className="text-sm text-gray-500">
                  ({city.latitude ? Number(city.latitude).toFixed(4) : 'N/A'}, {city.longitude ? Number(city.longitude).toFixed(4) : 'N/A'})
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Estado:</span> {city.state?.name}
                </div>
                <div>
                  <span className="font-medium">País:</span> {city.state?.country?.name}
                </div>
                <div>
                  <span className="font-medium">Estado actual:</span> {isActive ? 'Activa' : 'Inactiva'}
                </div>
                <div>
                  <span className="font-medium">Multiplicador:</span> {city.pricingMultiplier ? `${city.pricingMultiplier}x` : 'No definido'}
                </div>
              </div>
              {city.serviceZonesCount !== undefined && city.serviceZonesCount > 0 && (
                <div className={`mt-2 p-2 border rounded ${
                  isActive
                    ? 'bg-red-50 border-red-200'
                    : 'bg-green-50 border-green-200'
                }`}>
                  <p className={`text-sm flex items-center gap-2 ${
                    isActive ? 'text-red-800' : 'text-green-800'
                  }`}>
                    <MapPin className="h-4 w-4" />
                    {isActive
                      ? `Desactivar afectará ${city.serviceZonesCount} zonas de servicio.`
                      : `Activar permitirá el uso de ${city.serviceZonesCount} zonas de servicio.`
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
              <p>Desactivar esta ciudad puede afectar:</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Nuevos registros de usuarios de esta ciudad</li>
                <li>Cálculos de tarifas y precios</li>
                <li>Servicios de geolocalización</li>
                <li>Reportes y estadísticas</li>
                <li>Zonas de servicio premium</li>
              </ul>
            </div>
          </div>
        )}

        <div className="text-sm text-gray-500">
          <p>• El estado de la ciudad cambiará inmediatamente</p>
          <p>• Los usuarios existentes no serán afectados</p>
          <p>• Puedes revertir esta acción en cualquier momento</p>
        </div>
      </div>
    </Modal>
  );
}

export default CitiesToggleModal;
