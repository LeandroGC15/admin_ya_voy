'use client';

import React from 'react';
import { DataTable, ActionButtons } from '@/features/core/components';
import { City, CitiesListResponse } from '../../schemas/geography.schemas';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Navigation, AlertTriangle, CheckCircle, DollarSign, MapPin } from 'lucide-react';

interface CitiesTableProps {
  data: CitiesListResponse | City[] | undefined;
  loading: boolean;
  parentState?: {
    id: number;
    name: string;
    code: string;
  };
  onCitySelect?: (city: City) => void;
  onCityEdit?: (city: City) => void;
  onCityDelete?: (city: City) => void;
  onCityToggle?: (city: City) => void;
}

export function CitiesTable({
  data,
  loading,
  parentState,
  onCitySelect,
  onCityEdit,
  onCityDelete,
  onCityToggle,
}: CitiesTableProps) {
  // Normalize data to handle both CitiesListResponse and City[] formats
  const normalizedData = React.useMemo(() => {
    if (!data) return [];

    // Check if it's a CitiesListResponse (has cities property)
    if (Array.isArray(data)) {
      return data; // City[]
    } else if ('cities' in data && Array.isArray(data.cities)) {
      return data.cities; // CitiesListResponse
    }

    return [];
  }, [data]);

  const columns = [
    {
      key: 'id' as keyof City,
      header: 'ID',
      render: (value: number) => (
        <span className="font-mono text-sm">{value}</span>
      ),
    },
    {
      key: 'name' as keyof City,
      header: 'Nombre',
      render: (value: string, row: City) => (
        <div className="flex items-center gap-2">
          <Navigation className="h-4 w-4 text-gray-400" />
          <div>
            <div className="font-medium">{value}</div>
            <div className="text-xs text-gray-500">
              {row.latitude ? Number(row.latitude).toFixed(4) : 'N/A'}, {row.longitude ? Number(row.longitude).toFixed(4) : 'N/A'}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'state' as keyof City,
      header: 'Estado',
      render: (_value: City['state']) => (
        parentState ? (
          <div className="flex items-center gap-2">
            <MapPin className="h-3 w-3 text-gray-400" />
            <div>
              <div className="text-sm font-medium">{parentState.name}</div>
              <div className="text-xs text-gray-500">{parentState.code}</div>
            </div>
          </div>
        ) : (
          <span className="text-gray-400">-</span>
        )
      ),
    },
    {
      key: 'pricingMultiplier' as keyof City,
      header: 'Multiplicador',
      render: (value: number | undefined) => (
        value ? (
          <div className="flex items-center gap-1">
            <DollarSign className="h-3 w-3 text-gray-400" />
            <span className="text-sm font-mono">{value}x</span>
          </div>
        ) : (
          <span className="text-gray-400">-</span>
        )
      ),
    },
    {
      key: 'serviceRadius' as keyof City,
      header: 'Radio Servicio',
      render: (value: number | undefined) => (
        value ? (
          <span className="text-sm font-mono">{value}km</span>
        ) : (
          <span className="text-gray-400">-</span>
        )
      ),
    },
    {
      key: 'isActive' as keyof City,
      header: 'Estado',
      render: (value: boolean, row: City) => (
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
          {row.serviceZonesCount !== undefined && (
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {row.serviceZonesCount} zonas
            </span>
          )}
        </div>
      ),
    },
  ];

  const renderActions = (city: City) => (
    <div className="flex items-center gap-2">
      <Button
        variant="default"
        size="sm"
        onClick={() => onCitySelect?.(city)}
        className="h-8 px-3 bg-blue-500 hover:bg-blue-600 text-white"
      >
        Gestionar
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onCityEdit?.(city)}
        className="h-8 px-3"
      >
        Editar
      </Button>
      <Button
        variant={city.isActive ? "outline" : "default"}
        size="sm"
        onClick={() => onCityToggle?.(city)}
        className={`h-8 px-3 ${
          city.isActive
            ? 'border-yellow-500 text-yellow-600 hover:bg-yellow-50'
            : 'bg-green-500 hover:bg-green-600 text-white'
        }`}
      >
        {city.isActive ? 'Desactivar' : 'Activar'}
      </Button>
      <Button
        variant="destructive"
        size="sm"
        onClick={() => onCityDelete?.(city)}
        className="h-8 px-3"
      >
        Eliminar
      </Button>
    </div>
  );

  // Handle pagination for CitiesListResponse format
  const pagination = data && !Array.isArray(data) && 'page' in data ? {
    currentPage: data.page,
    totalPages: data.totalPages,
    totalItems: data.total,
  } : undefined;

  return (
    <DataTable
      data={normalizedData}
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
      emptyMessage="No se encontraron ciudades"
    />
  );
}

export default CitiesTable;
