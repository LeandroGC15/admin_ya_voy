'use client';

import React, { useState } from 'react';
import { FormProvider, CrudSearchForm } from '@/components/forms';
import { createApiKeySearchFormConfig } from '../config/api-keys-form-config';
import { useApiKeys } from '../hooks';
import { ApiKeysQueryParams } from '../interfaces/config';
import { ApiKeyListItem } from '../schemas/api-keys.schemas';
import { X } from 'lucide-react';

interface ApiKeysSearchFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectApiKeyForUpdate?: (apiKey: ApiKeyListItem) => void;
  onSelectApiKeyForDelete?: (apiKey: ApiKeyListItem) => void;
  onSelectApiKeyForToggle?: (apiKey: ApiKeyListItem) => void;
  onSelectApiKeyForRotate?: (apiKey: ApiKeyListItem) => void;
}

const ApiKeysSearchForm: React.FC<ApiKeysSearchFormProps> = ({
  isOpen,
  onClose,
  onSelectApiKeyForUpdate,
  onSelectApiKeyForDelete,
  onSelectApiKeyForToggle,
  onSelectApiKeyForRotate,
}) => {
  const [searchFilters, setSearchFilters] = useState<Partial<ApiKeysQueryParams>>({});
  const { data: searchResults, isLoading } = useApiKeys(searchFilters);

  if (!isOpen) return null;

  const handleSearch = (filters: Partial<ApiKeysQueryParams>) => {
    setSearchFilters(filters);
  };

  const getServiceLabel = (service: string) => {
    const labels: Record<string, string> = {
      stripe: 'Stripe',
      twilio: 'Twilio',
      firebase: 'Firebase',
      google_maps: 'Google Maps',
      sendgrid: 'SendGrid',
      aws: 'AWS',
      azure: 'Azure',
      google_analytics: 'Google Analytics',
    };
    return labels[service] || service;
  };

  const getEnvironmentLabel = (environment: string) => {
    const labels: Record<string, string> = {
      development: 'Desarrollo',
      staging: 'Staging',
      production: 'Producción',
    };
    return labels[environment] || environment;
  };


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 bg-opacity-50">
      <div className="w-full max-w-6xl bg-white rounded-lg shadow-xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6 sticky top-0 bg-white pb-4 border-b">
          <h2 className="text-2xl font-semibold text-gray-900">Buscar API Keys</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <FormProvider config={createApiKeySearchFormConfig()}>
          <div className="p-6">
            <CrudSearchForm
              config={createApiKeySearchFormConfig()}
              onSearch={handleSearch}
            />

        {/* Display search results */}
        {searchResults && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4">
              Resultados ({searchResults.keys?.length || 0} de {searchResults.total || 0})
            </h3>
            <div className="space-y-3">
              {searchResults.keys?.map((apiKey: ApiKeyListItem) => (
                <div key={apiKey.id} className="border rounded-lg p-4 bg-white shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-lg">{apiKey.name}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          apiKey.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {apiKey.isActive ? 'Activa' : 'Inactiva'}
                        </span>
                        {apiKey.isPrimary && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Primaria
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs mb-2">
                        <span className="bg-gray-100 px-2 py-1 rounded">
                          Servicio: {getServiceLabel(apiKey.service)}
                        </span>
                        <span className="bg-gray-100 px-2 py-1 rounded">
                          Ambiente: {getEnvironmentLabel(apiKey.environment)}
                        </span>
                        {apiKey.usageCount !== undefined && apiKey.usageCount > 0 && (
                          <span className="bg-blue-100 px-2 py-1 rounded">
                            Uso: {apiKey.usageCount}
                          </span>
                        )}
                      </div>
                      {apiKey.expiresAt && (
                        <div className="text-xs text-gray-500">
                          Expira: {new Date(apiKey.expiresAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-2 ml-4">
                      <button
                        onClick={() => onSelectApiKeyForUpdate?.(apiKey)}
                        className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => onSelectApiKeyForToggle?.(apiKey)}
                        className={`px-3 py-2 rounded text-sm ${
                          apiKey.isActive
                            ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                            : 'bg-green-500 text-white hover:bg-green-600'
                        }`}
                      >
                        {apiKey.isActive ? 'Desactivar' : 'Activar'}
                      </button>
                      <button
                        onClick={() => onSelectApiKeyForRotate?.(apiKey)}
                        className="px-3 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 text-sm"
                      >
                        Rotar
                      </button>
                      <button
                        onClick={() => onSelectApiKeyForDelete?.(apiKey)}
                        className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {searchResults.totalPages > 1 && (
              <div className="mt-6 flex justify-center">
                <div className="flex gap-2">
                  <button
                    onClick={() => setSearchFilters((prev: Partial<ApiKeysQueryParams>) => ({ ...prev, page: Math.max(1, (prev.page || 1) - 1) }))}
                    disabled={searchResults.page <= 1}
                    className="px-3 py-2 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Anterior
                  </button>
                  <span className="px-3 py-2">
                    Página {searchResults.page} de {searchResults.totalPages}
                  </span>
                  <button
                    onClick={() => setSearchFilters((prev: Partial<ApiKeysQueryParams>) => ({ ...prev, page: Math.min(searchResults.totalPages, (prev.page || 1) + 1) }))}
                    disabled={searchResults.page >= searchResults.totalPages}
                    className="px-3 py-2 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

            {isLoading && <div className="mt-4 text-center">Buscando API keys...</div>}
          </div>
        </FormProvider>
      </div>
    </div>
  );
};

export default ApiKeysSearchForm;
