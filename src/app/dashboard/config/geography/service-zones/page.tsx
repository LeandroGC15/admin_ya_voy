'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Search, Filter, Map, BarChart3, Settings, Download } from 'lucide-react';
import { GoogleMapProvider } from '@/components/maps/GoogleMapProvider';
import { ZonesVisualizationMap } from '@/components/maps/ZonesVisualizationMap';
import {
  ServiceZonesTable,
  ServiceZonesCreateModal,
  ServiceZonesEditModal,
  ServiceZonesDeleteModal,
  ServiceZonesToggleModal,
  BulkPricingUpdateModal,
} from '@/features/config/components/geography';
import { useServiceZones, usePricingStats } from '@/features/config/hooks/use-service-zones';
import { useCities, useStates, useCountries } from '@/features/config/hooks/use-geography';
import type { ServiceZoneListItem, SearchServiceZonesInput } from '@/features/config/schemas/service-zones.schemas';
import { ServiceZone } from '@/interfaces/GeographyInterfaces';

export default function ServiceZonesPage() {
  const router = useRouter();
  const [searchParams, setSearchParams] = useState<SearchServiceZonesInput>({
    page: 1,
    limit: 20,
    search: '',
    cityId: undefined,
    stateId: undefined,
    countryId: undefined,
    zoneType: undefined,
    isActive: undefined,
    sortBy: 'name',
    sortOrder: 'asc',
  });

  const [selectedZone, setSelectedZone] = useState<ServiceZoneListItem | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isToggleModalOpen, setIsToggleModalOpen] = useState(false);
  const [isBulkPricingModalOpen, setIsBulkPricingModalOpen] = useState(false);

  // Data fetching
  const { data: zonesData, isLoading: isLoadingZones } = useServiceZones(searchParams);
  const { data: pricingStats, isLoading: isLoadingStats, error: pricingStatsError } = usePricingStats();
  const { data: countriesData } = useCountries();
  const { data: statesData } = useStates();
  const countries = countriesData?.countries || [];
  const states = statesData?.states || [];
  const { data: citiesData } = useCities();
  const cities = citiesData?.cities || [];

  // Handle search
  const handleSearch = (value: string) => {
    setSearchParams(prev => ({ ...prev, search: value, page: 1 }));
  };

  // Handle filters
  const handleFilterChange = (key: keyof SearchServiceZonesInput, value: any) => {
    setSearchParams(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setSearchParams(prev => ({ ...prev, page }));
  };

  // Handle zone actions
  const handleZoneView = (zone: ServiceZoneListItem) => {
    router.push(`/dashboard/config/geography/service-zones/${zone.id}`);
  };

  const handleZoneEdit = (zone: ServiceZoneListItem) => {
    setSelectedZone(zone);
    setIsEditModalOpen(true);
  };

  const handleZoneDelete = (zone: ServiceZoneListItem) => {
    setSelectedZone(zone);
    setIsDeleteModalOpen(true);
  };

  const handleZoneToggle = (zone: ServiceZoneListItem) => {
    setSelectedZone(zone);
    setIsToggleModalOpen(true);
  };

  // Handle modal close
  const handleModalClose = () => {
    setSelectedZone(null);
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    setIsDeleteModalOpen(false);
    setIsToggleModalOpen(false);
    setIsBulkPricingModalOpen(false);
  };

  // Handle success
  const handleSuccess = () => {
    // Refresh data
    window.location.reload();
  };

  // Get zones for map visualization - disabled until full zone data is available
  const zonesForMap: ServiceZone[] = []; // Temporarily disabled

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Zonas de Servicio</h1>
          <p className="text-gray-600">
            Gestiona las zonas de servicio y sus configuraciones de pricing
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setIsBulkPricingModalOpen(true)}
          >
            <Settings className="h-4 w-4 mr-2" />
            Bulk Pricing
          </Button>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Crear Zona
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      {pricingStats ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{pricingStats.totalZones}</div>
                <div className="text-xs text-gray-600">Total Zonas</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{pricingStats.activeZones}</div>
                <div className="text-xs text-gray-600">Zonas Activas</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{pricingStats.averagePricingMultiplier.toFixed(2)}x</div>
                <div className="text-xs text-gray-600">Pricing Promedio</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{pricingStats.averageDemandMultiplier.toFixed(2)}x</div>
                <div className="text-xs text-gray-600">Demanda Promedio</div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardContent className="pt-4">
            <div className="text-center py-8">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <div className="text-lg font-medium text-gray-600 mb-2">
                Estadísticas de Pricing
              </div>
              <div className="text-sm text-gray-500">
                {pricingStatsError
                  ? "Las estadísticas de pricing estarán disponibles próximamente."
                  : "Cargando estadísticas..."
                }
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Vista General</TabsTrigger>
          <TabsTrigger value="map">Mapa de Cobertura</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          {/* Search and Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Search className="h-5 w-5" />
                Búsqueda y Filtros
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Search */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Buscar</label>
                  <Input
                    placeholder="Nombre de zona..."
                    value={searchParams.search || ''}
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                </div>

                {/* Country Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">País</label>
                  <Select
                    value={searchParams.countryId?.toString() || 'all'}
                    onValueChange={(value) => handleFilterChange('countryId', value === 'all' ? undefined : parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todos los países" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los países</SelectItem>
                      {countries?.map((country) => (
                        <SelectItem key={country.id} value={country.id.toString()}>
                          {country.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* State Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Estado</label>
                  <Select
                    value={searchParams.stateId?.toString() || 'all'}
                    onValueChange={(value) => handleFilterChange('stateId', value === 'all' ? undefined : parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todos los estados" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los estados</SelectItem>
                      {states?.map((state) => (
                        <SelectItem key={state.id} value={state.id.toString()}>
                          {state.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* City Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Ciudad</label>
                  <Select
                    value={searchParams.cityId?.toString() || 'all'}
                    onValueChange={(value) => handleFilterChange('cityId', value === 'all' ? undefined : parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todas las ciudades" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas las ciudades</SelectItem>
                      {cities?.map((city) => (
                        <SelectItem key={city.id} value={city.id.toString()}>
                          {city.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Zone Type Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tipo de Zona</label>
                  <Select
                    value={searchParams.zoneType || 'all'}
                    onValueChange={(value) => handleFilterChange('zoneType', value === 'all' ? undefined : value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todos los tipos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los tipos</SelectItem>
                      <SelectItem value="regular">Regular</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                      <SelectItem value="restricted">Restringida</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Status Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Estado</label>
                  <Select
                    value={searchParams.isActive?.toString() || 'all'}
                    onValueChange={(value) => handleFilterChange('isActive', value === 'all' ? undefined : value === 'true')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todos los estados" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los estados</SelectItem>
                      <SelectItem value="true">Activas</SelectItem>
                      <SelectItem value="false">Inactivas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Sort By */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Ordenar por</label>
                  <Select
                    value={searchParams.sortBy || 'name'}
                    onValueChange={(value) => handleFilterChange('sortBy', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">Nombre</SelectItem>
                      <SelectItem value="pricingMultiplier">Pricing</SelectItem>
                      <SelectItem value="demandMultiplier">Demanda</SelectItem>
                      <SelectItem value="createdAt">Fecha de creación</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Sort Order */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Orden</label>
                  <Select
                    value={searchParams.sortOrder || 'asc'}
                    onValueChange={(value) => handleFilterChange('sortOrder', value as 'asc' | 'desc')}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asc">Ascendente</SelectItem>
                      <SelectItem value="desc">Descendente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Zones Table */}
          <ServiceZonesTable
            data={zonesData}
            loading={isLoadingZones}
            onZoneView={handleZoneView}
            onZoneEdit={handleZoneEdit}
            onZoneDelete={handleZoneDelete}
            onZoneToggle={handleZoneToggle}
            currentPage={searchParams.page || 1}
            onPageChange={handlePageChange}
          />
        </TabsContent>

        {/* Map Tab */}
        <TabsContent value="map" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Map className="h-5 w-5" />
                Mapa de Cobertura de Zonas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <GoogleMapProvider>
                <ZonesVisualizationMap
                  zones={zonesForMap}
                  selectedZoneId={selectedZone?.id}
                />
              </GoogleMapProvider>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pricing Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Distribución de Pricing
                </CardTitle>
              </CardHeader>
              <CardContent>
                {pricingStats && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Pricing más alto:</span>
                      <Badge variant="outline">{pricingStats.highestPricingMultiplier}x</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Pricing más bajo:</span>
                      <Badge variant="outline">{pricingStats.lowestPricingMultiplier}x</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Pricing promedio:</span>
                      <Badge variant="outline">{pricingStats.averagePricingMultiplier.toFixed(2)}x</Badge>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Zones by Type */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Zonas por Tipo
                </CardTitle>
              </CardHeader>
              <CardContent>
                {pricingStats && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Regular:</span>
                      <Badge variant="secondary">{pricingStats.zonesByType.regular}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Premium:</span>
                      <Badge variant="default">{pricingStats.zonesByType.premium}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Restringida:</span>
                      <Badge variant="destructive">{pricingStats.zonesByType.restricted}</Badge>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <ServiceZonesCreateModal
        isOpen={isCreateModalOpen}
        onClose={handleModalClose}
        onSuccess={handleSuccess}
      />

      {selectedZone && (
        <>
          <ServiceZonesEditModal
            isOpen={isEditModalOpen}
            onClose={handleModalClose}
            onSuccess={handleSuccess}
            zoneId={selectedZone.id}
          />

          <ServiceZonesDeleteModal
            isOpen={isDeleteModalOpen}
            onClose={handleModalClose}
            onSuccess={handleSuccess}
            zone={selectedZone}
          />

          <ServiceZonesToggleModal
            isOpen={isToggleModalOpen}
            onClose={handleModalClose}
            onSuccess={handleSuccess}
            zone={selectedZone}
          />
        </>
      )}

      <BulkPricingUpdateModal
        isOpen={isBulkPricingModalOpen}
        onClose={handleModalClose}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
