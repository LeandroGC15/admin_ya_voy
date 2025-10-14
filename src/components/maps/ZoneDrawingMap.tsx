'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { GoogleMap, DrawingManager, Polygon } from '@react-google-maps/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash2, Edit3, Check, X } from 'lucide-react';
import { googleMapsPolygonToGeoJSON, calculatePolygonCenter } from '@/lib/maps/geojson-utils';
import { getZoneStyle, convertZoneTypeEnum } from '@/lib/maps/zone-colors';
import type { GeoJSONPolygon } from '@/interfaces/GeographyInterfaces';
import type { ServiceZone } from '@/features/config/schemas/service-zones.schemas';

const mapContainerStyle = {
  width: '100%',
  height: '400px',
};

const defaultCenter = {
  lat: 34.0522,
  lng: -118.2437,
};

const defaultZoom = 13;

interface ZoneDrawingMapProps {
  center?: { lat: number; lng: number };
  zoom?: number;
  existingZones?: ServiceZone[];
  onPolygonComplete?: (polygon: GeoJSONPolygon, center: { lat: number; lng: number }) => void;
  onPolygonEdit?: (polygon: GeoJSONPolygon, center: { lat: number; lng: number }) => void;
  onClear?: () => void; // Custom clear function (optional)
  initialPolygon?: GeoJSONPolygon;
  polygon?: GeoJSONPolygon; // Current polygon state (can change externally)
  readOnly?: boolean;
  className?: string;
}

