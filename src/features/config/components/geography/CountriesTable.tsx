'use client';

import React from 'react';
import { DataTable, ActionButtons } from '@/features/core/components';
import { Country, CountriesListResponse } from '../../schemas/geography.schemas';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Globe, AlertTriangle, CheckCircle, Users, DollarSign } from 'lucide-react';

interface CountriesTableProps {
  data: CountriesListResponse | undefined;
  loading: boolean;
  onCountrySelect?: (country: Country) => void;
  onCountryEdit?: (country: Country) => void;
  onCountryDelete?: (country: Country) => void;
  onCountryToggle?: (country: Country) => void;
}

export function CountriesTable({
  data,
  loading,
  onCountrySelect,
  onCountryEdit,
  onCountryDelete,
  onCountryToggle,
}: CountriesTableProps) {
  const getContinentLabel = (continent: string) => {
    const labels: Record<string, string> = {
      africa: 'África',
      asia: 'Asia',
      europe: 'Europa',
      north_america: 'América del Norte',
      south_america: 'América del Sur',
      oceania: 'Oceanía',
      antarctica: 'Antártida',
    };
    return labels[continent] || continent;
  };

  const getContinentColor = (continent: string) => {
    switch (continent) {
      case 'africa':
        return 'bg-orange-100 text-orange-800';
      case 'asia':
        return 'bg-red-100 text-red-800';
      case 'europe':
        return 'bg-blue-100 text-blue-800';
      case 'north_america':
        return 'bg-green-100 text-green-800';
      case 'south_america':
        return 'bg-yellow-100 text-yellow-800';
      case 'oceania':
        return 'bg-purple-100 text-purple-800';
      case 'antarctica':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const columns = [
    {
      key: 'id' as keyof Country,
      header: 'ID',
      render: (value: number) => (
        <span className="font-mono text-sm">{value}</span>
      ),
    },
    {
      key: 'name' as keyof Country,
      header: 'Nombre',
      render: (value: string, row: Country) => (
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-gray-400" />
          <div>
            <div className="font-medium">{value}</div>
            <div className="text-sm text-gray-500">{row.isoCode2}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'continent' as keyof Country,
      header: 'Continente',
      render: (value: string) => (
        <Badge className={getContinentColor(value)}>
          {getContinentLabel(value)}
        </Badge>
      ),
    },
    {
      key: 'isoCode2' as keyof Country,
      header: 'Código ISO',
      render: (value: string) => (
        <Badge variant="outline" className="font-mono">
          {value}
        </Badge>
      ),
    },
    {
      key: 'currencyCode' as keyof Country,
      header: 'Moneda',
      render: (value: string, row: Country) => (
        <div className="flex items-center gap-1">
          <DollarSign className="h-3 w-3 text-gray-400" />
          <span className="text-sm font-mono">{value}</span>
          {row.currencySymbol && (
            <span className="text-xs text-gray-500">({row.currencySymbol})</span>
          )}
        </div>
      ),
    },
    {
      key: 'isActive' as keyof Country,
      header: 'Estado',
      render: (value: boolean, row: Country) => (
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
          {row.statesCount !== undefined && (
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {row.statesCount} estados
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'population' as keyof Country,
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

  const renderActions = (country: Country) => (
    <div className="flex items-center gap-2">
      <Button
        variant="default"
        size="sm"
        onClick={() => onCountrySelect?.(country)}
        className="h-8 px-3 bg-blue-500 hover:bg-blue-600 text-white"
      >
        Gestionar
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onCountryEdit?.(country)}
        className="h-8 px-3"
      >
        Editar
      </Button>
      <Button
        variant={country.isActive ? "outline" : "default"}
        size="sm"
        onClick={() => onCountryToggle?.(country)}
        className={`h-8 px-3 ${
          country.isActive
            ? 'border-yellow-500 text-yellow-600 hover:bg-yellow-50'
            : 'bg-green-500 hover:bg-green-600 text-white'
        }`}
      >
        {country.isActive ? 'Desactivar' : 'Activar'}
      </Button>
      <Button
        variant="destructive"
        size="sm"
        onClick={() => onCountryDelete?.(country)}
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
      data={data?.countries || []}
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
      emptyMessage="No se encontraron países"
    />
  );
}

export default CountriesTable;
