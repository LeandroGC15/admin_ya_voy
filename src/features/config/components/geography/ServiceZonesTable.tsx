'use client';

import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Eye, Edit, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { getZoneTypeLabel, getZoneStatusLabel, getZoneStatusColor, getZoneStatusBadgeVariant } from '@/lib/maps/zone-colors';
import type { ServiceZoneListItem, ServiceZonesListResponse } from '@/features/config/schemas/service-zones.schemas';

// Define column type for better type safety
interface ColumnDefinition<T = any> {
  key: keyof ServiceZoneListItem;
  header: string;
  render?: (value: T, row: ServiceZoneListItem) => React.ReactNode;
}

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

  const columns: ColumnDefinition[] = [
    {
      key: 'id',
      header: 'ID',
      render: (value: number) => (
        <span className="font-mono text-sm">{value}</span>
      ),
    },
    {
      key: 'name',
      header: 'Nombre',
      render: (value: string, row: ServiceZoneListItem) => (
        <div className="flex items-center gap-2">
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
      key: 'zoneType',
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
      key: 'pricingMultiplier',
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
      key: 'demandMultiplier',
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
      key: 'isActive',
      header: 'Estado',
      render: (value: boolean) => (
        <Badge
          variant={getZoneStatusBadgeVariant(value)}
          style={{ backgroundColor: getZoneStatusColor(value) }}
          className="text-xs"
        >
          {getZoneStatusLabel(value)}
        </Badge>
      ),
    },
  ];

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="h-10 bg-gray-200 animate-pulse rounded"></div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-100 animate-pulse rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!normalizedData || normalizedData.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8 text-gray-500">
            <div className="text-lg font-medium mb-2">No hay zonas de servicio</div>
            <p className="text-sm">
              No se encontraron zonas de servicio con los filtros aplicados.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalPages = data && 'totalPages' in data ? data.totalPages : 1;
  const totalItems = data && 'total' in data ? data.total : normalizedData.length;

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map((column) => (
                    <TableHead key={String(column.key)}>{column.header}</TableHead>
                  ))}
                  <TableHead className="w-[120px]">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {normalizedData.map((row, index) => (
                  <TableRow key={row.id || index}>
                    {columns.map((column) => (
                      <TableCell key={String(column.key)}>
                        {column.render
                          ? column.render(row[column.key], row)
                          : String(row[column.key] || '')
                        }
                      </TableCell>
                    ))}
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {onZoneView && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onZoneView(row)}
                            title="Ver detalles"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                        {onZoneEdit && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onZoneEdit(row)}
                            title="Editar zona"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        {onZoneToggle && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onZoneToggle(row)}
                            title={row.isActive ? 'Desactivar zona' : 'Activar zona'}
                          >
                            {row.isActive ? (
                              <ToggleRight className="h-4 w-4 text-green-600" />
                            ) : (
                              <ToggleLeft className="h-4 w-4 text-gray-400" />
                            )}
                          </Button>
                        )}
                        {onZoneDelete && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onZoneDelete(row)}
                            title="Eliminar zona"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && onPageChange && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Mostrando {normalizedData.length} de {totalItems} elementos
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </Button>
                <span className="text-sm text-gray-500">
                  Página {currentPage} de {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                >
                  Siguiente
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
