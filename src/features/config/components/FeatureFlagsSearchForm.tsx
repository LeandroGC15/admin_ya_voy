'use client';

import React, { useState } from 'react';
import { FormProvider, CrudSearchForm } from '@/components/forms';
import { featureFlagSearchFormConfig } from '../config/feature-flags-form-config';
import { useFeatureFlags } from '../hooks';
import { FeatureFlag, FeatureFlagsQueryParams } from '../interfaces/config';

interface FeatureFlagsSearchFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectFeatureFlagForUpdate?: (featureFlag: FeatureFlag) => void;
  onSelectFeatureFlagForDelete?: (featureFlag: FeatureFlag) => void;
  onSelectFeatureFlagForToggle?: (featureFlag: FeatureFlag) => void;
  onSelectFeatureFlagForEvaluate?: (featgitureFlag: FeatureFlag) => void;
}

const FeatureFlagsSearchForm: React.FC<FeatureFlagsSearchFormProps> = ({
  isOpen,
  onClose,
  onSelectFeatureFlagForUpdate,
  onSelectFeatureFlagForDelete,
  onSelectFeatureFlagForToggle,
  onSelectFeatureFlagForEvaluate,
}) => {
  const [searchFilters, setSearchFilters] = useState<FeatureFlagsQueryParams>({
    page: 1,
    limit: 20,
  });
  const { data: searchResults, isLoading } = useFeatureFlags(searchFilters);

  if (!isOpen) return null;

  const handleSearch = (filters: FeatureFlagsQueryParams) => {
    setSearchFilters({ ...filters, page: 1 }); // Reset page on new search
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      payments: 'Pagos',
      rides: 'Viajes',
      admin: 'Administración',
      notifications: 'Notificaciones',
      geography: 'Geografía',
      pricing: 'Precios',
      system: 'Sistema',
    };
    return labels[category] || category;
  };

  return (
    <FormProvider config={featureFlagSearchFormConfig}>
      <div className="p-6">
        <CrudSearchForm
          config={featureFlagSearchFormConfig}
          onSearch={handleSearch}
        />

        {/* Display search results */}
        {searchResults && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4">
              Resultados ({searchResults.flags?.length || 0} de {searchResults.total || 0})
            </h3>
            <div className="space-y-3">
              {searchResults.flags?.map((featureFlag: FeatureFlag) => (
                <div key={featureFlag.id} className="border rounded-lg p-4 bg-white shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-lg">{featureFlag.name}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          featureFlag.isEnabled
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {featureFlag.isEnabled ? 'Habilitado' : 'Deshabilitado'}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          featureFlag.isActive
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {featureFlag.isActive ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        <strong>Clave:</strong> <code className="bg-gray-100 px-1 rounded">{featureFlag.key}</code>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {featureFlag.description || 'Sin descripción'}
                      </p>
                      <div className="flex flex-wrap gap-2 text-xs mb-2">
                        <span className="bg-gray-100 px-2 py-1 rounded">
                          Categoría: {getCategoryLabel(featureFlag.category)}
                        </span>
                        <span className="bg-blue-100 px-2 py-1 rounded">
                          Rollout: {featureFlag.rolloutPercentage}%
                        </span>
                      </div>

                      {/* Targeting information */}
                      {(featureFlag.userRoles?.length || featureFlag.userIds?.length || featureFlag.environments?.length) && (
                        <div className="mb-2">
                          <div className="text-xs font-medium text-gray-700 mb-1">Targeting:</div>
                          <div className="flex flex-wrap gap-1">
                            {featureFlag.userRoles?.map((role, index) => (
                              <span key={index} className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">
                                Rol: {role}
                              </span>
                            ))}
                            {featureFlag.userIds?.map((userId, index) => (
                              <span key={index} className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs">
                                Usuario: {userId}
                              </span>
                            ))}
                            {featureFlag.environments?.map((env, index) => (
                              <span key={index} className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                                Ambiente: {env}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Config information */}
                      {featureFlag.config && Object.keys(featureFlag.config).length > 0 && (
                        <div className="mb-2">
                          <div className="text-xs font-medium text-gray-700 mb-1">Configuración:</div>
                          <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                            {JSON.stringify(featureFlag.config, null, 2)}
                          </pre>
                        </div>
                      )}

                      <div className="text-xs text-gray-500">
                        Creado: {new Date(featureFlag.createdAt).toLocaleDateString()}
                        {featureFlag.updatedAt !== featureFlag.createdAt && (
                          <> • Actualizado: {new Date(featureFlag.updatedAt).toLocaleDateString()}</>
                        )}
                        {featureFlag.createdBy && (
                          <> • Por: {featureFlag.createdBy}</>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 ml-4">
                      <button
                        onClick={() => onSelectFeatureFlagForUpdate?.(featureFlag)}
                        className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => onSelectFeatureFlagForToggle?.(featureFlag)}
                        className={`px-3 py-2 rounded text-sm ${
                          featureFlag.isEnabled
                            ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                            : 'bg-green-500 text-white hover:bg-green-600'
                        }`}
                      >
                        {featureFlag.isEnabled ? 'Deshabilitar' : 'Habilitar'}
                      </button>
                      <button
                        onClick={() => onSelectFeatureFlagForEvaluate?.(featureFlag)}
                        className="px-3 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 text-sm"
                      >
                        Evaluar
                      </button>
                      <button
                        onClick={() => onSelectFeatureFlagForDelete?.(featureFlag)}
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
                    onClick={() => setSearchFilters(prev => ({ ...prev, page: Math.max(1, (prev.page || 1) - 1) }))}
                    disabled={searchResults.page <= 1}
                    className="px-3 py-2 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Anterior
                  </button>
                  <span className="px-3 py-2">
                    Página {searchResults.page} de {searchResults.totalPages}
                  </span>
                  <button
                    onClick={() => setSearchFilters(prev => ({ ...prev, page: Math.min(searchResults.totalPages, (prev.page || 1) + 1) }))}
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

        {isLoading && <div className="mt-4 text-center">Buscando feature flags...</div>}
      </div>
    </FormProvider>
  );
};

export default FeatureFlagsSearchForm;
