'use client';

import React from 'react';
import { DataTable } from '@/features/core/components';
import { RideTier, RideTiersListResponse } from '../../schemas/pricing.schemas';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Car, DollarSign, AlertTriangle, CheckCircle, Users, MapPin } from 'lucide-react';

interface RideTiersTableProps {
  data: RideTiersListResponse | undefined;
  loading: boolean;
  onTierView?: (tierId: number) => void;
  onTierEdit?: (tier: RideTier) => void;
  onTierDelete?: (tier: RideTier) => void;
  onTierToggle?: (tier: RideTier) => void;
}

export function RideTiersTable({
  data,
  loading,
  onTierView,
  onTierEdit,
  onTierDelete,
  onTierToggle,
}: RideTiersTableProps) {
  const formatCurrency = (amount: number) => {
    return `$${(amount / 100).toFixed(2)}`;
  };

  const formatPassengers = (min: number, max: number) => {
    if (min === max) return `${min} pasajero${min === 1 ? '' : 's'}`;
    return `${min}-${max} pasajeros`;
  };

  const getPriorityColor = (priority: number) => {
    if (priority <= 3) return 'bg-red-100 text-red-800';
    if (priority <= 6) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const columns = [
    {
      key: 'id' as keyof RideTier,
      header: 'ID',
      render: (value: number) => (
        <span className="font-mono text-sm">{value}</span>
      ),
    },
    {
      key: 'name' as keyof RideTier,
      header: 'Nombre',
      render: (value: string, row: RideTier) => (
        <div className="flex items-center gap-2">
          <Car className="h-4 w-4 text-gray-400" />
          <div>
            <div className="font-medium">{value}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'baseFare' as keyof RideTier,
      header: 'Tarifa Base',
      render: (value: number) => (
        <div className="flex items-center gap-1">
          <DollarSign className="h-3 w-3 text-gray-400" />
          <span className="font-medium">{formatCurrency(value)}</span>
        </div>
      ),
    },
    {
      key: 'perMinuteRate' as keyof RideTier,
      header: 'Por Minuto',
      render: (value: number) => (
        <span className="text-sm">{formatCurrency(value)}</span>
      ),
    },
    {
      key: 'perKmRate' as keyof RideTier,
      header: 'Por Kilómetro',
      render: (value: number) => (
        <span className="text-sm">{formatCurrency(value)}</span>
      ),
    },
    {
      key: 'minPassengers' as keyof RideTier,
      header: 'Pasajeros',
      render: (value: number, row: RideTier) => (
        <div className="flex items-center gap-1">
          <Users className="h-3 w-3 text-gray-400" />
          <span className="text-sm">
            {formatPassengers(value, row.maxPassengers)}
          </span>
        </div>
      ),
    },
    {
      key: 'priority' as keyof RideTier,
      header: 'Prioridad',
      render: (value: number) => (
        <Badge className={getPriorityColor(value)}>
          {value}
        </Badge>
      ),
    },
    {
      key: 'isActive' as keyof RideTier,
      header: 'Estado',
      render: (value: boolean, row: RideTier) => (
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
      ),
    },
    {
      key: 'countryId' as keyof RideTier,
      header: 'Alcance',
      render: (value: number | undefined, row: RideTier) => (
        <div className="text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            <span>Global</span>
          </div>
        </div>
      ),
    },
  ];

  const renderActions = (tier: RideTier) => (
    <div className="flex items-center gap-2">
      <Button
        variant="default"
        size="sm"
        onClick={() => onTierView?.(tier.id)}
        className="h-8 px-3 bg-blue-500 hover:bg-blue-600 text-white"
      >
        Ver Detalles
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onTierEdit?.(tier)}
        className="h-8 px-3"
      >
        Editar
      </Button>
      <Button
        variant={tier.isActive ? "outline" : "default"}
        size="sm"
        onClick={() => onTierToggle?.(tier)}
        className={`h-8 px-3 ${
          tier.isActive
            ? 'border-yellow-500 text-yellow-600 hover:bg-yellow-50'
            : 'bg-green-500 hover:bg-green-600 text-white'
        }`}
      >
        {tier.isActive ? 'Desactivar' : 'Activar'}
      </Button>
      <Button
        variant="destructive"
        size="sm"
        onClick={() => onTierDelete?.(tier)}
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
      data={data?.tiers || []}
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
      emptyMessage="No se encontraron niveles de tarifa"
    />
  );
}

export default RideTiersTable;
