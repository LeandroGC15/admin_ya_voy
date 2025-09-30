'use client';

import React from 'react';
import { Modal } from '@/features/core/components';
import { useBulkUpdateApiKeys, useApiKeys } from '../../hooks/use-api-keys';
import { type BulkUpdateApiKeysInput } from '../../schemas/api-keys.schemas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { invalidateQueries } from '@/lib/api/react-query-client';
import { toast } from 'sonner';
import { Search, Key, AlertTriangle } from 'lucide-react';

interface ApiKeysBulkUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ApiKeysBulkUpdateModal({ isOpen, onClose, onSuccess }: ApiKeysBulkUpdateModalProps) {
  const [selectedApiKeys, setSelectedApiKeys] = React.useState<number[]>([]);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [updates, setUpdates] = React.useState<{
    isActive?: boolean;
    environment?: 'development' | 'staging' | 'production';
    accessLevel?: 'read' | 'write' | 'admin' | 'full';
    rotationPolicy?: 'manual' | 'auto_30d' | 'auto_90d' | 'auto_1y';
    tags: string[];
  }>({
    isActive: undefined,
    environment: undefined,
    accessLevel: undefined,
    rotationPolicy: undefined,
    tags: [],
  });

  // Fetch all API keys for bulk selection
  const { data: apiKeysData, isLoading: isLoadingApiKeys } = useApiKeys({
    limit: 100, // Get more API keys for bulk operations
    page: 1,
  });

  const bulkUpdateApiKeysMutation = useBulkUpdateApiKeys();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Validate selected API keys
      if (!selectedApiKeys.length) {
        toast.error('Debe seleccionar al menos una API key');
        return;
      }

      // Check if at least one update is selected
      const hasUpdates = Object.values(updates).some(value =>
        value !== undefined && (Array.isArray(value) ? value.length > 0 : true)
      );

      if (!hasUpdates) {
        toast.error('Debe seleccionar al menos una actualización');
        return;
      }

      const formData: BulkUpdateApiKeysInput = {
        keyIds: selectedApiKeys,
        updates,
      };

      await bulkUpdateApiKeysMutation.mutateAsync(formData);

      toast.success('API keys actualizadas exitosamente');
      onClose();
      invalidateQueries(['apiKeys']);
      onSuccess?.();

