'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Building2, Navigation } from 'lucide-react';
import {
  Search,
  Plus,
  Globe,
  Settings,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Users,
  DollarSign,
  ArrowLeft,
  Upload
} from 'lucide-react';

// Import our new components
import { CountriesTable } from '@/features/config/components/geography';
import { CountriesCreateModal } from '@/features/config/components/geography';
import { CountriesEditModal } from '@/features/config/components/geography';
import { CountriesDeleteModal } from '@/features/config/components/geography';
import { CountriesToggleModal } from '@/features/config/components/geography';
import { CountriesBulkImportModal } from '@/features/config/components/geography';

// Import hooks
import {
  useCountries,
  useCountriesStatsByContinent,
  useStatesStatsByCountry,
  useCitiesStatsByState,
  useBulkImportCountries
} from '@/features/config/hooks/use-geography';

// Import types
import { Country } from '@/features/config/schemas/geography.schemas';

export default function CountriesPage() {
  const router = useRouter();

  // State management
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentTab, setCurrentTab] = useState<'overview' | 'analytics'>('overview');
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);

  // Modal states
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [toggleModalOpen, setToggleModalOpen] = useState(false);
  const [bulkImportModalOpen, setBulkImportModalOpen] = useState(false);

  // API data
  const { data: countriesData, isLoading, error } = useCountries({
    search: searchTerm,
    page: currentPage,
    limit: 10,
  });
  const { data: countriesStats } = useCountriesStatsByContinent();
  const { data: statesStats, isLoading: statesStatsLoading } = useStatesStatsByCountry();
  const { data: citiesStats, isLoading: citiesStatsLoading } = useCitiesStatsByState();

  // Handle search
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle country selection and actions
  const handleCountrySelect = (country: Country) => {
    router.push(`/dashboard/config/geography/countries/${country.id}`);
  };

  const handleCountryEdit = (country: Country) => {
    setSelectedCountry(country);
    setEditModalOpen(true);
  };

  const handleCountryDelete = (country: Country) => {
    setSelectedCountry(country);
    setDeleteModalOpen(true);
  };

  const handleCountryToggle = (country: Country) => {
    setSelectedCountry(country);
    setToggleModalOpen(true);
  };

  // Handle modal close
  const handleModalClose = () => {
    setCreateModalOpen(false);
    setEditModalOpen(false);
    setDeleteModalOpen(false);
    setToggleModalOpen(false);
    setBulkImportModalOpen(false);
    setSelectedCountry(null);
  };

  // Handle success actions
  const handleSuccess = () => {
    handleModalClose();
    // Data will be refreshed automatically by React Query
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Link href="/dashboard/config/geography" className="flex items-center gap-1 hover:text-gray-900">
          <ArrowLeft className="h-4 w-4" />
          Configuración Geográfica
        </Link>
        <span>/</span>
        <span className="font-medium">Países</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Globe className="h-8 w-8" />
            Gestión de Países
          </h1>
          <p className="text-gray-600 mt-1">
            Administra países, monedas, impuestos y configuraciones territoriales
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => setCreateModalOpen(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Nuevo País
          </Button>
          <Button
            onClick={() => setBulkImportModalOpen(true)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            Importar CSV
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <Input
            placeholder="Buscar por nombre, código ISO, continente o moneda..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch(searchTerm)}
          />
        </div>
        <Button
          onClick={() => handleSearch(searchTerm)}
          variant="outline"
        >
          <Search className="h-4 w-4 mr-2" />
          Buscar
        </Button>
      </div>

      {/* Main Content */}
      <Tabs value={currentTab} onValueChange={(value) => setCurrentTab(value as 'overview' | 'analytics')} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">Vista General</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab - Main Table */}
        <TabsContent value="overview" className="space-y-6">
          {/* Analytics Cards */}
          {countriesStats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Países</CardTitle>
                  <Globe className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {countriesStats.stats.reduce((acc, stat) => acc + stat.count, 0)}
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="secondary" className="text-xs">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      registrados
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Continentes</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {countriesStats.stats.length}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Continentes con países
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Mayor Continente</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {Math.max(...countriesStats.stats.map(stat => stat.count))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Máximo países por continente
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tasa Promedio IVA</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">
                    {countriesData ? (
                      `${(countriesData.countries
                        .filter(c => c.vatRate)
                        .reduce((acc, c) => acc + (c.vatRate || 0), 0) /
                        countriesData.countries.filter(c => c.vatRate).length || 0
                      ).toFixed(1)}%`
                    ) : '0%'}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    IVA promedio configurado
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <div className="text-center">
                  <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-red-900 mb-2">
                    Error al cargar países
                  </h3>
                  <p className="text-red-700">
                    {error.message || 'Ocurrió un error al cargar la lista de países'}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Main Countries Table */}
          <CountriesTable
            data={countriesData}
            loading={isLoading}
            onCountrySelect={handleCountrySelect}
            onCountryEdit={handleCountryEdit}
            onCountryDelete={handleCountryDelete}
            onCountryToggle={handleCountryToggle}
          />
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Países</CardTitle>
                <Globe className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {countriesStats?.stats?.reduce((acc, stat) => acc + stat.count, 0) || 0}
                </div>
                <p className="text-xs text-muted-foreground">países registrados</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Estados</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {statesStats?.stats?.reduce((acc, stat) => acc + stat.statesCount, 0) || 0}
                </div>
                <p className="text-xs text-muted-foreground">estados/provincias</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Ciudades</CardTitle>
                <Navigation className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {citiesStats?.stats?.reduce((acc, stat) => acc + stat.citiesCount, 0) || 0}
                </div>
                <p className="text-xs text-muted-foreground">ciudades registradas</p>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {/* Countries by Continent */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Países por Continente
                </CardTitle>
              </CardHeader>
              <CardContent>
                {countriesStats ? (
                  <div className="space-y-3">
                    {countriesStats.stats
                      .sort((a, b) => b.count - a.count)
                      .map((stat) => (
                        <div key={stat.continent} className="flex justify-between items-center">
                          <span className="capitalize font-medium">{stat.continent}</span>
                          <Badge variant="secondary" className="font-bold">
                            {stat.count}
                          </Badge>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Cargando datos...</p>
                )}
              </CardContent>
            </Card>

            {/* States by Country */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Estados por País
                </CardTitle>
              </CardHeader>
              <CardContent>
                {statesStatsLoading ? (
                  <div className="text-center py-4">Cargando...</div>
                ) : statesStats?.stats && statesStats.stats.length > 0 ? (
                  <div className="space-y-3">
                    {statesStats.stats
                      .sort((a, b) => b.statesCount - a.statesCount)
                      .slice(0, 5)
                      .map((stat) => (
                        <div key={stat.countryId} className="flex justify-between items-center">
                          <div className="flex-1 min-w-0">
                            <span className="text-sm font-medium truncate">{stat.countryName}</span>
                            <span className="text-xs text-gray-500 block">{stat.countryCode}</span>
                          </div>
                          <Badge variant="secondary">{stat.statesCount}</Badge>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">No hay datos disponibles</div>
                )}
              </CardContent>
            </Card>

            {/* Cities by State */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Navigation className="h-5 w-5" />
                  Ciudades por Estado
                </CardTitle>
              </CardHeader>
              <CardContent>
                {citiesStatsLoading ? (
                  <div className="text-center py-4">Cargando...</div>
                ) : citiesStats?.stats && citiesStats.stats.length > 0 ? (
                  <div className="space-y-3">
                    {citiesStats.stats
                      .sort((a, b) => b.citiesCount - a.citiesCount)
                      .slice(0, 5)
                      .map((stat) => (
                        <div key={stat.stateId} className="flex justify-between items-center">
                          <div className="flex-1 min-w-0">
                            <span className="text-sm font-medium truncate">{stat.stateName}</span>
                            <span className="text-xs text-gray-500 block">{stat.countryName}</span>
                          </div>
                          <Badge variant="secondary">{stat.citiesCount}</Badge>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">No hay datos disponibles</div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Top Countries by Population */}
          <Card>
              <CardHeader>
                <CardTitle>Países por Población</CardTitle>
              </CardHeader>
              <CardContent>
                {countriesData ? (
                  <div className="space-y-3">
                    {countriesData.countries
                      .filter(country => country.population)
                      .sort((a, b) => (b.population || 0) - (a.population || 0))
                      .slice(0, 10)
                      .map((country) => (
                        <div key={country.id} className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            {country.flag && <span>{country.flag}</span>}
                            <span className="font-medium">{country.name}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {(country.population || 0).toLocaleString()}
                          </span>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Cargando datos...</p>
                )}
              </CardContent>
            </Card>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <CountriesCreateModal
        isOpen={createModalOpen}
        onClose={handleModalClose}
        onSuccess={handleSuccess}
      />

      <CountriesEditModal
        isOpen={editModalOpen}
        onClose={handleModalClose}
        country={selectedCountry}
        onSuccess={handleSuccess}
      />

      <CountriesDeleteModal
        isOpen={deleteModalOpen}
        onClose={handleModalClose}
        country={selectedCountry}
        onSuccess={handleSuccess}
      />

      <CountriesToggleModal
        isOpen={toggleModalOpen}
        onClose={handleModalClose}
        country={selectedCountry}
        onSuccess={handleSuccess}
      />

      <CountriesBulkImportModal
        isOpen={bulkImportModalOpen}
        onClose={handleModalClose}
        onSuccess={handleSuccess}
      />
    </div>
  );
}