'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, CheckCircle, AlertTriangle } from 'lucide-react';
import { DataTable } from '@/features/core/components/data-table';
import { getZoneTypeLabel, getZoneStatusLabel, getZoneStatusColor, getZoneStatusBadgeVariant } from '@/lib/maps/zone-colors';
import type { ServiceZoneListItem, ServiceZonesListResponse } from '@/features/config/schemas/service-zones.schemas';

interface ServiceZonesTableProps {
  data?: ServiceZonesListResponse;
  loading?: boolean;
  onZoneSelect?: (zone: ServiceZoneListItem) => void;
  onZoneView?: (zone: ServiceZoneListItem) => void;
  onZoneEdit?: (zone: ServiceZoneListItem) => void;
  onZoneDelete?: (zone: ServiceZoneListItem) => void;
  onZoneToggle?: (zone: ServiceZoneListItem) => void;
  currentPage?: number;
  onPageChange?: (page: number) => void;
}

export function ServiceZonesTable({
  data,
  loading = false,
  onZoneSelect,
  onZoneView,
  onZoneEdit,
  onZoneDelete,
  onZoneToggle,
  currentPage = 1,
  onPageChange,
}: ServiceZonesTableProps) {
  // Normalize data to handle both ServiceZonesListResponse and ServiceZoneListItem[] formats
  const normalizedData = React.useMemo(() => {
    if (!data) return [];

    // Check if it's a ServiceZonesListResponse (has zones property)
    if ('zones' in data && Array.isArray(data.zones)) {
      return data.zones; // ServiceZoneListItem[]
    } else if (Array.isArray(data)) {
      return data; // ServiceZoneListItem[]
    }

    return [];
  }, [data]);

  const columns = [
    {
      key: 'id' as keyof ServiceZoneListItem,
      header: 'ID',
      render: (value: number) => (
        <span className="font-mono text-sm">{value}</span>
      ),
    },
    {
      key: 'name' as keyof ServiceZoneListItem,
      header: 'Nombre',
      render: (value: string, row: ServiceZoneListItem) => (
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-gray-400" />
          <div>
            <div className="font-medium">{value}</div>
            <div className="text-xs text-gray-500">
              {row.cityName}, {row.stateName}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'zoneType' as keyof ServiceZoneListItem,
      header: 'Tipo',
      render: (value: 'regular' | 'premium' | 'restricted') => (
        <Badge
          variant={value === 'premium' ? 'default' : value === 'restricted' ? 'destructive' : 'secondary'}
          className="text-xs"
        >
          {getZoneTypeLabel(value)}
        </Badge>
      ),
    },
    {
      key: 'pricingMultiplier' as keyof ServiceZoneListItem,
      header: 'Pricing',
      render: (value: number) => (
        <div className="flex items-center gap-1">
          <span className="text-sm font-medium">{value}x</span>
          {value >= 2.0 && <span className="text-xs text-red-500">⚠️</span>}
          {value <= 0.8 && <span className="text-xs text-blue-500">💡</span>}
        </div>
      ),
    },
    {
      key: 'demandMultiplier' as keyof ServiceZoneListItem,
      header: 'Demanda',
      render: (value: number) => (
        <div className="flex items-center gap-1">
          <span className="text-sm font-medium">{value}x</span>
          {value >= 2.0 && <span className="text-xs text-orange-500">🔥</span>}
          {value <= 0.8 && <span className="text-xs text-gray-500">📉</span>}
        </div>
      ),
    },
    {
      key: 'isActive' as keyof ServiceZoneListItem,
      header: 'Estado',
      render: (value: boolean) => (
        <div className="flex items-center gap-2">
          {value ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : (
            <AlertTriangle className="h-4 w-4 text-gray-400" />
          )}
          <Badge
            variant={getZoneStatusBadgeVariant(value)}
            style={{ backgroundColor: getZoneStatusColor(value) }}
            className="text-xs"
          >
            {getZoneStatusLabel(value)}
          </Badge>
        </div>
      ),
    },
  ];

  const renderActions = (zone: ServiceZoneListItem) => (
    <div className="flex items-center gap-2">
      {onZoneView && (
        <Button
          variant="default"
          size="sm"
          onClick={() => onZoneView(zone)}
          className="h-8 px-3 bg-blue-500 hover:bg-blue-600 text-white"
        >
          Ver Detalles
        </Button>
      )}
      {onZoneEdit && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onZoneEdit(zone)}
          className="h-8 px-3"
        >
          Editar
        </Button>
      )}
      {onZoneToggle && (
        <Button
          variant={zone.isActive ? "outline" : "default"}
          size="sm"
          onClick={() => onZoneToggle(zone)}
          className={`h-8 px-3 ${
            zone.isActive
              ? 'border-yellow-500 text-yellow-600 hover:bg-yellow-50'
              : 'bg-green-500 hover:bg-green-600 text-white'
          }`}
        >
          {zone.isActive ? 'Desactivar' : 'Activar'}
        </Button>
      )}
      {onZoneDelete && (
        <Button
          variant="destructive"
          size="sm"
          onClick={() => onZoneDelete(zone)}
          className="h-8 px-3"
        >
          Eliminar
        </Button>
      )}
    </div>
  );

  const pagination = data && 'totalPages' in data && onPageChange ? {
    currentPage: currentPage,
    totalPages: data.totalPages,
    totalItems: data.total,
    onPageChange: onPageChange,
  } : undefined;

  return (
    <DataTable
      data={normalizedData}
      columns={columns}
      loading={loading}
      pagination={pagination}
      actions={renderActions}
      emptyMessage="No se encontraron zonas de servicio con los filtros aplicados."
    />
  );
}