      // Reset form
      setSelectedApiKeys([]);
      setSearchTerm('');
      setUpdates({
        isActive: undefined,
        environment: undefined,
        accessLevel: undefined,
        rotationPolicy: undefined,
        tags: [],
      } as typeof updates);
    } catch {
      toast.error('Error al actualizar las API keys');
    }
  };

  // Filter API keys based on search term
  const filteredApiKeys = React.useMemo(() => {
    if (!apiKeysData?.keys) return [];
    if (!searchTerm) return apiKeysData.keys;

    return apiKeysData.keys.filter(apiKey =>
      apiKey.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apiKey.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apiKey.environment.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apiKey.keyType.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [apiKeysData?.keys, searchTerm]);

  const handleApiKeyToggle = (apiKeyId: number) => {
    setSelectedApiKeys(prev =>
      prev.includes(apiKeyId)
        ? prev.filter(id => id !== apiKeyId)
        : [...prev, apiKeyId]
    );
  };

  const handleSelectAll = () => {
    setSelectedApiKeys(filteredApiKeys.map(apiKey => apiKey.id));
  };

  const handleDeselectAll = () => {
    setSelectedApiKeys([]);
  };

  const handleTagsChange = (value: string) => {
    const tags = value.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    setUpdates(prev => ({ ...prev, tags }));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Actualización Masiva de API Keys"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={bulkUpdateApiKeysMutation.isPending}
          >
            {bulkUpdateApiKeysMutation.isPending ? 'Actualizando...' : 'Actualizar API Keys'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          {/* Search and Select API Keys */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Key className="h-5 w-5" />
                Seleccionar API Keys
                {selectedApiKeys.length > 0 && (
                  <Badge variant="secondary" className="ml-auto">
                    {selectedApiKeys.length} seleccionadas
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por nombre, servicio, ambiente o tipo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Select All/Deselect All Buttons */}
              {filteredApiKeys.length > 0 && (
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAll}
                    className="text-xs"
                  >
                    Seleccionar todas
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleDeselectAll}
                    className="text-xs"
                  >
                    Deseleccionar todas
                  </Button>
                </div>
              )}

              {/* API Keys List */}
              <div className="max-h-64 overflow-y-auto border rounded-lg">
                {isLoadingApiKeys ? (
                  <div className="p-4 text-center text-gray-500">
                    Cargando API keys...
                  </div>
                ) : filteredApiKeys.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    {searchTerm ? 'No se encontraron API keys' : 'No hay API keys disponibles'}
                  </div>
                ) : (
                  <div className="divide-y">
                    {filteredApiKeys.map((apiKey) => (
                      <div
                        key={apiKey.id}
                        className="p-3 hover:bg-gray-50 flex items-center gap-3"
                      >
                        <Checkbox
                          id={`api-key-${apiKey.id}`}
                          checked={selectedApiKeys.includes(apiKey.id)}
                          onCheckedChange={() => handleApiKeyToggle(apiKey.id)}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <Label
                              htmlFor={`api-key-${apiKey.id}`}
                              className="font-medium cursor-pointer flex-1"
                            >
                              {apiKey.name}
                            </Label>
                            <Badge
                              variant={apiKey.isActive ? "secondary" : "destructive"}
                              className="text-xs"
                            >
                              {apiKey.isActive ? 'Activa' : 'Inactiva'}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            <span className="capitalize">{apiKey.service}</span> •
                            <span className="capitalize ml-1">{apiKey.environment}</span> •
                            <span className="capitalize ml-1">{apiKey.keyType.replace('_', ' ')}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="border-t pt-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Actualizaciones a aplicar</h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isActive"
                  checked={updates.isActive !== undefined}
                  onCheckedChange={(checked) => {
                    setUpdates(prev => ({
                      ...prev,
                      isActive: checked ? true : undefined
                    }));
                  }}
                />
                <div className="grid gap-1.5 leading-none">
                  <Label htmlFor="isActive" className="text-sm font-medium">
                    Estado activo
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Marcar como activas
                  </p>
                </div>
              </div>

              <div>
                <Label htmlFor="environment">Ambiente</Label>
                <Select
                  value={updates.environment || 'no_change'}
                  onValueChange={(value) => {
                    setUpdates(prev => ({
                      ...prev,
                      environment: value === 'no_change' ? undefined : value as 'development' | 'staging' | 'production'
                    }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="No cambiar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no_change">No cambiar</SelectItem>
                    <SelectItem value="development">Desarrollo</SelectItem>
                    <SelectItem value="staging">Staging</SelectItem>
                    <SelectItem value="production">Producción</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="accessLevel">Nivel de acceso</Label>
                <Select
                  value={updates.accessLevel || 'no_change'}
                  onValueChange={(value) => {
                    setUpdates(prev => ({
                      ...prev,
                      accessLevel: value === 'no_change' ? undefined : value as 'read' | 'write' | 'admin' | 'full'
                    }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="No cambiar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no_change">No cambiar</SelectItem>
                    <SelectItem value="read">Lectura</SelectItem>
                    <SelectItem value="write">Escritura</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="full">Completo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="rotationPolicy">Política de rotación</Label>
                <Select
                  value={updates.rotationPolicy || 'no_change'}
                  onValueChange={(value) => {
                    setUpdates(prev => ({
                      ...prev,
                      rotationPolicy: value === 'no_change' ? undefined : value as 'manual' | 'auto_30d' | 'auto_90d' | 'auto_1y'
                    }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="No cambiar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no_change">No cambiar</SelectItem>
                    <SelectItem value="manual">Manual</SelectItem>
                    <SelectItem value="auto_30d">Automática (30 días)</SelectItem>
                    <SelectItem value="auto_90d">Automática (90 días)</SelectItem>
                    <SelectItem value="auto_1y">Automática (1 año)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="tags">Etiquetas</Label>
                <Input
                  id="tags"
                  value={updates.tags?.join(', ') || ''}
                  onChange={(e) => handleTagsChange(e.target.value)}
                  placeholder="seguridad, produccion, temporal"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Etiquetas separadas por coma (se agregarán a las existentes)
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-blue-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Actualización masiva
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>Esta acción afectará a {selectedApiKeys.length} API key(s). Solo se aplicarán los cambios seleccionados.</p>
              </div>
            </div>
          </div>
        </div>
      </form>
    </Modal>
  );
}

export default ApiKeysBulkUpdateModal;
