'use client';

import React, { useState } from 'react';
import { DataTable, ActionButtons } from '@/features/core/components';
import { ApiKey, ApiKeysListResponse } from '../../schemas/api-keys.schemas';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Key, Shield, AlertTriangle, CheckCircle, Clock, RotateCcw } from 'lucide-react';

interface ApiKeysTableProps {
  data: ApiKeysListResponse | undefined;
  loading: boolean;
  onApiKeySelect?: (apiKey: ApiKey) => void;
  onApiKeyEdit?: (apiKey: ApiKey) => void;
  onApiKeyDelete?: (apiKey: ApiKey) => void;
  onApiKeyToggle?: (apiKey: ApiKey) => void;
  onApiKeyRotate?: (apiKey: ApiKey) => void;
  onApiKeyForceRotate?: (apiKey: ApiKey) => void;
}

export function ApiKeysTable({
  data,
  loading,
  onApiKeySelect,
  onApiKeyEdit,
  onApiKeyDelete,
  onApiKeyToggle,
  onApiKeyRotate,
  onApiKeyForceRotate,
}: ApiKeysTableProps) {
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

  const getEnvironmentColor = (environment: string) => {
    switch (environment) {
      case 'production':
        return 'bg-red-100 text-red-800';
      case 'staging':
        return 'bg-yellow-100 text-yellow-800';
      case 'development':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getKeyTypeColor = (keyType: string) => {
    switch (keyType) {
      case 'secret':
        return 'bg-purple-100 text-purple-800';
      case 'public':
        return 'bg-green-100 text-green-800';
      case 'private_key':
        return 'bg-orange-100 text-orange-800';
      case 'access_token':
        return 'bg-blue-100 text-blue-800';
      case 'refresh_token':
        return 'bg-indigo-100 text-indigo-800';
      case 'webhook_secret':
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getAccessLevelColor = (accessLevel: string) => {
    switch (accessLevel) {
      case 'read':
        return 'bg-blue-100 text-blue-800';
      case 'write':
        return 'bg-green-100 text-green-800';
      case 'admin':
        return 'bg-orange-100 text-orange-800';
      case 'full':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const columns = [
    {
      key: 'id' as keyof ApiKey,
      header: 'ID',
      render: (value: number) => (
        <span className="font-mono text-sm">{value}</span>
      ),
    },
    {
      key: 'name' as keyof ApiKey,
      header: 'Nombre',
      render: (value: string, row: ApiKey) => (
        <div className="flex items-center gap-2">
          <Key className="h-4 w-4 text-gray-400" />
          <div>
            <div className="font-medium">{value}</div>
            {row.description && (
              <div className="text-sm text-gray-500 truncate max-w-48">
                {row.description}
              </div>
            )}
          </div>
          {row.isPrimary && (
            <Badge variant="secondary" className="text-xs">
              <Shield className="h-3 w-3 mr-1" />
              Primaria
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: 'service' as keyof ApiKey,
      header: 'Servicio',
      render: (value: string) => (
        <Badge variant="outline">
          {getServiceLabel(value)}
        </Badge>
      ),
    },
    {
      key: 'environment' as keyof ApiKey,
      header: 'Ambiente',
      render: (value: string) => (
        <Badge className={getEnvironmentColor(value)}>
          {value}
        </Badge>
      ),
    },
    {
      key: 'keyType' as keyof ApiKey,
      header: 'Tipo',
      render: (value: string) => (
        <Badge className={getKeyTypeColor(value)}>
          {value.replace('_', ' ')}
        </Badge>
      ),
    },
    {
      key: 'accessLevel' as keyof ApiKey,
      header: 'Acceso',
      render: (value: string) => (
        <Badge className={getAccessLevelColor(value)}>
          {value}
        </Badge>
      ),
    },
    {
      key: 'isActive' as keyof ApiKey,
      header: 'Estado',
      render: (value: boolean, row: ApiKey) => (
        <div className="flex items-center gap-2">
          <Badge variant={value ? "secondary" : "destructive"}>
            {value ? (
              <>
                <CheckCircle className="h-3 w-3 mr-1" />
                Activa
              </>
            ) : (
              <>
                <AlertTriangle className="h-3 w-3 mr-1" />
                Inactiva
              </>
            )}
          </Badge>
          {row.usageCount > 0 && (
            <span className="text-xs text-gray-500">
              {row.usageCount} usos
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'expiresAt' as keyof ApiKey,
      header: 'Expira',
      render: (value: string) => {
        if (!value) return <span className="text-gray-400">Nunca</span>;

        const expirationDate = new Date(value);
        const now = new Date();
        const daysUntilExpiration = Math.ceil((expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        let colorClass = 'text-gray-600';
        if (daysUntilExpiration <= 0) {
          colorClass = 'text-red-600 font-medium';
        } else if (daysUntilExpiration <= 30) {
          colorClass = 'text-yellow-600 font-medium';
        }

        return (
          <div className={`text-sm ${colorClass}`}>
            {expirationDate.toLocaleDateString()}
            {daysUntilExpiration <= 30 && daysUntilExpiration > 0 && (
              <div className="text-xs">
                ({daysUntilExpiration}d)
              </div>
            )}
            {daysUntilExpiration <= 0 && (
              <div className="text-xs">Expirada</div>
            )}
          </div>
        );
      },
    },
    {
      key: 'lastRotated' as keyof ApiKey,
      header: 'Última Rotación',
      render: (value: string) => (
        <div className="text-sm text-gray-600">
          {value ? (
            <div className="flex items-center gap-1">
              <RotateCcw className="h-3 w-3" />
              {new Date(value).toLocaleDateString()}
            </div>
          ) : (
            <span className="text-gray-400">Nunca</span>
          )}
        </div>
      ),
    },
    {
      key: 'createdAt' as keyof ApiKey,
      header: 'Creado',
      render: (value: string) => (
        <div className="text-sm text-gray-600">
          {new Date(value).toLocaleDateString()}
        </div>
      ),
    },
  ];

  const renderActions = (apiKey: ApiKey) => (
    <div className="flex items-center gap-2">
      <Button
        variant="default"
        size="sm"
        onClick={() => onApiKeySelect?.(apiKey)}
        className="h-8 px-3 bg-blue-500 hover:bg-blue-600 text-white"
      >
        Gestionar
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onApiKeyEdit?.(apiKey)}
        className="h-8 px-3"
      >
        Editar
      </Button>
      <Button
        variant={apiKey.isActive ? "outline" : "default"}
        size="sm"
        onClick={() => onApiKeyToggle?.(apiKey)}
        className={`h-8 px-3 ${
          apiKey.isActive
            ? 'border-yellow-500 text-yellow-600 hover:bg-yellow-50'
            : 'bg-green-500 hover:bg-green-600 text-white'
        }`}
      >
        {apiKey.isActive ? 'Desactivar' : 'Activar'}
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onApiKeyRotate?.(apiKey)}
        className="h-8 px-3 border-purple-500 text-purple-600 hover:bg-purple-50"
      >
        <RotateCcw className="h-3 w-3 mr-1" />
        Rotar
      </Button>
      {apiKey.isActive && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onApiKeyForceRotate?.(apiKey)}
          className="h-8 px-3 border-red-500 text-red-600 hover:bg-red-50"
        >
          <AlertTriangle className="h-3 w-3 mr-1" />
          Forzar
        </Button>
      )}
      <Button
        variant="destructive"
        size="sm"
        onClick={() => onApiKeyDelete?.(apiKey)}
        className="h-8 px-3"
      >
        Eliminar
      </Button>
    </div>
  );

  const pagination = data ? {
    currentPage: data.page,
    totalPages: data.totalPages,
    totalItems: data.total,
  } : undefined;

  return (
    <DataTable
      data={data?.keys || []}
      columns={columns}
      loading={loading}
      pagination={pagination ? {
        ...pagination,
        onPageChange: (page) => {
          // This will be handled by the parent component
          console.log('Page change:', page);
        },
      } : undefined}
      actions={renderActions}
      emptyMessage="No se encontraron API keys"
    />
  );
}

export default ApiKeysTable;
