'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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

// Import hooks for overview stats
import {
  useCountriesStatsByContinent,
  useStatesStatsByCountry,
  useCitiesStatsByState
} from '@/features/config/hooks/use-geography';

export default function GeographyConfigPage() {
  const { data: countriesStats } = useCountriesStatsByContinent();
  const { data: statesStats } = useStatesStatsByCountry();
  const { data: citiesStats } = useCitiesStatsByState();

  const totalCountries = countriesStats?.stats?.reduce((acc, stat) => acc + stat.totalCountries, 0) || 0;
  const activeCountries = countriesStats?.stats?.reduce((acc, stat) => acc + stat.activeCountries, 0) || 0;
  const totalStates = statesStats?.stats?.reduce((acc, stat) => acc + stat.totalStates, 0) || 0;
  const activeStates = statesStats?.stats?.reduce((acc, stat) => acc + stat.activeStates, 0) || 0;
  const totalCities = citiesStats?.stats?.reduce((acc, stat) => acc + stat.totalCities, 0) || 0;
  const activeCities = citiesStats?.stats?.reduce((acc, stat) => acc + stat.activeCities, 0) || 0;

  const geographySections = [
    {
      title: 'Países',
      description: 'Gestiona países, monedas, impuestos y configuraciones territoriales. Desde aquí podrás acceder a estados y ciudades.',
      icon: Globe,
      href: '/dashboard/config/geography/countries',
      stats: `${totalCountries} países (${activeCountries} activos)`,
      color: 'bg-blue-500',
      features: ['Códigos ISO', 'Monedas', 'Zonas horarias', 'Tasas fiscales', 'Estados y ciudades']
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Países</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCountries}</div>
            <p className="text-xs text-muted-foreground mt-2">
              {activeCountries} países activos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Estados</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStates}</div>
            <p className="text-xs text-muted-foreground mt-2">
              {activeStates} estados activos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Ciudades</CardTitle>
            <Navigation className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCities}</div>
            <p className="text-xs text-muted-foreground mt-2">
              {activeCities} ciudades activas
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
                          Gestionar Países
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

