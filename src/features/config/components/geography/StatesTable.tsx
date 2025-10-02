'use client';

import React from 'react';
import { DataTable, ActionButtons } from '@/features/core/components';
import { State, StatesListResponse } from '../../schemas/geography.schemas';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, AlertTriangle, CheckCircle, Users, DollarSign, Navigation } from 'lucide-react';

interface StatesTableProps {
  data: StatesListResponse | undefined;
  loading: boolean;
  onStateSelect?: (state: State) => void;
  onStateEdit?: (state: State) => void;
  onStateDelete?: (state: State) => void;
  onStateToggle?: (state: State) => void;
}

export function StatesTable({
  data,
  loading,
  onStateSelect,
  onStateEdit,
  onStateDelete,
  onStateToggle,
}: StatesTableProps) {
  const columns = [
    {
      key: 'id' as keyof State,
      header: 'ID',
      render: (value: number) => (
        <span className="font-mono text-sm">{value}</span>
      ),
    },
    {
      key: 'name' as keyof State,
      header: 'Nombre',
      render: (value: string, row: State) => (
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-gray-400" />
          <div>
            <div className="font-medium">{value}</div>
            <div className="text-sm text-gray-500">{row.code}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'country' as keyof State,
      header: 'País',
      render: (value: State['country']) => (
        <div className="flex items-center gap-2">
          {value?.flag && <span className="text-sm">{value.flag}</span>}
          <span className="text-sm">{value?.name}</span>
          <Badge variant="outline" className="text-xs">
            {value?.isoCode2}
          </Badge>
        </div>
      ),
    },
    {
      key: 'pricingMultiplier' as keyof State,
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
      key: 'serviceFee' as keyof State,
      header: 'Tarifa Servicio',
      render: (value: number | undefined) => (
        value ? (
          <div className="flex items-center gap-1">
            <DollarSign className="h-3 w-3 text-gray-400" />
            <span className="text-sm font-mono">${value}</span>
          </div>
        ) : (
          <span className="text-gray-400">-</span>
        )
      ),
    },
    {
      key: 'isActive' as keyof State,
      header: 'Estado',
      render: (value: boolean, row: State) => (
        <div className="flex items-center gap-2">
          <Badge variant={value ? "secondary" : "destructive"}>
            {value ? (
              <>
                <CheckCircle className="h-3 w-3 mr-1" />
                Activo
              </>
            ) : (
              <>
                <AlertTriangle className="h-3 w-3 mr-1" />
                Inactivo
              </>
            )}
          </Badge>
          {row.citiesCount !== undefined && (
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <Navigation className="h-3 w-3" />
              {row.citiesCount} ciudades
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'population' as keyof State,
      header: 'Población',
      render: (value: number | undefined) => (
        value ? (
          <div className="flex items-center gap-1 text-sm">
            <Users className="h-3 w-3 text-gray-400" />
            {value.toLocaleString()}
          </div>
        ) : (
          <span className="text-gray-400">-</span>
        )
      ),
    },
  ];

  const renderActions = (state: State) => (
    <div className="flex items-center gap-2">
      <Button
        variant="default"
        size="sm"
        onClick={() => onStateSelect?.(state)}
        className="h-8 px-3 bg-blue-500 hover:bg-blue-600 text-white"
      >
        Gestionar
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onStateEdit?.(state)}
        className="h-8 px-3"
      >
        Editar
      </Button>
      <Button
        variant={state.isActive ? "outline" : "default"}
        size="sm"
        onClick={() => onStateToggle?.(state)}
        className={`h-8 px-3 ${
          state.isActive
            ? 'border-yellow-500 text-yellow-600 hover:bg-yellow-50'
            : 'bg-green-500 hover:bg-green-600 text-white'
        }`}
      >
        {state.isActive ? 'Desactivar' : 'Activar'}
      </Button>
      <Button
        variant="destructive"
        size="sm"
        onClick={() => onStateDelete?.(state)}
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
      data={data?.states || []}
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
      emptyMessage="No se encontraron estados"
    />
  );
}

export default StatesTable;
