'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Key, Settings } from 'lucide-react';
import FeatureFlagsSearchForm from '@/features/config/components/FeatureFlagsSearchForm';
import {
  useApiKeysAnalytics,
  useCategoriesOverview,
  useRolloutStatus,
  useRotationStats
} from '@/features/config/hooks';
import { ApiKey } from '@/features/config/schemas/api-keys.schemas';
import { FeatureFlag } from '@/features/config/interfaces/config';

export default function ConfigDashboardPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'api-keys' | 'feature-flags' | 'general'>('overview');
  const [featureFlagsSearchModalOpen, setFeatureFlagsSearchModalOpen] = useState(false);

  // Analytics data
  const { data: apiKeysAnalytics } = useApiKeysAnalytics();
  const { data: categoriesOverview } = useCategoriesOverview();
  const { data: rolloutStatus } = useRolloutStatus();
  const { data: rotationStats } = useRotationStats();

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Panel de Configuración</h1>
        <p className="text-gray-600">Gestiona API Keys, Feature Flags y configuraciones del sistema</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* API Keys Stats */}
        {apiKeysAnalytics && (
          <>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500">API Keys Total</h3>
              <p className="text-2xl font-bold text-gray-900">{apiKeysAnalytics.analytics.totalKeys}</p>
              <div className="flex gap-4 mt-2 text-xs">
                <span className="text-green-600">✓ {apiKeysAnalytics.analytics.activeKeys} activas</span>
                <span className="text-red-600">✗ {apiKeysAnalytics.analytics.expired} expiradas</span>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500">Próximas a Expirar</h3>
              <p className="text-2xl font-bold text-yellow-600">{apiKeysAnalytics.analytics.expiringSoon}</p>
              <p className="text-xs text-gray-500 mt-1">En los próximos 30 días</p>
            </div>
          </>
        )}

        {/* Feature Flags Stats */}
        {rolloutStatus && (
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Feature Flags</h3>
            <p className="text-2xl font-bold text-blue-600">{rolloutStatus.rolloutStatus.totalEnabled}</p>
            <p className="text-xs text-gray-500 mt-1">
              Rollout promedio: {Math.round(rolloutStatus.rolloutStatus.averageRolloutPercentage)}%
            </p>
          </div>
        )}
      </div>

      {/* Main Navigation */}
      <div className="mb-6">
        <nav className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'overview'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Vista General
          </button>
          <button
            onClick={() => setActiveTab('api-keys')}
            className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'api-keys'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            API Keys
          </button>
          <button
            onClick={() => setActiveTab('feature-flags')}
            className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'feature-flags'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Feature Flags
          </button>
          <button
            onClick={() => setActiveTab('general')}
            className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'general'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            General
          </button>
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* API Keys Card */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Key className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">API Keys</h3>
                    <p className="text-sm text-gray-600">Vista general y gestión completa</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total</span>
                  <span className="font-semibold">{apiKeysAnalytics?.analytics.totalKeys || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Activas</span>
                  <span className="font-semibold text-green-600">{apiKeysAnalytics?.analytics.activeKeys || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Expiran pronto</span>
                  <span className="font-semibold text-yellow-600">{apiKeysAnalytics?.analytics.expiringSoon || 0}</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t">
                <Link href="/dashboard/config/api-keys">
                  <Button className="w-full">
                    Gestionar API Keys
                  </Button>
                </Link>
              </div>
            </div>

            {/* Feature Flags Card */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Settings className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Feature Flags</h3>
                    <p className="text-sm text-gray-600">Control de funcionalidades</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total</span>
                  <span className="font-semibold">{categoriesOverview ? Object.values(categoriesOverview.overview).reduce((acc, cat) => acc + cat.total, 0) : 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Habilitadas</span>
                  <span className="font-semibold text-green-600">{categoriesOverview ? Object.values(categoriesOverview.overview).reduce((acc, cat) => acc + cat.enabled, 0) : 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Rollout completo</span>
                  <span className="font-semibold text-blue-600">{rolloutStatus?.rolloutStatus.fullRollout || 0}</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t">
                <Button
                  className="w-full"
                  onClick={() => setActiveTab('feature-flags')}
                >
                  Gestionar Feature Flags
                </Button>
              </div>
            </div>

            {/* General Settings Card */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <Settings className="h-6 w-6 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Configuración General</h3>
                    <p className="text-sm text-gray-600">Ajustes del sistema</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="text-sm text-gray-600">
                  Configuraciones generales del sistema, preferencias y ajustes administrativos.
                </div>
              </div>
              <div className="mt-4 pt-4 border-t">
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => setActiveTab('general')}
                >
                  Ver Configuración
                </Button>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h4 className="text-lg font-semibold mb-4">Actividad Reciente</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">API Keys activas monitoreadas</p>
                    <p className="text-xs text-gray-600">{apiKeysAnalytics?.analytics.activeKeys || 0} claves funcionando correctamente</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Rotaciones pendientes</p>
                    <p className="text-xs text-gray-600">{rotationStats?.keysNeedingRotation || 0} claves necesitan atención</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h4 className="text-lg font-semibold mb-4">Sugerencias</h4>
              <div className="space-y-3">
                {(apiKeysAnalytics?.analytics.expiringSoon || 0) > 0 && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      ⚠️ {apiKeysAnalytics?.analytics.expiringSoon} API keys expiran pronto. Considera renovarlas.
                    </p>
                  </div>
                )}
                {(apiKeysAnalytics?.analytics.expired || 0) > 0 && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-800">
                      🚨 {apiKeysAnalytics?.analytics.expired} API keys han expirado. Reemplázalas inmediatamente.
                    </p>
                  </div>
                )}
                {(!apiKeysAnalytics?.analytics.expiringSoon && !apiKeysAnalytics?.analytics.expired) && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800">
                      ✅ Todas las API keys están en buen estado.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* API Keys Tab */}
      {activeTab === 'api-keys' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">API Keys - Vista General</h2>
              <p className="text-sm text-gray-600">Vista general de las claves API del sistema</p>
            </div>
            <div className="flex gap-3">
              <Link href="/dashboard/config/api-keys">
                <Button variant="default">
                  Gestión Completa
                </Button>
              </Link>
            </div>
          </div>

          {/* API Keys Analytics */}
          {apiKeysAnalytics && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg border">
                <h4 className="font-medium text-blue-900">Por Servicio</h4>
                <div className="mt-2 space-y-1">
                  {Object.entries(apiKeysAnalytics.analytics.byService).slice(0, 3).map(([service, stats]) => (
                    <div key={service} className="flex justify-between text-sm">
                      <span className="capitalize">{service}:</span>
                      <span className="font-medium">{stats.total}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg border">
                <h4 className="font-medium text-green-900">Por Ambiente</h4>
                <div className="mt-2 space-y-1">
                  {Object.entries(apiKeysAnalytics.analytics.byEnvironment).slice(0, 3).map(([env, stats]) => (
                    <div key={env} className="flex justify-between text-sm">
                      <span className="capitalize">{env}:</span>
                      <span className="font-medium">{stats.total}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg border">
                <h4 className="font-medium text-purple-900">Uso de API Keys</h4>
                <div className="mt-2 space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Total de llamadas:</span>
                    <span className="font-medium">{apiKeysAnalytics.analytics.usageStats.totalUsage}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Promedio:</span>
                    <span className="font-medium">{apiKeysAnalytics.analytics.usageStats.averageUsage}</span>
                  </div>
                </div>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg border">
                <h4 className="font-medium text-orange-900">Rotación</h4>
                <div className="mt-2 space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Auto-rotación:</span>
                    <span className="font-medium">{apiKeysAnalytics.analytics.rotationStats?.autoRotationEnabled || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Necesitan rotación:</span>
                    <span className="font-medium">{apiKeysAnalytics.analytics.rotationStats?.keysNeedingRotation || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* Feature Flags Tab */}
      {activeTab === 'feature-flags' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Gestión de Feature Flags</h2>
              <p className="text-sm text-gray-600">Controla las funcionalidades del sistema mediante feature flags</p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => setFeatureFlagsSearchModalOpen(true)}
                variant="outline"
              >
                Buscar Feature Flags
              </Button>
              <Button variant="secondary">
                Crear Feature Flag (Próximamente)
              </Button>
              <Button variant="secondary">
                Flags Estándar (Próximamente)
              </Button>
            </div>
          </div>

          {/* Feature Flags Analytics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Rollout Distribution */}
            {rolloutStatus && (
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Distribución de Rollout</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Rollout Completo (100%):</span>
                    <span className="font-medium">{rolloutStatus.rolloutStatus.fullRollout}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Rollout Parcial (1-99%):</span>
                    <span className="font-medium">{rolloutStatus.rolloutStatus.partialRollout}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Sin Rollout (0%):</span>
                    <span className="font-medium">{rolloutStatus.rolloutStatus.zeroRollout}</span>
                  </div>
                  <div className="flex justify-between items-center border-t pt-2 mt-2">
                    <span className="text-sm font-medium">Promedio General:</span>
                    <span className="font-bold text-lg">
                      {Math.round(rolloutStatus.rolloutStatus.averageRolloutPercentage)}%
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Categories Overview */}
            {categoriesOverview && (
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Resumen por Categorías</h3>
                <div className="space-y-3">
                  {Object.entries(categoriesOverview.overview).map(([category, stats]) => (
                    <div key={category} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div>
                        <span className="font-medium capitalize">{category}</span>
                        <div className="text-xs text-gray-600">
                          {stats.enabled}/{stats.total} habilitados
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {Math.round(stats.averageRollout)}%
                        </div>
                        <div className="text-xs text-gray-500">rollout avg</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Feature Flags Search Modal */}
          <FeatureFlagsSearchForm
            isOpen={featureFlagsSearchModalOpen}
            onClose={() => setFeatureFlagsSearchModalOpen(false)}
            onSelectFeatureFlagForUpdate={(featureFlag: FeatureFlag) => {
              console.log('Update feature flag:', featureFlag);
              // TODO: Implement update modal
            }}
            onSelectFeatureFlagForDelete={(featureFlag: FeatureFlag) => {
              console.log('Delete feature flag:', featureFlag);
              // TODO: Implement delete modal
            }}
            onSelectFeatureFlagForToggle={(featureFlag: FeatureFlag) => {
              console.log('Toggle feature flag:', featureFlag);
              // TODO: Implement toggle modal
            }}
            onSelectFeatureFlagForEvaluate={(featureFlag: FeatureFlag) => {
              console.log('Evaluate feature flag:', featureFlag);
              // TODO: Implement evaluate modal
            }}
          />
        </div>
      )}

      {/* General Tab */}
      {activeTab === 'general' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Configuraciones Generales</h2>
            <p className="text-sm text-gray-600 mb-6">Configura los parámetros generales del sistema</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* System Settings */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Configuración del Sistema</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre de la Aplicación
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="YaVoy Admin"
                    disabled
                  />
                  <p className="text-xs text-gray-500 mt-1">Próximamente disponible</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Idioma Predeterminado
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" disabled>
                    <option>Español</option>
                    <option>Inglés</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Próximamente disponible</p>
                </div>
              </div>
            </div>

            {/* Security Settings */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Configuración de Seguridad</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tiempo de Sesión (minutos)
                  </label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="60"
                    disabled
                  />
                  <p className="text-xs text-gray-500 mt-1">Próximamente disponible</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Intentos de Login Máximos
                  </label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="5"
                    disabled
                  />
                  <p className="text-xs text-gray-500 mt-1">Próximamente disponible</p>
                </div>
              </div>
            </div>

            {/* Notification Settings */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Configuración de Notificaciones</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    disabled
                  />
                  <label className="ml-2 block text-sm text-gray-700">
                    Notificaciones por Email
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    disabled
                  />
                  <label className="ml-2 block text-sm text-gray-700">
                    Notificaciones Push
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    disabled
                  />
                  <label className="ml-2 block text-sm text-gray-700">
                    Alertas del Sistema
                  </label>
                </div>

                <p className="text-xs text-gray-500 mt-4">Próximamente disponible</p>
              </div>
            </div>
          </div>

          {/* Maintenance Section */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Mantenimiento del Sistema</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>Esta sección está en desarrollo. Las configuraciones generales estarán disponibles próximamente.</p>
                </div>
                <div className="mt-4">
                  <div className="-mx-2 -my-1.5 flex">
                    <button
                      type="button"
                      className="bg-yellow-50 px-2 py-1.5 rounded-md text-sm font-medium text-yellow-800 hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-yellow-50 focus:ring-yellow-600"
                      disabled
                    >
                      Ver Documentación
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
