'use client';

import React from 'react';
import { Modal } from '@/features/core/components';
import { useDeleteCity } from '../../hooks/use-geography';
import { City } from '../../schemas/geography.schemas';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Navigation, MapPin, Users } from 'lucide-react';
import { invalidateQueries } from '@/lib/api/react-query-client';

interface CitiesDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  city: City | null;
  onSuccess?: () => void;
}

export function CitiesDeleteModal({ isOpen, onClose, city, onSuccess }: CitiesDeleteModalProps) {
  const deleteCityMutation = useDeleteCity();

  const handleDelete = () => {
    if (!city) return;

    deleteCityMutation.mutate(city.id, {
      onSuccess: () => {
        onClose();
        invalidateQueries(['geography']);
        onSuccess?.();
      },
    });
  };

  if (!city) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Eliminar Ciudad"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteCityMutation.isPending}
          >
            {deleteCityMutation.isPending ? 'Eliminando...' : 'Eliminar Ciudad'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertTriangle className="h-8 w-8 text-red-500" />
          <div>
            <h3 className="text-lg font-medium text-red-900">
              ¿Estás seguro de que quieres eliminar esta ciudad?
            </h3>
            <p className="text-sm text-red-700 mt-1">
              Esta acción no se puede deshacer y puede afectar la configuración geográfica del sistema.
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
                  <span className="font-medium">Estado:</span> {city.isActive ? 'Activa' : 'Inactiva'}
                </div>
                <div>
                  <span className="font-medium">Multiplicador:</span> {city.pricingMultiplier ? `${city.pricingMultiplier}x` : 'No definido'}
                </div>
              </div>
              {city.population && (
                <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                  <Users className="h-4 w-4" />
                  <span>Población: {city.population.toLocaleString()}</span>
                </div>
              )}
              {city.serviceZonesCount !== undefined && city.serviceZonesCount > 0 && (
                <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="text-sm text-yellow-800 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Esta ciudad tiene {city.serviceZonesCount} zonas de servicio configuradas. Eliminarla afectará toda la configuración geográfica relacionada.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="text-sm text-gray-500">
          <p>• La ciudad será eliminada permanentemente</p>
          <p>• No se podrá recuperar después de la eliminación</p>
          <p>• Todas las zonas de servicio asociadas serán afectadas</p>
          <p>• Asegúrate de que no esté siendo usado por ningún servicio activo</p>
        </div>
      </div>
    </Modal>
  );
}

export default CitiesDeleteModal;
