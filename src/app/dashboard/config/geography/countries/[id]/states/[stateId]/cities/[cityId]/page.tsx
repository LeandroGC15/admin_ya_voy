'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCountry, useState as useStateHook, useCity } from '@/features/config/hooks/use-geography';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, AlertTriangle, MapPin, Navigation, Settings } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function CityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const countryId = params.id as string;
  const stateId = params.stateId as string;
  const cityId = params.cityId as string;

  // Convertir strings a numbers para los hooks
  const countryIdNumber = parseInt(countryId, 10);
  const stateIdNumber = parseInt(stateId, 10);
  const cityIdNumber = parseInt(cityId, 10);

  const { data: countryData, isLoading: countryLoading } = useCountry(countryIdNumber);
  const { data: stateData, isLoading: stateLoading } = useStateHook(stateIdNumber);
  const { data: cityData, isLoading: cityLoading } = useCity(cityIdNumber);

  const handleBack = () => {
    router.push(`/dashboard/config/geography/countries/${countryId}/states/${stateId}`);
  };

  if (countryLoading || stateLoading || cityLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Cargando ciudad...</span>
      </div>
    );
  }

  if (!countryData || !stateData || !cityData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Error al cargar la ciudad
        </h3>
        <p className="text-gray-500 mb-4">
          No se pudo cargar la información de la ciudad
        </p>
        <Button onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
      </div>
    );
  }

  const country = countryData;
  const state = stateData;
  const city = cityData;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Navigation className="h-8 w-8" />
            {city.name}
          </h1>
          <p className="text-gray-600 mt-1">
            Ciudad de {state.name}, {country.name} - Configuración detallada
          </p>
        </div>
      </div>

      {/* City Details */}
      <Card>
        <CardHeader>
          <CardTitle>Información de la Ciudad</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-medium">Nombre:</span>
              <p className="mt-1">{city.name}</p>
            </div>
            <div>
              <span className="font-medium">Estado:</span>
              <p className="mt-1">{state.name}</p>
            </div>
            <div>
              <span className="font-medium">País:</span>
              <p className="mt-1 flex items-center gap-2">
                {country.flag && <span>{country.flag}</span>}
                {country.name}
              </p>
            </div>
            <div>
              <span className="font-medium">Estado:</span>
              <p className="mt-1">
                <Badge variant={city.isActive ? "secondary" : "destructive"}>
                  {city.isActive ? 'Activa' : 'Inactiva'}
                </Badge>
              </p>
            </div>
            <div>
              <span className="font-medium">Coordenadas:</span>
              <p className="mt-1 font-mono">
                {city.latitude ? Number(city.latitude).toFixed(4) : 'N/A'}, {city.longitude ? Number(city.longitude).toFixed(4) : 'N/A'}
              </p>
            </div>
            <div>
              <span className="font-medium">Zona Horaria:</span>
              <p className="mt-1">{city.timezone || 'No especificada'}</p>
            </div>
            <div>
              <span className="font-medium">Población:</span>
              <p className="mt-1">{city.population?.toLocaleString() || 'No especificada'}</p>
            </div>
            <div>
              <span className="font-medium">Área:</span>
              <p className="mt-1">{city.areaKm2 ? `${city.areaKm2.toLocaleString()} km²` : 'No especificada'}</p>
            </div>
            <div>
              <span className="font-medium">Elevación:</span>
              <p className="mt-1">{city.elevation ? `${city.elevation}m` : 'No especificada'}</p>
            </div>
            <div>
              <span className="font-medium">Radio de Servicio:</span>
              <p className="mt-1">{city.serviceRadius ? `${city.serviceRadius}km` : 'No definido'}</p>
            </div>
            <div>
              <span className="font-medium">Multiplicador:</span>
              <p className="mt-1">{city.pricingMultiplier ? `${city.pricingMultiplier}x` : 'No definido'}</p>
            </div>
            <div>
              <span className="font-medium">Tarifa Servicio:</span>
              <p className="mt-1">{city.serviceFee ? `$${city.serviceFee}` : 'No definida'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Service Configuration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Postal Codes */}
        {city.postalCodes && city.postalCodes.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Códigos Postales</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {city.postalCodes.map((code, index) => (
                  <Badge key={index} variant="outline">{code}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Restricted Areas */}
        {city.restrictedAreas && city.restrictedAreas.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Áreas Restringidas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {city.restrictedAreas.map((area, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-red-50 rounded">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    <span className="text-sm">{area}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Premium Zones */}
        {city.premiumZones && city.premiumZones.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Zonas Premium</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {city.premiumZones.map((zone, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-yellow-50 rounded">
                    <Settings className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm">{zone}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Service Zones Count */}
        <Card>
          <CardHeader>
            <CardTitle>Zonas de Servicio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {city.serviceZonesCount || 0}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Zonas de servicio configuradas
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Configurar Zonas de Servicio
            </Button>
            <Button variant="outline">
              <MapPin className="h-4 w-4 mr-2" />
              Ver en Mapa
            </Button>
            <Button variant="outline">
              <Navigation className="h-4 w-4 mr-2" />
              Gestionar Tarifas
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
