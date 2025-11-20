'use client';

/**
 * ZoneDrawingMap Component
 *
 * Migración completada:
 * ✓ Usa google.maps.marker.AdvancedMarkerElement (Google Maps API v3.54+)
 * ✓ Sistema de dibujo con eventos nativos del mapa (sin DrawingManager)
 * ✓ Edición de vértices con drag & drop usando AdvancedMarkerElement
 * ✓ Compatible con crear, editar y visualizar zonas de servicio
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { GoogleMap, Polygon } from '@react-google-maps/api';
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
  const [currentPolygon, setCurrentPolygon] = useState<google.maps.Polygon | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [drawnPolygon, setDrawnPolygon] = useState<GeoJSONPolygon | null>(initialPolygon || null);
  const [polygonCenter, setPolygonCenter] = useState<{ lat: number; lng: number } | null>(null);
  const [vertexMarkers, setVertexMarkers] = useState<(google.maps.marker.AdvancedMarkerElement | google.maps.Marker)[]>([]);
  const [editingVertices, setEditingVertices] = useState<Array<[number, number]> | null>(null); // Temporary vertices during editing
  
  // Estados para el sistema de dibujo nativo
  const [drawingPoints, setDrawingPoints] = useState<google.maps.LatLng[]>([]);
  const [previewPolyline, setPreviewPolyline] = useState<google.maps.Polyline | null>(null);
  const [drawingMarkers, setDrawingMarkers] = useState<google.maps.marker.AdvancedMarkerElement[]>([]);

  const mapRef = useRef<HTMLDivElement>(null);


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

  // Handler para clicks en el mapa durante modo dibujo
  const handleMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (isDrawing && e.latLng && map) {
      const newPoints = [...drawingPoints, e.latLng];
      setDrawingPoints(newPoints);
      
      // Crear marcador para el punto
      const markerContent = document.createElement('div');
      markerContent.className = 'drawing-point-marker';
      markerContent.style.width = '12px';
      markerContent.style.height = '12px';
      markerContent.style.borderRadius = '50%';
      markerContent.style.backgroundColor = '#3fb1ce';
      markerContent.style.border = '2px solid #ffffff';
      markerContent.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
      
      const marker = new google.maps.marker.AdvancedMarkerElement({
        position: e.latLng,
        map: map,
        content: markerContent,
      });
      
      setDrawingMarkers(prev => [...prev, marker]);
      
      // Actualizar polyline de preview
      if (previewPolyline) {
        previewPolyline.setPath(newPoints);
      } else if (newPoints.length > 1) {
        // Crear polyline de preview
        const polyline = new google.maps.Polyline({
          path: newPoints,
          geodesic: true,
          strokeColor: '#3fb1ce',
          strokeOpacity: 0.8,
          strokeWeight: 2,
          map: map,
        });
        setPreviewPolyline(polyline);
      }
    }
  }, [isDrawing, drawingPoints, map, previewPolyline]);

  // Función para limpiar el estado de dibujo
  const clearDrawingState = useCallback(() => {
    setDrawingPoints([]);
    setIsDrawing(false);
    
    // Limpiar marcadores de dibujo
    drawingMarkers.forEach(marker => {
      marker.map = null;
    });
    setDrawingMarkers([]);
    
    // Limpiar polyline de preview
    if (previewPolyline) {
      previewPolyline.setMap(null);
      setPreviewPolyline(null);
    }
  }, [drawingMarkers, previewPolyline]);

  // Handler para doble click (cerrar polígono)
  const handleMapDblClick = useCallback(() => {
    if (isDrawing && drawingPoints.length >= 3 && map) {
      // Opciones para polígonos
      const polygonOptions = {
        fillColor: '#3fb1ce',
        fillOpacity: 0.1,
        strokeColor: '#3fb1ce',
        strokeWeight: 2,
        clickable: false,
        editable: false, // No editable - usamos marcadores para edición
        zIndex: 1,
      };

      // Crear polígono final
      const polygon = new google.maps.Polygon({
        paths: drawingPoints,
        ...polygonOptions
      });
      polygon.setMap(map);
      setCurrentPolygon(polygon);
      
      // Convertir a GeoJSON y notificar
      const geoJSON = googleMapsPolygonToGeoJSON(polygon);
      const center = calculatePolygonCenter(geoJSON);
      
      setDrawnPolygon(geoJSON);
      setPolygonCenter(center);
      onPolygonComplete?.(geoJSON, center);
      
      // Limpiar estado de dibujo
      clearDrawingState();
    }
  }, [isDrawing, drawingPoints, map, onPolygonComplete, clearDrawingState]);


  // Start drawing
  const startDrawing = useCallback(() => {
    if (!readOnly && map) {
      setIsDrawing(true);
      setDrawingPoints([]);
      console.log('🎨 ZoneDrawingMap - Started native drawing mode');
    }
  }, [readOnly, map]);

  // Cancel drawing
  const cancelDrawing = useCallback(() => {
    clearDrawingState();
    if (currentPolygon) {
      currentPolygon.setMap(null);
      setCurrentPolygon(null);
    }
    setDrawnPolygon(null);
    setPolygonCenter(null);
    console.log('❌ ZoneDrawingMap - Cancelled drawing');
  }, [currentPolygon, clearDrawingState]);

  // Clear polygon
  const clearPolygon = useCallback(() => {
    if (currentPolygon) {
      currentPolygon.setMap(null);
      setCurrentPolygon(null);
    }

    // Clear vertex markers
    vertexMarkers.forEach(marker => {
      if ('map' in marker && !('setMap' in marker)) {
        // AdvancedMarkerElement
        marker.map = null;
      } else {
        // Traditional marker
        (marker as google.maps.Marker).setMap(null);
      }
    });
    setVertexMarkers([]);

    // Clear drawing state
    clearDrawingState();

    setDrawnPolygon(null);
    setPolygonCenter(null);
    setIsEditing(false);
    setEditingVertices(null);
  }, [currentPolygon, vertexMarkers, clearDrawingState]);

  // Edit polygon
  const editPolygon = useCallback(() => {
    if (currentPolygon && !readOnly && (polygon || drawnPolygon)) {
      console.log('🎨 ZoneDrawingMap - Starting polygon edit mode with vertex markers');
      setIsEditing(true);

      // Initialize editing vertices from current polygon
      // Priority: polygon prop (updated from parent) > drawnPolygon (internal state)
      const activePolygon = polygon || drawnPolygon;
      const initialVertices = activePolygon!.coordinates[0].map(coord => [coord[0], coord[1]] as [number, number]);

      // Set editing vertices and create markers in a separate effect
      setEditingVertices(initialVertices);
    }
  }, [currentPolygon, readOnly, polygon, drawnPolygon]);

  // Update vertex markers positions during editing
  const updateVertexMarkers = useCallback(() => {
    if (vertexMarkers.length > 0 && editingVertices) {
      vertexMarkers.forEach((marker, index) => {
        if (editingVertices[index]) {
          const [lng, lat] = editingVertices[index];
          if ('position' in marker && !('setPosition' in marker)) {
            // AdvancedMarkerElement
            marker.position = { lat, lng };
          } else {
            // Traditional marker
            (marker as google.maps.Marker).setPosition(new google.maps.LatLng(lat, lng));
          }
        }
      });
    }
  }, [vertexMarkers, editingVertices]);

  // Create vertex markers when editing starts and editingVertices is set
  useEffect(() => {
    if (isEditing && editingVertices && editingVertices.length > 0 && map && currentPolygon) {

      const markers = editingVertices.map((coord, index) => {
        // Crear contenido HTML personalizado para el marcador
        const markerContent = document.createElement('div');
        markerContent.className = 'vertex-marker';
        markerContent.style.width = '16px';
        markerContent.style.height = '16px';
        markerContent.style.borderRadius = '50%';
        markerContent.style.backgroundColor = '#4285F4';
        markerContent.style.border = '2px solid #ffffff';
        markerContent.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
        markerContent.style.cursor = 'grab';

        // Verificar si AdvancedMarkerElement está disponible
        let marker;
        if (google.maps.marker && google.maps.marker.AdvancedMarkerElement) {
          marker = new google.maps.marker.AdvancedMarkerElement({
            position: { lat: coord[1], lng: coord[0] },
            map: map,
            content: markerContent,
            gmpDraggable: true,
          });
        } else {
          // Fallback a marcadores tradicionales si AdvancedMarkerElement no está disponible
          console.warn('AdvancedMarkerElement no disponible, usando marcadores tradicionales');
          
          marker = new google.maps.Marker({
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
        }

        // Handle marker drag - update visual polygon in real-time
        if (google.maps.marker && google.maps.marker.AdvancedMarkerElement) {
          // AdvancedMarkerElement events
          marker.addListener('gmp-drag', (event: google.maps.MapMouseEvent) => {
            if (event.latLng && editingVertices && editingVertices[index] && currentPolygon) {
              // Solo actualizar visualmente el polígono durante el drag, sin cambiar el estado
              const updatedVertices = [...editingVertices];
              updatedVertices[index] = [event.latLng.lng(), event.latLng.lat()];

              // Update polygon visual immediately without state update
              const latLngPath = updatedVertices.map(vertex => new google.maps.LatLng(vertex[1], vertex[0]));
              currentPolygon.setPaths(latLngPath);
            }
          });

          // Handle drag end - persist the change
          marker.addListener('gmp-dragend', (event: google.maps.MapMouseEvent) => {
            if (event.latLng && editingVertices) {
              // Update editing vertices state only when drag ends
              const updatedVertices = [...editingVertices];
              updatedVertices[index] = [event.latLng.lng(), event.latLng.lat()];
              setEditingVertices(updatedVertices);

              // Update visual polygon to ensure consistency
              const latLngPath = updatedVertices.map(vertex => new google.maps.LatLng(vertex[1], vertex[0]));
              currentPolygon.setPaths(latLngPath);
            }
          });
        } else {
          // Traditional marker events
          google.maps.event.addListener(marker, 'drag', () => {
            const newPosition = (marker as google.maps.Marker).getPosition();
            if (newPosition && editingVertices && editingVertices[index] && currentPolygon) {
              // Solo actualizar visualmente el polígono durante el drag, sin cambiar el estado
              const updatedVertices = [...editingVertices];
              updatedVertices[index] = [newPosition.lng(), newPosition.lat()];

              // Update polygon visual immediately without state update
              const latLngPath = updatedVertices.map(vertex => new google.maps.LatLng(vertex[1], vertex[0]));
              currentPolygon.setPaths(latLngPath);
            }
          });

          // Handle drag end - persist the change
          google.maps.event.addListener(marker, 'dragend', () => {
            const newPosition = (marker as google.maps.Marker).getPosition();
            if (newPosition && editingVertices) {
              // Update editing vertices state only when drag ends
              const updatedVertices = [...editingVertices];
              updatedVertices[index] = [newPosition.lng(), newPosition.lat()];
              setEditingVertices(updatedVertices);

              // Update visual polygon to ensure consistency
              const latLngPath = updatedVertices.map(vertex => new google.maps.LatLng(vertex[1], vertex[0]));
              currentPolygon.setPaths(latLngPath);
            }
          });
        }

        return marker;
      });

      setVertexMarkers(markers);
    }
  }, [isEditing, editingVertices, map, currentPolygon]);

  // Update vertex markers when editing vertices change
  useEffect(() => {
    if (isEditing && vertexMarkers.length > 0 && editingVertices) {
      updateVertexMarkers();
    }
  }, [editingVertices, isEditing, vertexMarkers.length, updateVertexMarkers]);

  // Finish editing
  const finishEditing = useCallback(() => {
    if (currentPolygon && editingVertices) {
      console.log('🎯 ZoneDrawingMap - Finishing edit with vertices:', editingVertices);

      setIsEditing(false);

      // Create final polygon from edited vertices
      const finalPolygon: GeoJSONPolygon = {
        type: 'Polygon',
        coordinates: [editingVertices.map(vertex => [vertex[0], vertex[1]])],
      };

      console.log('✅ ZoneDrawingMap - Final polygon created:', {
        vertexCount: finalPolygon.coordinates[0].length,
        center: calculatePolygonCenter(finalPolygon)
      });

      // Update final state
      setDrawnPolygon(finalPolygon);
      setPolygonCenter(calculatePolygonCenter(finalPolygon));

      // Remove vertex markers
      vertexMarkers.forEach(marker => {
        if ('map' in marker && !('setMap' in marker)) {
          // AdvancedMarkerElement
          marker.map = null;
        } else {
          // Traditional marker
          (marker as google.maps.Marker).setMap(null);
        }
      });
      setVertexMarkers([]);
      setEditingVertices(null);

      // Notify parent with final polygon state
      console.log('📤 ZoneDrawingMap - Notifying parent with final polygon');
      onPolygonEdit?.(finalPolygon, calculatePolygonCenter(finalPolygon));
    } else {
      console.warn('⚠️ ZoneDrawingMap - Cannot finish editing:', {
        hasCurrentPolygon: !!currentPolygon,
        hasEditingVertices: !!editingVertices
      });
    }
  }, [currentPolygon, editingVertices, vertexMarkers, onPolygonEdit]);

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
  // But don't update during editing to avoid conflicts with vertex markers
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
            onClick={handleMapClick}
            onDblClick={handleMapDblClick}
            options={{
              disableDefaultUI: false,
              zoomControl: true,
              streetViewControl: false,
              mapTypeControl: true,
              fullscreenControl: true,
            }}
          >

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
              <span className="text-sm text-gray-600">Vértices:</span>
              <Badge variant="outline">
                {drawnPolygon.coordinates[0].length - 1} vértices únicos
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
              {isDrawing && (
                <p className="text-xs mt-2 text-blue-600 font-medium">
                  Modo dibujo activo: Haz clic en el mapa para agregar puntos. Doble clic para finalizar.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
