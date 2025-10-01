'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Plus,
  PlusCircle,
  Edit3,
  Key,
  Shield,
  RefreshCw,
  BarChart3,
  Settings,
  AlertTriangle,
  CheckCircle,
  Clock,
  Trash2
} from 'lucide-react';

// Import our new components
import { ApiKeysTable } from '@/features/config/components/api-keys';
import { ApiKeysCreateModal } from '@/features/config/components/api-keys';
import { ApiKeysEditModal } from '@/features/config/components/api-keys';
import { ApiKeysDeleteModal } from '@/features/config/components/api-keys';
import { ApiKeysToggleModal } from '@/features/config/components/api-keys';
import { ApiKeysRotateModal } from '@/features/config/components/api-keys';
import { ApiKeysForceRotateModal } from '@/features/config/components/api-keys';
import { ApiKeysBulkUpdateModal } from '@/features/config/components/api-keys';
import { ApiKeysCreateStandardModal } from '@/features/config/components/api-keys';

// Import hooks
import {
  useApiKeys,
  useApiKeysAnalytics,
  useRotationStats,
  useDecryptApiKey
} from '@/features/config/hooks/use-api-keys';

// Import types
import { ApiKey, ApiKeyListItem } from '@/features/config/schemas/api-keys.schemas';

export default function ApiKeysPage() {
  // State management
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedApiKey, setSelectedApiKey] = useState<ApiKey | null>(null);
  const [currentTab, setCurrentTab] = useState<'overview' | 'manage' | 'analytics'>('overview');

  // Modal states
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createStandardModalOpen, setCreateStandardModalOpen] = useState(false);
  const [bulkUpdateModalOpen, setBulkUpdateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [toggleModalOpen, setToggleModalOpen] = useState(false);
  const [rotateModalOpen, setRotateModalOpen] = useState(false);
  const [forceRotateModalOpen, setForceRotateModalOpen] = useState(false);

  // Decrypt state
  const [showDecryptedKey, setShowDecryptedKey] = useState(false);

  // API data
  const { data: apiKeysData, isLoading } = useApiKeys({
    search: searchTerm,
    page: currentPage,
    limit: 10,
  });
  const { data: apiKeysAnalytics } = useApiKeysAnalytics();
  const { data: rotationStats } = useRotationStats();

  // Decrypt mutation
  const decryptApiKeyMutation = useDecryptApiKey();

  // Handle search
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle API key selection and actions
  const handleApiKeySelect = (apiKey: ApiKeyListItem) => {
    // For selection, we can work with the list item data
    // Convert to ApiKey format with available data
    const apiKeyData: ApiKey = {
      ...apiKey,
      // Add default values for fields not available in list
      keyType: 'secret',
      accessLevel: 'read',
      tags: [],
      createdAt: '',
      updatedAt: '',
      description: '',
      rotationPolicy: 'manual',
      rateLimit: 0,
      usageCount: apiKey.usageCount || 0, // Provide default value
      expiresAt: apiKey.expiresAt || undefined, // Convert null to undefined and override
      lastRotated: undefined,
    };
    setSelectedApiKey(apiKeyData);
    setCurrentTab('manage');
  };

  const handleApiKeyEdit = (apiKey: ApiKeyListItem) => {
    // For editing, we need complete data, so we'll set the ID and let the modal fetch details
    const apiKeyData: ApiKey = {
      ...apiKey,
      keyType: 'secret',
      accessLevel: 'read',
      tags: [],
      createdAt: '',
      updatedAt: '',
      description: '',
      rotationPolicy: 'manual',
      rateLimit: 0,
      usageCount: apiKey.usageCount || 0, // Provide default value
      expiresAt: apiKey.expiresAt || undefined, // Convert null to undefined
      lastRotated: undefined,
    };
    setSelectedApiKey(apiKeyData);
    setEditModalOpen(true);
  };

  const handleApiKeyDelete = (apiKey: ApiKeyListItem) => {
    const apiKeyData: ApiKey = {
      ...apiKey,
      keyType: 'secret',
      accessLevel: 'read',
      tags: [],
      createdAt: '',
      updatedAt: '',
      description: '',
      rotationPolicy: 'manual',
      rateLimit: 0,
      usageCount: apiKey.usageCount || 0, // Provide default value
      expiresAt: apiKey.expiresAt || undefined, // Convert null to undefined
      lastRotated: undefined,
    };
    setSelectedApiKey(apiKeyData);
    setDeleteModalOpen(true);
  };

  const handleApiKeyToggle = (apiKey: ApiKeyListItem) => {
    const apiKeyData: ApiKey = {
      ...apiKey,
      keyType: 'secret',
      accessLevel: 'read',
      tags: [],
      createdAt: '',
      updatedAt: '',
      description: '',
      rotationPolicy: 'manual',
      rateLimit: 0,
      usageCount: apiKey.usageCount || 0, // Provide default value
      expiresAt: apiKey.expiresAt || undefined, // Convert null to undefined
      lastRotated: undefined,
    };
    setSelectedApiKey(apiKeyData);
    setToggleModalOpen(true);
  };

  const handleApiKeyRotate = (apiKey: ApiKeyListItem) => {
    const apiKeyData: ApiKey = {
      ...apiKey,
      keyType: 'secret',
      accessLevel: 'read',
      tags: [],
      createdAt: '',
      updatedAt: '',
      description: '',
      rotationPolicy: 'manual',
      rateLimit: 0,
      usageCount: apiKey.usageCount || 0, // Provide default value
      expiresAt: apiKey.expiresAt || undefined, // Convert null to undefined
      lastRotated: undefined,
    };
    setSelectedApiKey(apiKeyData);
    setRotateModalOpen(true);
  };

  const handleApiKeyForceRotate = (apiKey: ApiKeyListItem) => {
    const apiKeyData: ApiKey = {
      ...apiKey,
      keyType: 'secret',
      accessLevel: 'read',
      tags: [],
      createdAt: '',
      updatedAt: '',
      description: '',
      rotationPolicy: 'manual',
      rateLimit: 0,
      usageCount: apiKey.usageCount || 0, // Provide default value
      expiresAt: apiKey.expiresAt || undefined, // Convert null to undefined
      lastRotated: undefined,
    };
    setSelectedApiKey(apiKeyData);
    setForceRotateModalOpen(true);
  };

  const handleDecryptApiKey = async (apiKey: ApiKeyListItem) => {
    try {
      await decryptApiKeyMutation.mutateAsync(apiKey.id);
      setShowDecryptedKey(true);
    } catch (error) {
      console.error('Error decrypting API key:', error);
    }
  };

  // Handle modal close
  const handleModalClose = () => {
    setCreateModalOpen(false);
    setCreateStandardModalOpen(false);
    setBulkUpdateModalOpen(false);
    setEditModalOpen(false);
    setDeleteModalOpen(false);
    setToggleModalOpen(false);
    setRotateModalOpen(false);
    setForceRotateModalOpen(false);
    setSelectedApiKey(null);
    setShowDecryptedKey(false);
  };

  // Handle success actions
  const handleSuccess = () => {
    handleModalClose();
    // Data will be refreshed automatically by React Query
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Key className="h-8 w-8" />
            API Keys
          </h1>
          <p className="text-gray-600 mt-1">
            Gestiona las claves de API para integrar servicios externos
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => setCreateModalOpen(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Nueva API Key
          </Button>
          <Button
            onClick={() => setCreateStandardModalOpen(true)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <PlusCircle className="h-4 w-4" />
            Claves Estándar
          </Button>
          <Button
            onClick={() => setBulkUpdateModalOpen(true)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Edit3 className="h-4 w-4" />
            Actualización Masiva
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <Input
            placeholder="Buscar por nombre, servicio, ambiente o tipo..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch(searchTerm)}
          />
        </div>
        <Button
          onClick={() => handleSearch(searchTerm)}
          variant="outline"
        >
          <Search className="h-4 w-4 mr-2" />
          Buscar
        </Button>
      </div>

      {/* Main Content */}
      <Tabs value={currentTab} onValueChange={(value) => setCurrentTab(value as 'overview' | 'manage' | 'analytics')} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Vista General</TabsTrigger>
          <TabsTrigger value="manage">Gestionar</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab - Main Table */}
        <TabsContent value="overview" className="space-y-6">
          {/* Analytics Cards */}
          {apiKeysAnalytics && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total API Keys</CardTitle>
                  <Key className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{apiKeysAnalytics.analytics.totalKeys}</div>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="secondary" className="text-xs">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      {apiKeysAnalytics.analytics.activeKeys} activas
                    </Badge>
                    <Badge variant="destructive" className="text-xs">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      {apiKeysAnalytics.analytics.expired} expiradas
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Próximas a Expirar</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">
                    {apiKeysAnalytics.analytics.expiringSoon}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    En los próximos 30 días
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Claves Primarias</CardTitle>
                  <Shield className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {Object.values(apiKeysAnalytics.analytics.byService).reduce((acc, service) => acc + service.primary, 0)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Claves principales activas
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Uso Total</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {apiKeysAnalytics.analytics.usageStats.totalUsage.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Requests totales
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Main API Keys Table */}
          <ApiKeysTable
            data={apiKeysData}
            loading={isLoading}
            onApiKeySelect={handleApiKeySelect}
            onApiKeyEdit={handleApiKeyEdit}
            onApiKeyDelete={handleApiKeyDelete}
            onApiKeyToggle={handleApiKeyToggle}
            onApiKeyRotate={handleApiKeyRotate}
            onApiKeyForceRotate={handleApiKeyForceRotate}
          />
        </TabsContent>

        {/* Manage Tab */}
        <TabsContent value="manage" className="space-y-6">
          {selectedApiKey ? (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="h-5 w-5" />
                    API Key Seleccionada
                  </CardTitle>
                  <CardDescription>
                    Gestiona esta clave API específica
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Nombre:</span>
                      <p className="mt-1">{selectedApiKey.name}</p>
                    </div>
                    <div>
                      <span className="font-medium">Servicio:</span>
                      <p className="mt-1 capitalize">{selectedApiKey.service}</p>
                    </div>
                    <div>
                      <span className="font-medium">Ambiente:</span>
                      <p className="mt-1 capitalize">{selectedApiKey.environment}</p>
                    </div>
                    <div>
                      <span className="font-medium">Estado:</span>
                      <p className="mt-1">
                        <Badge variant={selectedApiKey.isActive ? "secondary" : "destructive"}>
                          {selectedApiKey.isActive ? 'Activa' : 'Inactiva'}
                        </Badge>
                      </p>
                    </div>
                    <div>
                      <span className="font-medium">Tipo:</span>
                      <p className="mt-1 capitalize">{selectedApiKey.keyType.replace('_', ' ')}</p>
                    </div>
                    <div>
                      <span className="font-medium">Acceso:</span>
                      <p className="mt-1 capitalize">{selectedApiKey.accessLevel}</p>
                    </div>
                    <div>
                      <span className="font-medium">Usos:</span>
                      <p className="mt-1">{selectedApiKey.usageCount}</p>
                    </div>
                    <div>
                      <span className="font-medium">Creada:</span>
                      <p className="mt-1">{new Date(selectedApiKey.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {/* Decrypted Key Display */}
                  {showDecryptedKey && decryptApiKeyMutation.data && (
                    <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-medium text-red-800 flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          Clave API Desencriptada
                        </h4>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowDecryptedKey(false)}
                          className="h-6 px-2 text-xs"
                        >
                          Ocultar
                        </Button>
                      </div>
                      <div className="bg-white p-3 rounded border font-mono text-sm break-all">
                        {decryptApiKeyMutation.data.decryptedKey}
                      </div>
                      <p className="text-xs text-red-600 mt-2 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        Esta clave contiene información sensible. Úsala solo cuando sea necesario.
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t">
                    <Button
                      onClick={() => setEditModalOpen(true)}
                      className="flex items-center gap-2"
                    >
                      <Settings className="h-4 w-4" />
                      Editar
                    </Button>
                    <Button
                      variant={selectedApiKey.isActive ? "outline" : "default"}
                      onClick={() => setToggleModalOpen(true)}
                      className={`flex items-center gap-2 ${
                        selectedApiKey.isActive
                          ? 'border-yellow-500 text-yellow-600 hover:bg-yellow-50'
                          : 'bg-green-500 hover:bg-green-600 text-white'
                      }`}
                    >
                      {selectedApiKey.isActive ? 'Desactivar' : 'Activar'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setRotateModalOpen(true)}
                      className="flex items-center gap-2 border-purple-500 text-purple-600 hover:bg-purple-50"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Rotar
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleDecryptApiKey(selectedApiKey)}
                      disabled={decryptApiKeyMutation.isPending}
                      className="flex items-center gap-2 border-orange-500 text-orange-600 hover:bg-orange-50"
                    >
                      <Key className="h-4 w-4" />
                      {decryptApiKeyMutation.isPending ? 'Desencriptando...' : 'Ver Clave'}
                    </Button>
                    {selectedApiKey.isActive && (
                      <Button
                        variant="outline"
                        onClick={() => setForceRotateModalOpen(true)}
                        className="flex items-center gap-2 border-red-500 text-red-600 hover:bg-red-50"
                      >
                        <AlertTriangle className="h-4 w-4" />
                        Forzar
                      </Button>
                    )}
                    <Button
                      variant="destructive"
                      onClick={() => setDeleteModalOpen(true)}
                      className="flex items-center gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      Eliminar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-center py-12">
              <Key className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Selecciona una API Key
              </h3>
              <p className="text-gray-500 mb-4">
                Haz clic en una fila de la tabla para seleccionar y gestionar una API key específica.
              </p>
              <Button onClick={() => setCurrentTab('overview')}>
                Ver todas las API Keys
              </Button>
            </div>
          )}
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Environment Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Distribución por Ambiente</CardTitle>
              </CardHeader>
              <CardContent>
                {apiKeysAnalytics ? (
                  <div className="space-y-3">
                    {Object.entries(apiKeysAnalytics.analytics.byEnvironment).map(([env, stats]) => (
                      <div key={env} className="flex justify-between items-center">
                        <span className="capitalize font-medium">{env}</span>
                        <div className="text-right">
                          <div className="font-bold">{stats.total}</div>
                          <div className="text-xs text-muted-foreground">
                            {stats.active} activas
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Cargando datos...</p>
                )}
              </CardContent>
            </Card>

            {/* Key Type Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Tipos de Clave</CardTitle>
              </CardHeader>
              <CardContent>
                {apiKeysAnalytics ? (
                  <div className="space-y-3">
                    {Object.entries(apiKeysAnalytics.analytics.byKeyType).map(([type, stats]) => (
                      <div key={type} className="flex justify-between items-center">
                        <span className="font-medium">{type.replace('_', ' ')}</span>
                        <div className="text-right">
                          <div className="font-bold">{stats.total}</div>
                          <div className="text-xs text-muted-foreground">
                            {stats.active} activas
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Cargando datos...</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Usage Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Estadísticas de Uso</CardTitle>
            </CardHeader>
            <CardContent>
              {apiKeysAnalytics ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">
                      {apiKeysAnalytics.analytics.usageStats.totalUsage.toLocaleString()}
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">Uso Total</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">
                      {Math.round(apiKeysAnalytics.analytics.usageStats.averageUsage)}
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">Uso Promedio</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">
                      {apiKeysAnalytics.analytics.usageStats.mostUsed[0]?.usage || 0}
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Más Usada: {apiKeysAnalytics.analytics.usageStats.mostUsed[0]?.name || 'N/A'}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Cargando estadísticas...</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <ApiKeysCreateModal
        isOpen={createModalOpen}
        onClose={handleModalClose}
        onSuccess={handleSuccess}
      />

      <ApiKeysCreateStandardModal
        isOpen={createStandardModalOpen}
        onClose={handleModalClose}
        onSuccess={handleSuccess}
      />

      <ApiKeysBulkUpdateModal
        isOpen={bulkUpdateModalOpen}
        onClose={handleModalClose}
        onSuccess={handleSuccess}
      />

      <ApiKeysEditModal
        isOpen={editModalOpen}
        onClose={handleModalClose}
        apiKey={selectedApiKey}
        onSuccess={handleSuccess}
      />

      <ApiKeysDeleteModal
        isOpen={deleteModalOpen}
        onClose={handleModalClose}
        apiKey={selectedApiKey}
        onSuccess={handleSuccess}
      />

      <ApiKeysToggleModal
        isOpen={toggleModalOpen}
        onClose={handleModalClose}
        apiKey={selectedApiKey}
        onSuccess={handleSuccess}
      />

      <ApiKeysRotateModal
        isOpen={rotateModalOpen}
        onClose={handleModalClose}
        apiKey={selectedApiKey}
        onSuccess={handleSuccess}
      />

      <ApiKeysForceRotateModal
        isOpen={forceRotateModalOpen}
        onClose={handleModalClose}
        apiKey={selectedApiKey}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