export function ZoneDrawingMap({
  center,
  zoom = defaultZoom,
  existingZones = [],
  onPolygonComplete,
  onPolygonEdit,
  onClear,
  initialPolygon,
  polygon, // Current polygon state (can change externally)
  readOnly = false,
  className = '',
}: ZoneDrawingMapProps) {
  // IMPORTANT: This component expects coordinates to come from the backend API.
  // Do NOT hardcode city coordinates in the frontend. All geographical data
  // should be managed in the backend database and retrieved via API calls.
  //
  // When no coordinates are provided, the component uses default coordinates
  // (Los Angeles) and shows a message to configure coordinates in the backend.

  // Debug: Log component props
  console.log('🎨 ZoneDrawingMap - COMPONENT RENDERED with props:', {
    center,
    zoom,
    existingZonesCount: Array.isArray(existingZones) ? existingZones.length : 0,
    hasInitialPolygon: !!initialPolygon,
    readOnly,
    componentId: Math.random().toString(36).substr(2, 9),
    timestamp: new Date().toISOString()
  });

  // Debug: Track prop changes (only in development)
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 ZoneDrawingMap - Props changed:', {
        center,
        zoom,
        hasExistingZones: Array.isArray(existingZones) && existingZones.length > 0
      });
    }
  }, [center, zoom, existingZones]);

  // Validate and sanitize center coordinates
  const validCenter = React.useMemo(() => {
    console.log('🗺️ ZoneDrawingMap - Received center prop:', center, 'Component key/id:', Math.random());

    if (!center || typeof center.lat !== 'number' || typeof center.lng !== 'number') {
      console.warn('⚠️ ZoneDrawingMap - Invalid center, using default:', center);
      return defaultCenter;
    }

    if (isNaN(center.lat) || isNaN(center.lng)) {
      console.warn('⚠️ ZoneDrawingMap - NaN coordinates, using default:', center);
      return defaultCenter;
    }

    if (center.lat < -90 || center.lat > 90 || center.lng < -180 || center.lng > 180) {
      console.warn('⚠️ ZoneDrawingMap - Out of bounds coordinates, using default:', center);
      return defaultCenter;
    }

    console.log('✅ ZoneDrawingMap - Using valid center:', center);
    return center;
  }, [center]);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [drawingManager, setDrawingManager] = useState<google.maps.drawing.DrawingManager | null>(null);
  const [currentPolygon, setCurrentPolygon] = useState<google.maps.Polygon | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [drawnPolygon, setDrawnPolygon] = useState<GeoJSONPolygon | null>(initialPolygon || null);
  const [polygonCenter, setPolygonCenter] = useState<{ lat: number; lng: number } | null>(null);
  const [vertexMarkers, setVertexMarkers] = useState<google.maps.Marker[]>([]);

  const mapRef = useRef<HTMLDivElement>(null);

  // Drawing manager options
  const drawingManagerOptions: google.maps.drawing.DrawingManagerOptions = {
    drawingMode: null,
    drawingControl: !readOnly,
    drawingControlOptions: {
      position: google.maps.ControlPosition.TOP_CENTER,
      drawingModes: [google.maps.drawing.OverlayType.POLYGON],
    },
    polygonOptions: {
      fillColor: '#3fb1ce',
      fillOpacity: 0.1,
      strokeColor: '#3fb1ce',
      strokeWeight: 2,
      clickable: false,
      editable: true,
      zIndex: 1,
    },
  };

  // Handle map load
  const onMapLoad = useCallback((map: google.maps.Map) => {
    console.log('🗺️ ZoneDrawingMap - Map loaded, setting center to:', validCenter);
    setMap(map);

    // Set the center immediately when map loads - this is the primary way to center the map
    console.log('🎯 ZoneDrawingMap - Setting initial center and zoom:', validCenter, zoom);
    map.setCenter(validCenter);
    map.setZoom(zoom);

    // Fit map to show existing zones if any
    if (Array.isArray(existingZones) && existingZones.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      existingZones.forEach(zone => {
        zone.boundaries.coordinates[0].forEach(coord => {
          bounds.extend(new google.maps.LatLng(coord[1], coord[0]));
        });
      });
      // Only fit bounds if we don't have specific city coordinates
      if (!center || (center.lat === defaultCenter.lat && center.lng === defaultCenter.lng)) {
        map.fitBounds(bounds);
      }
    }
  }, [validCenter, zoom, existingZones, center]);

  // Handle drawing manager load
  const onDrawingManagerLoad = useCallback((drawingManager: google.maps.drawing.DrawingManager) => {
    setDrawingManager(drawingManager);
  }, []);

  // Handle polygon complete
  const onPolygonCompleteHandler = useCallback((polygon: google.maps.Polygon) => {
    if (readOnly) return;
    
    setCurrentPolygon(polygon);
    setIsDrawing(false);
    
    // Convert to GeoJSON
    const geoJSON = googleMapsPolygonToGeoJSON(polygon);
    const center = calculatePolygonCenter(geoJSON);
    
    setDrawnPolygon(geoJSON);
    setPolygonCenter(center);
    
    // Notify parent
    onPolygonComplete?.(geoJSON, center);
  }, [readOnly, onPolygonComplete]);

  // Handle polygon edit
  const onPolygonEditHandler = useCallback(() => {
    if (!currentPolygon || readOnly) {
      console.log('🚫 ZoneDrawingMap - onPolygonEditHandler skipped (no polygon or readonly)');
      return;
    }

    console.log('🔄 ZoneDrawingMap - Converting polygon to GeoJSON...');

    // Convert to GeoJSON
    const geoJSON = googleMapsPolygonToGeoJSON(currentPolygon);
    const center = calculatePolygonCenter(geoJSON);

    console.log('📐 ZoneDrawingMap - Polygon converted:', {
      vertices: geoJSON.coordinates[0].length - 1, // -1 because it's closed
      center: center,
      type: geoJSON.type
    });

    setDrawnPolygon(geoJSON);
    setPolygonCenter(center);

    // Notify parent
    console.log('📤 ZoneDrawingMap - Notifying parent component');
    onPolygonEdit?.(geoJSON, center);
  }, [currentPolygon, readOnly, onPolygonEdit]);

  // Start drawing
  const startDrawing = useCallback(() => {
    if (drawingManager && !readOnly) {
      drawingManager.setDrawingMode(google.maps.drawing.OverlayType.POLYGON);
      setIsDrawing(true);
    }
  }, [drawingManager, readOnly]);

  // Cancel drawing
  const cancelDrawing = useCallback(() => {
    if (drawingManager) {
      drawingManager.setDrawingMode(null);
      setIsDrawing(false);
    }
    if (currentPolygon) {
      currentPolygon.setMap(null);
      setCurrentPolygon(null);
    }
    setDrawnPolygon(null);
    setPolygonCenter(null);
  }, [drawingManager, currentPolygon]);

  // Clear polygon
  const clearPolygon = useCallback(() => {
    if (currentPolygon) {
      currentPolygon.setMap(null);
      setCurrentPolygon(null);
    }

    // Clear vertex markers
    vertexMarkers.forEach(marker => {
      marker.setMap(null);
    });
    setVertexMarkers([]);

    setDrawnPolygon(null);
    setPolygonCenter(null);
    setIsEditing(false);
  }, [currentPolygon, vertexMarkers]);

  // Edit polygon
  const editPolygon = useCallback(() => {
    if (currentPolygon && !readOnly && (polygon || drawnPolygon)) {
      console.log('🎨 ZoneDrawingMap - Starting polygon edit mode with vertex markers');
      setIsEditing(true);

      // Create draggable markers for each vertex
      const activePolygon = polygon || drawnPolygon;
      const path = activePolygon!.coordinates[0];

      const markers = path.map((coord, index) => {
        const marker = new google.maps.Marker({
          position: { lat: coord[1], lng: coord[0] },
          map: map,
          draggable: true,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: '#4285F4',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2,
          },
        });

        // Handle marker drag
        google.maps.event.addListener(marker, 'drag', () => {
          const newPosition = marker.getPosition();
          if (newPosition) {
            // Update the polygon path
            const newPath = [...path];
            newPath[index] = [newPosition.lng(), newPosition.lat()];
            const updatedPolygon = {
              ...activePolygon!,
              coordinates: [newPath],
            };

            // Update polygon visual
            const latLngPath = newPath.map(coord => new google.maps.LatLng(coord[1], coord[0]));
            currentPolygon.setPaths(latLngPath);

            // Update internal state
            const center = calculatePolygonCenter(updatedPolygon);
            setDrawnPolygon(updatedPolygon);
            setPolygonCenter(center);
          }
        });

        // Handle drag end
        google.maps.event.addListener(marker, 'dragend', () => {
          console.log('🎯 ZoneDrawingMap - Vertex moved via marker');
          // Update markers positions
          updateVertexMarkers();
        });

        return marker;
      });

      setVertexMarkers(markers);
      console.log('✅ ZoneDrawingMap - Vertex markers created');
    }
  }, [currentPolygon, readOnly, polygon, drawnPolygon, map]);

  // Update vertex markers positions
  const updateVertexMarkers = useCallback(() => {
    if (vertexMarkers.length > 0 && (polygon || drawnPolygon)) {
      const activePolygon = polygon || drawnPolygon;
      const path = activePolygon!.coordinates[0];

      vertexMarkers.forEach((marker, index) => {
        if (path[index]) {
          const newPosition = new google.maps.LatLng(path[index][1], path[index][0]);
          marker.setPosition(newPosition);
        }
      });
    }
  }, [vertexMarkers, polygon, drawnPolygon]);

  // Update vertex markers when polygon changes during editing
  useEffect(() => {
    if (isEditing && vertexMarkers.length > 0) {
      updateVertexMarkers();
    }
  }, [polygon, drawnPolygon, isEditing, vertexMarkers.length, updateVertexMarkers]);

  // Finish editing
  const finishEditing = useCallback(() => {
    if (currentPolygon) {
      setIsEditing(false);

      // Remove vertex markers
      vertexMarkers.forEach(marker => {
        marker.setMap(null);
      });
      setVertexMarkers([]);

      // Notify parent with final polygon state
      onPolygonEditHandler();
    }
  }, [currentPolygon, vertexMarkers, onPolygonEditHandler]);

  // Initialize with existing polygon
  useEffect(() => {
    if (initialPolygon && map) {
      console.log('🏗️ ZoneDrawingMap - Initializing polygon:', {
        coordsCount: initialPolygon.coordinates[0].length,
        hasCurrentPolygon: !!currentPolygon
      });

      const path = initialPolygon.coordinates[0].map(coord =>
        new google.maps.LatLng(coord[1], coord[0])
      );

      const polygon = new google.maps.Polygon({
        paths: path,
        ...getZoneStyle('regular', true),
        editable: false,
      });

      polygon.setMap(map);
      setCurrentPolygon(polygon);
      setDrawnPolygon(initialPolygon);
      setPolygonCenter(calculatePolygonCenter(initialPolygon));

      console.log('✅ ZoneDrawingMap - Polygon initialized');
    }
  }, [initialPolygon, map]);

  // Update polygon when drawnPolygon changes (for internal edits) or when polygon prop changes (from external)
  useEffect(() => {
    if (currentPolygon && map && !isEditing) {
      // Priority: use polygon prop if provided, otherwise use drawnPolygon
      const activePolygon = polygon || drawnPolygon;

      if (activePolygon) {
        console.log('🔄 ZoneDrawingMap - Updating polygon:', {
          fromProp: !!polygon,
          fromInternal: !polygon && !!drawnPolygon,
          coordsCount: activePolygon.coordinates[0].length
        });

        // Update the Google Maps polygon with new coordinates
        const path = activePolygon.coordinates[0].map(coord =>
          new google.maps.LatLng(coord[1], coord[0])
        );

        currentPolygon.setPaths(path);
        setPolygonCenter(calculatePolygonCenter(activePolygon));

        // If updating from prop, also update internal state
        if (polygon && polygon !== drawnPolygon) {
          setDrawnPolygon(polygon);
        }

        console.log('✅ ZoneDrawingMap - Polygon updated');
      }
    }
  }, [polygon, drawnPolygon, currentPolygon, map, isEditing]);

  // Update map center when center prop changes (only for updates after initial load)
  useEffect(() => {
    if (map && validCenter && center) {
      console.log('🔄 ZoneDrawingMap - Updating existing map center to:', validCenter);

      try {
        map.setCenter(validCenter);
        map.setZoom(zoom);
        console.log('✅ ZoneDrawingMap - Map center updated successfully');
      } catch (error) {
        console.error('❌ ZoneDrawingMap - Error updating map center:', error);
      }
    }
  }, [map, validCenter, zoom, center]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Map Container */}
      <div className="relative">
        <div ref={mapRef} className="rounded-lg overflow-hidden border">
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
            {/* Drawing Manager */}
            {!readOnly && onPolygonComplete && (
              <DrawingManager
                onLoad={onDrawingManagerLoad}
                options={drawingManagerOptions}
                onPolygonComplete={onPolygonCompleteHandler}
              />
            )}

            {/* Existing Zones */}
            {Array.isArray(existingZones) && existingZones.map((zone) => (
              <Polygon
                key={zone.id}
                paths={zone.boundaries.coordinates[0].map(coord => ({
                  lat: coord[1],
                  lng: coord[0],
                }))}
                options={getZoneStyle(convertZoneTypeEnum(zone.zoneType), zone.isActive)}
              />
            ))}

            {/* Current Polygon */}
            {(polygon || drawnPolygon) && (
              <Polygon
                paths={(polygon || drawnPolygon)!.coordinates[0].map(coord => ({
                  lat: coord[1],
                  lng: coord[0],
                }))}
                options={{
                  ...getZoneStyle('regular', true),
                  editable: false, // Never editable - we use markers for editing
                  clickable: true,
                }}
              />
            )}
          </GoogleMap>
        </div>

        {/* Drawing Controls */}
        {!readOnly && (
          <div className="absolute top-4 right-4 space-y-2">
            {!(polygon || drawnPolygon) && !isDrawing && onPolygonComplete && (
              <Button onClick={startDrawing} size="sm" className="shadow-lg">
                <Edit3 className="h-4 w-4 mr-2" />
                Dibujar Zona
              </Button>
            )}

            {isDrawing && (
              <div className="flex space-x-2">
                <Button onClick={cancelDrawing} variant="destructive" size="sm" className="shadow-lg">
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
              </div>
            )}

            {(polygon || drawnPolygon) && !isEditing && (
              <div className="flex space-x-2">
                <Button onClick={editPolygon} size="sm" className="shadow-lg">
                  <Edit3 className="h-4 w-4 mr-2" />
                  Editar
                </Button>
                <Button
                  onClick={onClear || clearPolygon}
                  variant="destructive"
                  size="sm"
                  className="shadow-lg"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {initialPolygon ? 'Descartar cambios' : 'Limpiar'}
                </Button>
              </div>
            )}

            {isEditing && (
              <Button onClick={finishEditing} size="sm" className="shadow-lg bg-green-600 hover:bg-green-700">
                <Check className="h-4 w-4 mr-2" />
                Finalizar
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Polygon Info */}
      {drawnPolygon && polygonCenter && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Información de la Zona</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Centro:</span>
              <Badge variant="outline">
                {polygonCenter.lat.toFixed(4)}, {polygonCenter.lng.toFixed(4)}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Puntos:</span>
              <Badge variant="outline">
                {drawnPolygon.coordinates[0].length} vértices
              </Badge>
            </div>
            {Array.isArray(existingZones) && existingZones.length > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Zonas existentes:</span>
                <Badge variant="outline">
                  {existingZones.length} zona(s)
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      {!drawnPolygon && !readOnly && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-gray-600">
              <p className="text-sm">
                Haz clic en &quot;Dibujar Zona&quot; para comenzar a crear un polígono en el mapa.
              </p>
              <p className="text-xs mt-1">
                Dibuja el polígono haciendo clic en los puntos del mapa. Haz doble clic para cerrar el polígono.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
