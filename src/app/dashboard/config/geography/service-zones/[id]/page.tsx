'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  ArrowLeft,
  Edit,
  Trash2,
  ToggleLeft,
  MapPin,
  DollarSign,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Target,
  Navigation,
  BarChart3
} from 'lucide-react';
import { GoogleMapProvider } from '@/components/maps/GoogleMapProvider';
import { ZonesVisualizationMap } from '@/components/maps/ZonesVisualizationMap';
import { ServiceZone } from '@/interfaces/GeographyInterfaces';
import { useServiceZone } from '@/features/config/hooks/use-service-zones';

export default function ServiceZoneDetailPage() {
  const params = useParams();
  const router = useRouter();
  const zoneId = parseInt(params.id as string);

  const { data: zone, isLoading, error } = useServiceZone(zoneId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2">Cargando zona de servicio...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Error al cargar la zona de servicio: {error.message}
          </AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </div>
      </div>
    );
  }

  if (!zone) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Zona de servicio no encontrada
          </AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </div>
      </div>
    );
  }

  const zonesForMap: ServiceZone[] = [zone];

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{zone.name}</h1>
            <p className="text-gray-600">
              Zona de servicio • {zone.city?.name}, {zone.city?.state?.name}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
          <Button variant="outline">
            <ToggleLeft className="h-4 w-4 mr-2" />
            {zone.isActive ? 'Desactivar' : 'Activar'}
          </Button>
          <Button variant="destructive">
            <Trash2 className="h-4 w-4 mr-2" />
            Eliminar
          </Button>
        </div>
      </div>

      {/* Status Badge */}
      <div className="flex items-center space-x-4">
        <Badge variant={zone.isActive ? 'default' : 'secondary'} className="text-sm">
          {zone.isActive ? 'Activa' : 'Inactiva'}
        </Badge>
        <Badge variant="outline" className="text-sm">
          {zone.zoneType === 'REGULAR' ? 'Regular' :
           zone.zoneType === 'PREMIUM' ? 'Premium' : 'Restringida'}
        </Badge>
        <span className="text-sm text-gray-500">
          Creada: {new Date(zone.createdAt).toLocaleDateString()}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Map Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Ubicación de la Zona
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96 rounded-lg overflow-hidden border">
                <GoogleMapProvider>
                  <ZonesVisualizationMap
                    zones={zonesForMap}
                    onZoneClick={(clickedZone) => {
                      // Could open zone details or zoom in
                      console.log('Zone clicked:', clickedZone);
                    }}
                    selectedZoneId={zone.id}
                  />
                </GoogleMapProvider>
              </div>
            </CardContent>
          </Card>

          {/* Geometry Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Información de Geometría
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-600">Centro Geográfico</p>
                  <p className="text-sm">
                    {typeof zone.centerLat === 'number' && typeof zone.centerLng === 'number'
                      ? `${zone.centerLat.toFixed(6)}, ${zone.centerLng.toFixed(6)}`
                      : 'Coordenadas no disponibles'
                    }
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-600">Tipo de Geometría</p>
                  <p className="text-sm">Polígono GeoJSON</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-600">Vértices</p>
                  <p className="text-sm">{zone.boundaries.coordinates[0].length} puntos</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-600">Última Modificación</p>
                  <p className="text-sm">{new Date(zone.updatedAt).toLocaleDateString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Usage Statistics (Placeholder) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Estadísticas de Uso
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Las estadísticas de uso estarán disponibles próximamente cuando se implemente el sistema de analytics.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Pricing Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Información de Pricing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Multiplicador de Precio</span>
                  <Badge variant="outline">{zone.pricingMultiplier}x</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Multiplicador de Demanda</span>
                  <Badge variant="outline">{zone.demandMultiplier}x</Badge>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Mín. Conductores</span>
                  <span className="text-sm">{zone.minDrivers || 'No definido'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Máx. Conductores</span>
                  <span className="text-sm">{zone.maxDrivers || 'No definido'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Navigation className="h-5 w-5" />
                Ubicación
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">País</span>
                  <span className="text-sm">{zone.city?.state?.country?.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Estado</span>
                  <span className="text-sm">{zone.city?.state?.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Ciudad</span>
                  <span className="text-sm">{zone.city?.name}</span>
                </div>
              </div>

              {zone.city?.latitude && zone.city?.longitude &&
                typeof zone.city.latitude === 'number' && typeof zone.city.longitude === 'number' && (
                <>
                  <Separator />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-600">Coordenadas de la Ciudad</p>
                    <p className="text-xs text-gray-500">
                      {zone.city.latitude.toFixed(6)}, {zone.city.longitude.toFixed(6)}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Zone Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Estado de la Zona
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Estado</span>
                  <Badge variant={zone.isActive ? 'default' : 'secondary'}>
                    {zone.isActive ? 'Activa' : 'Inactiva'}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">Tipo</span>
                  <Badge variant="outline">
                    {zone.zoneType === 'REGULAR' ? 'Regular' :
                     zone.zoneType === 'PREMIUM' ? 'Premium' : 'Restringida'}
                  </Badge>
                </div>

                <Separator />

                <div className="text-xs text-gray-500 space-y-1">
                  <p>ID: {zone.id}</p>
                  <p>Creada: {new Date(zone.createdAt).toLocaleString()}</p>
                  <p>Modificada: {new Date(zone.updatedAt).toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Peak Hours (if configured) */}
          {zone.peakHours && (zone.peakHours.weekdays.length > 0 || zone.peakHours.weekends.length > 0) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Horarios Pico
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {zone.peakHours.weekdays.length > 0 && (
                    <div>
                      <p className="text-sm font-medium">Días de semana</p>
                      <p className="text-xs text-gray-600">{zone.peakHours.weekdays.join(', ')}</p>
                    </div>
                  )}
                  {zone.peakHours.weekends.length > 0 && (
                    <div>
                      <p className="text-sm font-medium">Fines de semana</p>
                      <p className="text-xs text-gray-600">{zone.peakHours.weekends.join(', ')}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
