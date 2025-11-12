'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import type { GetOnboardingDriversQuery } from '../interfaces/verifications';

interface FiltersPanelProps {
  filters: GetOnboardingDriversQuery;
  onFiltersChange: (filters: GetOnboardingDriversQuery) => void;
  onClearFilters: () => void;
}

const FiltersPanel: React.FC<FiltersPanelProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleFilterChange = (key: keyof GetOnboardingDriversQuery, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const handleArrayFilterChange = (
    key: 'onboardingStage' | 'vehicleType' | 'verificationStatus',
    value: string,
    checked: boolean
  ) => {
    const currentArray = filters[key] || [];
    if (checked) {
      handleFilterChange(key, [...currentArray, value] as any);
    } else {
      handleFilterChange(key, currentArray.filter((item) => item !== value) as any);
    }
  };

  return (
    <Card className="p-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between mb-2"
      >
        <h3 className="text-lg font-semibold">Filtros</h3>
        {isOpen ? (
          <ChevronUpIcon className="h-5 w-5" />
        ) : (
          <ChevronDownIcon className="h-5 w-5" />
        )}
      </button>

      {isOpen && (
        <div className="space-y-4 mt-4">
          {/* Búsqueda */}
          <div>
            <Label htmlFor="search">Buscar</Label>
            <Input
              id="search"
              placeholder="Nombre, email, teléfono o placa..."
              value={filters.search || ''}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>

          {/* Selectores en fila */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="onboardingStage">Etapa</Label>
              <Select
                value={filters.onboardingStage?.[0] || 'all'}
                onValueChange={(value) =>
                  handleFilterChange('onboardingStage', value === 'all' ? undefined : [value])
                }
              >
                <SelectTrigger id="onboardingStage">
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="personal-data">Datos Personales</SelectItem>
                  <SelectItem value="documents">Documentos</SelectItem>
                  <SelectItem value="vehicles">Vehículos</SelectItem>
                  <SelectItem value="programa-yavoy">Programa Yavoy</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="vehicleType">Tipo Vehículo</Label>
              <Select
                value={filters.vehicleType?.[0] || 'all'}
                onValueChange={(value) =>
                  handleFilterChange('vehicleType', value === 'all' ? undefined : [value])
                }
              >
                <SelectTrigger id="vehicleType">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="carro">Carro</SelectItem>
                  <SelectItem value="moto">Moto</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="verificationStatus">Estado</Label>
              <Select
                value={filters.verificationStatus?.[0] || 'all'}
                onValueChange={(value) =>
                  handleFilterChange('verificationStatus', value === 'all' ? undefined : [value])
                }
              >
                <SelectTrigger id="verificationStatus">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="PENDING">Pendiente</SelectItem>
                  <SelectItem value="VERIFIED">Verificado</SelectItem>
                  <SelectItem value="REJECTED">Rechazado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Slider de progreso */}
          <div>
            <Label>Progreso: {filters.minProgress || 0}% - {filters.maxProgress || 100}%</Label>
            <div className="flex items-center gap-4 mt-2">
              <Input
                type="number"
                min="0"
                max="100"
                value={filters.minProgress || 0}
                onChange={(e) => handleFilterChange('minProgress', parseInt(e.target.value) || 0)}
                className="w-20"
              />
              <div className="flex-1 h-2 bg-gray-200 rounded-full relative">
                <div
                  className="absolute h-2 bg-blue-500 rounded-full"
                  style={{
                    left: `${filters.minProgress || 0}%`,
                    width: `${(filters.maxProgress || 100) - (filters.minProgress || 0)}%`,
                  }}
                />
              </div>
              <Input
                type="number"
                min="0"
                max="100"
                value={filters.maxProgress || 100}
                onChange={(e) => handleFilterChange('maxProgress', parseInt(e.target.value) || 100)}
                className="w-20"
              />
            </div>
          </div>

          {/* Checkboxes */}
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="hasPendingDocuments"
                checked={filters.hasPendingDocuments || false}
                onCheckedChange={(checked) =>
                  handleFilterChange('hasPendingDocuments', checked ? true : undefined)
                }
              />
              <Label htmlFor="hasPendingDocuments" className="cursor-pointer">
                Con documentos pendientes
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="hasPendingVehicles"
                checked={filters.hasPendingVehicles || false}
                onCheckedChange={(checked) =>
                  handleFilterChange('hasPendingVehicles', checked ? true : undefined)
                }
              />
              <Label htmlFor="hasPendingVehicles" className="cursor-pointer">
                Con vehículos pendientes
              </Label>
            </div>
          </div>

          {/* Date pickers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dateFrom">Fecha desde</Label>
              <Input
                id="dateFrom"
                type="date"
                value={filters.dateFrom ? filters.dateFrom.split('T')[0] : ''}
                onChange={(e) =>
                  handleFilterChange('dateFrom', e.target.value ? `${e.target.value}T00:00:00Z` : undefined)
                }
              />
            </div>

            <div>
              <Label htmlFor="dateTo">Fecha hasta</Label>
              <Input
                id="dateTo"
                type="date"
                value={filters.dateTo ? filters.dateTo.split('T')[0] : ''}
                onChange={(e) =>
                  handleFilterChange('dateTo', e.target.value ? `${e.target.value}T23:59:59Z` : undefined)
                }
              />
            </div>
          </div>

          {/* Botón limpiar */}
          <div className="flex justify-end">
            <Button variant="outline" onClick={onClearFilters}>
              Limpiar Filtros
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};

export default FiltersPanel;



