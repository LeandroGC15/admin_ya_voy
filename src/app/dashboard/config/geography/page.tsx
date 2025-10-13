'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  MapPin,
  Globe,
  Building2,
  Navigation,
  ArrowRight,
  Plus,
  Settings,
  BarChart3
} from 'lucide-react';

import {
  useCountriesStatsByContinent,
  useStatesStatsByCountry,
  useCitiesStatsByState
} from '@/features/config/hooks/use-geography';
import { usePricingStats } from '@/features/config/hooks/use-service-zones';

export default function GeographyConfigPage() {
  const { data: countriesStats, isLoading: countriesLoading } = useCountriesStatsByContinent();
  const { data: statesStats, isLoading: statesLoading } = useStatesStatsByCountry();
  const { data: citiesStats, isLoading: citiesLoading } = useCitiesStatsByState();
  const { data: serviceZonesStats, isLoading: serviceZonesLoading } = usePricingStats();

  // Calculate totals from stats
  const totalCountries = countriesStats?.stats?.reduce((acc, stat) => acc + stat.count, 0) || 0;
  const totalStates = statesStats?.stats?.reduce((acc, stat) => acc + stat.statesCount, 0) || 0;
  const totalCities = citiesStats?.stats?.reduce((acc, stat) => acc + stat.citiesCount, 0) || 0;
  const totalServiceZones = serviceZonesStats?.totalZones || 0;

  const geographySections = [
    {
      title: 'Países',
      description: 'Gestiona países, monedas, impuestos y configuraciones territoriales. Desde aquí podrás acceder a estados y ciudades.',
      icon: Globe,
      href: '/dashboard/config/geography/countries',
      stats: `${totalCountries} países registrados`,
      color: 'bg-blue-500',
      features: ['Códigos ISO', 'Monedas', 'Zonas horarias', 'Tasas fiscales', 'Estados y ciudades']
    },
    {
      title: 'Zonas de Servicio',
      description: 'Gestiona zonas de servicio con polígonos geográficos, pricing dinámico y análisis de cobertura. Configura multiplicadores de pricing y demanda.',
      icon: MapPin,
      href: '/dashboard/config/geography/service-zones',
      stats: `${totalServiceZones} zonas de servicio`,
      color: 'bg-green-500',
      features: ['Polígonos geográficos', 'Pricing dinámico', 'Análisis de cobertura', 'Multiplicadores de demanda', 'Validación de geometría']
    }
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <MapPin className="h-8 w-8" />
            Configuración Geográfica
          </h1>
          <p className="text-gray-600 mt-1">
            Administra zonas de cobertura siguiendo el flujo jerárquico: País → Estado → Ciudad
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            asChild
            className="flex items-center gap-2"
          >
            <Link href="/dashboard/config/geography/countries">
              <Plus className="h-4 w-4" />
              Nuevo País
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Países</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {countriesLoading ? '...' : totalCountries}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {countriesLoading ? 'Cargando...' : 'países registrados'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Estados</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statesLoading ? '...' : totalStates}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {statesLoading ? 'Cargando...' : 'estados/provincias registrados'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Ciudades</CardTitle>
            <Navigation className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {citiesLoading ? '...' : totalCities}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {citiesLoading ? 'Cargando...' : 'ciudades registradas'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Zonas de Servicio</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {serviceZonesLoading ? '...' : totalServiceZones}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {serviceZonesLoading ? 'Cargando...' : 'zonas configuradas'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Geography Sections */}
      <div className="grid grid-cols-1 gap-6">
        {geographySections.map((section) => {
          const Icon = section.icon;
          return (
            <Card key={section.href} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg ${section.color} flex-shrink-0`}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-2xl mb-2">{section.title}</CardTitle>
                      <CardDescription className="text-base">{section.description}</CardDescription>
                    </div>
                  </div>
                  <ArrowRight className="h-6 w-6 text-gray-400 flex-shrink-0" />
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="text-lg font-semibold text-gray-900 mb-3">
                      {section.stats}
                    </div>
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium text-gray-700">Características principales:</h4>
                      <ul className="text-sm text-gray-600 space-y-2">
                        {section.features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="flex flex-col justify-end">
                    <div className="flex gap-3">
                      <Button asChild className="flex-1">
                        <Link href={section.href} className="flex items-center gap-2">
                          <Settings className="h-4 w-4" />
                          {section.title === 'Zonas de Servicio' ? 'Gestionar Zonas' : 'Gestionar Países'}
                        </Link>
                      </Button>
                      <Button asChild variant="outline">
                        <Link href={`${section.href}?tab=analytics`} className="flex items-center gap-2">
                          <BarChart3 className="h-4 w-4" />
                          Analytics
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Detailed Statistics */}
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
            {countriesLoading ? (
              <div className="text-center py-4">Cargando...</div>
            ) : countriesStats?.stats && countriesStats.stats.length > 0 ? (
              <div className="space-y-3">
                {countriesStats.stats
                  .sort((a, b) => b.count - a.count)
                  .slice(0, 5)
                  .map((stat) => (
                    <div key={stat.continent} className="flex justify-between items-center">
                      <span className="text-sm font-medium">{stat.continent}</span>
                      <Badge variant="secondary">{stat.count}</Badge>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">No hay datos disponibles</div>
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
            {statesLoading ? (
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
            {citiesLoading ? (
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

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
          <CardDescription>
            Comienza gestionando países para luego acceder a sus estados y ciudades
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto">
            <Button asChild variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <Link href="/dashboard/config/geography/countries">
                <Globe className="h-6 w-6 text-blue-500" />
                <span className="text-sm font-medium">Gestionar Países</span>
              </Link>
            </Button>

            <Button asChild variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <Link href="/dashboard/reports/geography">
                <BarChart3 className="h-6 w-6 text-orange-500" />
                <span className="text-sm font-medium">Ver Reportes</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

