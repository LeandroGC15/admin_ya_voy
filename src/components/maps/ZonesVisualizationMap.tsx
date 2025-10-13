'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { GoogleMap, Polygon, InfoWindow } from '@react-google-maps/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Users, DollarSign, Clock, Eye } from 'lucide-react';
import { getZoneStyle, getZoneTypeLabel, getZoneStatusLabel, getZoneStatusColor, convertZoneTypeEnum } from '@/lib/maps/zone-colors';
import type { ServiceZone } from '@/features/config/schemas/service-zones.schemas';

const mapContainerStyle = {
  width: '100%',
  height: '500px',
};

const defaultCenter = {
  lat: 34.0522,
  lng: -118.2437,
};

const defaultZoom = 13;

interface ZonesVisualizationMapProps {
  zones: ServiceZone[];
  center?: { lat: number; lng: number };
  zoom?: number;
  onZoneClick?: (zone: ServiceZone) => void;
  selectedZoneId?: number;
  showLegend?: boolean;
  className?: string;
}

export function ZonesVisualizationMap({
  zones,
  center = defaultCenter,
  zoom = defaultZoom,
  onZoneClick,
  selectedZoneId,
  showLegend = true,
  className = '',
}: ZonesVisualizationMapProps) {
  // Validate and sanitize center coordinates
  const validCenter = React.useMemo(() => {
    console.log('ZonesVisualizationMap - Received center:', center);
    
    if (!center || typeof center.lat !== 'number' || typeof center.lng !== 'number') {
      console.warn('ZonesVisualizationMap - Invalid center, using default:', center);
      return defaultCenter;
    }
    
    if (isNaN(center.lat) || isNaN(center.lng)) {
      console.warn('ZonesVisualizationMap - NaN coordinates, using default:', center);
      return defaultCenter;
    }
    
    if (center.lat < -90 || center.lat > 90 || center.lng < -180 || center.lng > 180) {
      console.warn('ZonesVisualizationMap - Out of bounds coordinates, using default:', center);
      return defaultCenter;
    }
    
    console.log('ZonesVisualizationMap - Using valid center:', center);
    return center;
  }, [center]);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [selectedZone, setSelectedZone] = useState<ServiceZone | null>(null);
  const [infoWindowPosition, setInfoWindowPosition] = useState<{ lat: number; lng: number } | null>(null);

  // Handle map load
  const onMapLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
    
    // Fit map to show all zones if any
    if (zones.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      zones.forEach(zone => {
        zone.boundaries.coordinates[0].forEach(coord => {
          bounds.extend(new google.maps.LatLng(coord[1], coord[0]));
        });
      });
      map.fitBounds(bounds);
    }
  }, [zones]);

  // Handle zone click
  const handleZoneClick = useCallback((zone: ServiceZone, event: google.maps.MapMouseEvent) => {
    setSelectedZone(zone);
    if (event.latLng) {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();

      // Validate coordinates before setting info window position
      if (typeof lat === 'number' && typeof lng === 'number' &&
          !isNaN(lat) && !isNaN(lng)) {
        setInfoWindowPosition({
          lat,
          lng,
        });
      } else {
        console.warn('Invalid click coordinates:', lat, lng);
        setInfoWindowPosition(null);
      }
    } else {
      setInfoWindowPosition(null);
    }
    onZoneClick?.(zone);
  }, [onZoneClick]);

  // Close info window
  const closeInfoWindow = useCallback(() => {
    setSelectedZone(null);
    setInfoWindowPosition(null);
  }, []);

  // Auto-select zone if selectedZoneId is provided
  useEffect(() => {
    if (selectedZoneId && zones.length > 0) {
      const zone = zones.find(z => z.id === selectedZoneId);
      if (zone) {
        setSelectedZone(zone);

        // Validate center coordinates before setting info window position
        if (typeof zone.centerLat === 'number' && typeof zone.centerLng === 'number' &&
            !isNaN(zone.centerLat) && !isNaN(zone.centerLng)) {
          setInfoWindowPosition({
            lat: zone.centerLat,
            lng: zone.centerLng,
          });

          // Center map on selected zone
          if (map) {
            map.setCenter({ lat: zone.centerLat, lng: zone.centerLng });
            map.setZoom(15);
          }
        } else {
          console.warn('Invalid center coordinates for zone:', zone.id, zone.centerLat, zone.centerLng);
          setInfoWindowPosition(null);
        }
      }
    }
  }, [selectedZoneId, zones, map]);

  // Get zone statistics
  const getZoneStats = () => {
    const totalZones = zones.length;
    const activeZones = zones.filter(z => z.isActive).length;
    const zonesByType = zones.reduce((acc, zone) => {
      acc[zone.zoneType] = (acc[zone.zoneType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const avgPricing = zones.length > 0 
      ? zones.reduce((sum, zone) => sum + zone.pricingMultiplier, 0) / zones.length 
      : 0;
    
    const avgDemand = zones.length > 0 
      ? zones.reduce((sum, zone) => sum + zone.demandMultiplier, 0) / zones.length 
      : 0;

    return {
      totalZones,
      activeZones,
      zonesByType,
      avgPricing: avgPricing.toFixed(2),
      avgDemand: avgDemand.toFixed(2),
    };
  };

  const stats = getZoneStats();

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Map Container */}
      <div className="relative">
        <div className="rounded-lg overflow-hidden border">
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={validCenter}
            zoom={zoom}
            onLoad={onMapLoad}
            options={{
              disableDefaultUI: false,
              zoomControl: true,
              streetViewControl: false,
              mapTypeControl: true,
              fullscreenControl: true,
            }}
          >
            {/* Zones */}
            {zones.map((zone) => (
              <Polygon
                key={zone.id}
                paths={zone.boundaries.coordinates[0].map(coord => ({
                  lat: coord[1],
                  lng: coord[0],
                }))}
                options={{
                  ...getZoneStyle(convertZoneTypeEnum(zone.zoneType), zone.isActive),
                  clickable: true,
                }}
                onClick={(event) => handleZoneClick(zone, event)}
              />
            ))}

            {/* Info Window */}
            {selectedZone && infoWindowPosition &&
             typeof infoWindowPosition.lat === 'number' && typeof infoWindowPosition.lng === 'number' &&
             !isNaN(infoWindowPosition.lat) && !isNaN(infoWindowPosition.lng) && (
              <InfoWindow
                position={infoWindowPosition}
                onCloseClick={closeInfoWindow}
              >
                <div className="p-2 min-w-[250px]">
                  <div className="space-y-3">
                    {/* Zone Header */}
                    <div>
                      <h3 className="font-semibold text-lg">{selectedZone.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge 
                          variant={selectedZone.isActive ? 'default' : 'secondary'}
                          style={{ backgroundColor: getZoneStatusColor(selectedZone.isActive) }}
                        >
                          {getZoneStatusLabel(selectedZone.isActive)}
                        </Badge>
                        <Badge variant="outline">
                          {getZoneTypeLabel(convertZoneTypeEnum(selectedZone.zoneType))}
                        </Badge>
                      </div>
                    </div>

                    {/* Zone Info */}
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span>{selectedZone.city?.name}, {selectedZone.city?.state?.name}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-gray-500" />
                        <span>Pricing: {selectedZone.pricingMultiplier}x</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-500" />
                        <span>Demanda: {selectedZone.demandMultiplier}x</span>
                      </div>

                      {selectedZone.maxDrivers && (
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-gray-500" />
                          <span>Máx. conductores: {selectedZone.maxDrivers}</span>
                        </div>
                      )}

                      {selectedZone.minDrivers && (
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-gray-500" />
                          <span>Mín. conductores: {selectedZone.minDrivers}</span>
                        </div>
                      )}

                      {selectedZone.peakHours && (
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span>Horarios pico configurados</span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="pt-2 border-t">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="w-full"
                        onClick={() => {
                          onZoneClick?.(selectedZone);
                          closeInfoWindow();
                        }}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Ver Detalles
                      </Button>
                    </div>
                  </div>
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        </div>
      </div>

      {/* Statistics Cards */}
      {zones.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.totalZones}</div>
                <div className="text-xs text-gray-600">Total Zonas</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.activeZones}</div>
                <div className="text-xs text-gray-600">Activas</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{stats.avgPricing}</div>
                <div className="text-xs text-gray-600">Pricing Promedio</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{stats.avgDemand}</div>
                <div className="text-xs text-gray-600">Demanda Promedio</div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Legend */}
      {showLegend && zones.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Leyenda de Zonas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span className="text-sm">Regular ({stats.zonesByType.regular || 0})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-orange-500 rounded"></div>
                <span className="text-sm">Premium ({stats.zonesByType.premium || 0})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span className="text-sm">Restringida ({stats.zonesByType.restricted || 0})</span>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-300 rounded"></div>
                <span className="text-sm text-gray-600">Zonas inactivas aparecen con opacidad reducida</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {zones.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-gray-600">
              <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium mb-2">No hay zonas para mostrar</p>
              <p className="text-sm">
                No se encontraron zonas de servicio en esta área.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
