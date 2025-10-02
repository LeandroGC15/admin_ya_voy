'use client';

import React from 'react';
import { Modal } from '@/features/core/components';
import { useToggleCountryStatus } from '../../hooks/use-geography';
import { Country } from '../../schemas/geography.schemas';
import { Button } from '@/components/ui/button';
import { Power, PowerOff, AlertTriangle, Globe, MapPin } from 'lucide-react';
import { invalidateQueries } from '@/lib/api/react-query-client';

interface CountriesToggleModalProps {
  isOpen: boolean;
  onClose: () => void;
  country: Country | null;
  onSuccess?: () => void;
}

export function CountriesToggleModal({ isOpen, onClose, country, onSuccess }: CountriesToggleModalProps) {
  const toggleCountryMutation = useToggleCountryStatus();

  const handleToggle = () => {
    if (!country) return;

    toggleCountryMutation.mutate(country.id, {
      onSuccess: () => {
        onClose();
        invalidateQueries(['geography']);
        onSuccess?.();
      },
    });
  };

  if (!country) return null;

  const isActive = country.isActive;
  const newState = !isActive;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${isActive ? 'Desactivar' : 'Activar'} País`}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleToggle}
            disabled={toggleCountryMutation.isPending}
            className={newState ? 'bg-green-500 hover:bg-green-600' : 'bg-yellow-500 hover:bg-yellow-600'}
          >
            {toggleCountryMutation.isPending ? 'Cambiando...' : `${isActive ? 'Desactivar' : 'Activar'} País`}
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
              {isActive ? 'Desactivar' : 'Activar'} País
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {isActive
                ? 'El país será desactivado y no estará disponible para nuevos registros.'
                : 'El país será activado y estará disponible para nuevos registros.'
              }
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
                  <span className="font-medium">Estado actual:</span> {isActive ? 'Activo' : 'Inactivo'}
                </div>
              </div>
              {country.statesCount !== undefined && country.statesCount > 0 && (
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
                      ? `Desactivar afectará ${country.statesCount} estados y todas sus ciudades.`
                      : `Activar permitirá el uso de ${country.statesCount} estados configurados.`
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
              <p>Desactivar este país puede afectar:</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Nuevos registros de usuarios de este país</li>
                <li>Servicios de geolocalización</li>
                <li>Cálculos de tarifas y precios</li>
                <li>Reportes y estadísticas</li>
              </ul>
            </div>
          </div>
        )}

        <div className="text-sm text-gray-500">
          <p>• El estado del país cambiará inmediatamente</p>
          <p>• Los usuarios existentes no serán afectados</p>
          <p>• Puedes revertir esta acción en cualquier momento</p>
        </div>
      </div>
    </Modal>
  );
}

export default CountriesToggleModal;
