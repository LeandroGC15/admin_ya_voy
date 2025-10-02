'use client';

import React from 'react';
import { Modal } from '@/features/core/components';
import { useDeleteCountry } from '../../hooks/use-geography';
import { Country } from '../../schemas/geography.schemas';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Globe, MapPin, Users } from 'lucide-react';
import { invalidateQueries } from '@/lib/api/react-query-client';

interface CountriesDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  country: Country | null;
  onSuccess?: () => void;
}

export function CountriesDeleteModal({ isOpen, onClose, country, onSuccess }: CountriesDeleteModalProps) {
  const deleteCountryMutation = useDeleteCountry();

  const handleDelete = () => {
    if (!country) return;

    deleteCountryMutation.mutate(country.id, {
      onSuccess: () => {
        onClose();
        invalidateQueries(['geography']);
        onSuccess?.();
      },
    });
  };

  if (!country) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Eliminar País"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteCountryMutation.isPending}
          >
            {deleteCountryMutation.isPending ? 'Eliminando...' : 'Eliminar País'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertTriangle className="h-8 w-8 text-red-500" />
          <div>
            <h3 className="text-lg font-medium text-red-900">
              ¿Estás seguro de que quieres eliminar este país?
            </h3>
            <p className="text-sm text-red-700 mt-1">
              Esta acción no se puede deshacer y puede afectar la configuración geográfica del sistema.
            </p>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-start gap-3">
            <Globe className="h-5 w-5 text-gray-400 mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h4 className="font-medium text-gray-900">{country.name}</h4>
                {country.flag && <span className="text-lg">{country.flag}</span>}
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Código ISO:</span> {country.isoCode2}
                </div>
                <div>
                  <span className="font-medium">Continente:</span> {country.continent}
                </div>
                <div>
                  <span className="font-medium">Capital:</span> {country.capital || 'No especificada'}
                </div>
                <div>
                  <span className="font-medium">Moneda:</span> {country.currencyCode}
                </div>
              </div>
              {country.population && (
                <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                  <Users className="h-4 w-4" />
                  <span>Población: {country.population.toLocaleString()}</span>
                </div>
              )}
              {country.statesCount !== undefined && country.statesCount > 0 && (
                <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="text-sm text-yellow-800 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Este país tiene {country.statesCount} estados configurados. Eliminarlo afectará toda la configuración geográfica relacionada.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="text-sm text-gray-500">
          <p>• El país será eliminado permanentemente</p>
          <p>• No se podrá recuperar después de la eliminación</p>
          <p>• Todos los estados y ciudades asociados serán afectados</p>
          <p>• Asegúrate de que no esté siendo usado por ningún servicio activo</p>
        </div>
      </div>
    </Modal>
  );
}

export default CountriesDeleteModal;
