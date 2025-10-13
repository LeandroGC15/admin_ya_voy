'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, MapPin, AlertTriangle, CheckCircle } from 'lucide-react';
import { GoogleMapProvider } from '@/components/maps/GoogleMapProvider';
import { ZoneDrawingMap } from '@/components/maps/ZoneDrawingMap';
import { createServiceZoneSchema, type CreateServiceZoneInput } from '@/features/config/schemas/service-zones.schemas';
import { useCreateServiceZone, useServiceZonesByCity } from '@/features/config/hooks/use-service-zones';
import { useCountries, useStatesByCountry, useCities } from '@/features/config/hooks/use-geography';
import { getComprehensiveValidation } from '@/lib/maps/validation-utils';
import type { GeoJSONPolygon } from '@/interfaces/GeographyInterfaces';

interface ServiceZonesCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  defaultCityId?: number;
}

export function ServiceZonesCreateModal({
  isOpen,
  onClose,
  onSuccess,
  defaultCityId,
}: ServiceZonesCreateModalProps) {
  const [currentPolygon, setCurrentPolygon] = useState<GeoJSONPolygon | null>(null);
  const [polygonCenter, setPolygonCenter] = useState<{ lat: number; lng: number } | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);
  const [selectedCityId, setSelectedCityId] = useState<number | null>(defaultCityId || null);
  const [selectedCountryId, setSelectedCountryId] = useState<number | null>(null);
  const [selectedStateId, setSelectedStateId] = useState<number | null>(null);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | undefined>(undefined);
  const [mapKey, setMapKey] = useState<string>('initial');

  const form = useForm<CreateServiceZoneInput>({
    resolver: zodResolver(createServiceZoneSchema),
    defaultValues: {
      name: '',
      cityId: defaultCityId || 0,
      zoneType: 'regular',
      pricingMultiplier: 1.0,
      demandMultiplier: 1.0,
      isActive: true,
      maxDrivers: undefined,
      minDrivers: undefined,
      peakHours: undefined,
    },
  });

  const createServiceZoneMutation = useCreateServiceZone();
  // Get geography data for hierarchical selection
  const { data: countriesData } = useCountries({ isActive: true });
  const { data: statesData } = useStatesByCountry(selectedCountryId || 0, true);
  const { data: citiesData } = useCities({
    ...(selectedStateId ? { stateId: selectedStateId } : {}),
    isActive: true,
    limit: 100, // Maximum allowed limit
    // Force loading of state and country relationships
  });
  const { data: existingZones } = useServiceZonesByCity(selectedCityId || 0);

  // Extract arrays from responses
  const countries = countriesData?.countries || [];
  const states = statesData?.states || [];
  const cities = citiesData?.cities || [];
  
  // Debug log for cities data and check coordinates
  React.useEffect(() => {
    console.log('🏙️ ServiceZonesCreateModal - Cities data loaded:', {
      totalCities: cities?.length || 0,
      selectedStateId,
      selectedCityId,
      citiesData: citiesData
    });

    if (cities && cities.length > 0) {
      // Helper function to check if coordinates are valid (string or number)
      const hasValidCoordinates = (lat: any, lng: any): boolean => {
        if (lat == null || lng == null) return false;
        const latNum = typeof lat === 'string' ? parseFloat(lat) : Number(lat);
        const lngNum = typeof lng === 'string' ? parseFloat(lng) : Number(lng);
        return !isNaN(latNum) && !isNaN(lngNum) &&
               latNum >= -90 && latNum <= 90 &&
               lngNum >= -180 && lngNum <= 180;
      };

      const citiesWithCoords = cities.filter(c =>
        hasValidCoordinates(c.latitude, c.longitude)
      );

      const citiesWithoutCoords = cities.filter(c =>
        !hasValidCoordinates(c.latitude, c.longitude)
      );

      console.log('📊 ServiceZonesCreateModal - Cities stats:', {
        withCoords: citiesWithCoords.length,
        withoutCoords: citiesWithoutCoords.length,
        total: cities.length
      });

      // Show problematic cities
      if (citiesWithoutCoords.length > 0) {
        console.log('❌ ServiceZonesCreateModal - Cities without coordinates:', citiesWithoutCoords.map(c => ({
          id: c.id,
          name: c.name,
          latitude: c.latitude,
          longitude: c.longitude,
          state: c.state?.name,
          country: c.state?.country?.name
        })));
      }

      // Show sample cities with coordinates
      const sampleCities = cities.slice(0, 5).map(c => ({
        id: c.id,
        name: c.name,
        latitude: c.latitude,
        longitude: c.longitude,
        hasValidCoords: hasValidCoordinates(c.latitude, c.longitude),
        state: c.state?.name,
        country: c.state?.country?.name
      }));
      console.log('🎯 ServiceZonesCreateModal - Sample cities:', sampleCities);
    }
  }, [citiesData, cities, selectedStateId, selectedCityId]);

  // Watch specific form values for validation
  const name = form.watch('name');
  const zoneType = form.watch('zoneType');
  const pricingMultiplier = form.watch('pricingMultiplier');
  const demandMultiplier = form.watch('demandMultiplier');
  const maxDrivers = form.watch('maxDrivers');
  const minDrivers = form.watch('minDrivers');

  // Validate form data when polygon or form values change
  useEffect(() => {
    if (currentPolygon && polygonCenter && selectedCityId) {
      const formData = {
        name,
        zoneType,
        pricingMultiplier,
        demandMultiplier,
        maxDrivers,
        minDrivers,
        cityId: selectedCityId,
        boundaries: currentPolygon,
        centerLat: polygonCenter.lat,
        centerLng: polygonCenter.lng,
      };

      const validation = getComprehensiveValidation(
        formData,
        existingZones || [],
        undefined // No excludeZoneId for new zones
      );

      setValidationErrors(validation.errors);
      setValidationWarnings(validation.warnings);
    } else {
      setValidationErrors([]);
      setValidationWarnings([]);
    }
  }, [currentPolygon, polygonCenter, selectedCityId, name, zoneType, pricingMultiplier, demandMultiplier, maxDrivers, minDrivers, existingZones]);

  // Handle polygon completion
  const handlePolygonComplete = (polygon: GeoJSONPolygon, center: { lat: number; lng: number }) => {
    setCurrentPolygon(polygon);
    setPolygonCenter(center);
    
    // Update form with center coordinates
    form.setValue('centerLat', center.lat);
    form.setValue('centerLng', center.lng);
    form.setValue('boundaries', polygon);
  };

  // Handle polygon edit
  const handlePolygonEdit = (polygon: GeoJSONPolygon, center: { lat: number; lng: number }) => {
    setCurrentPolygon(polygon);
    setPolygonCenter(center);
    
    // Update form with center coordinates
    form.setValue('centerLat', center.lat);
    form.setValue('centerLng', center.lng);
    form.setValue('boundaries', polygon);
  };

  // Handle country selection
  const handleCountryChange = (countryId: string) => {
    const countryIdNum = parseInt(countryId);
    setSelectedCountryId(countryIdNum);
    setSelectedStateId(null); // Reset state when country changes
    setSelectedCityId(null); // Reset city when country changes
    form.setValue('cityId', 0);

    // Clear current polygon when country changes
    setCurrentPolygon(null);
    setPolygonCenter(null);
    setValidationErrors([]);
    setValidationWarnings([]);
  };

  // Handle state selection
  const handleStateChange = (stateId: string) => {
    const stateIdNum = parseInt(stateId);
    setSelectedStateId(stateIdNum);
    setSelectedCityId(null); // Reset city when state changes
    form.setValue('cityId', 0);

    // Clear current polygon when state changes
    setCurrentPolygon(null);
    setPolygonCenter(null);
    setValidationErrors([]);
    setValidationWarnings([]);
  };

  // Handle city selection
  const handleCityChange = (cityId: string) => {
    const cityIdNum = parseInt(cityId);
    setSelectedCityId(cityIdNum);
    form.setValue('cityId', cityIdNum);

    // Find selected city and update map center
    const selectedCity = cities.find(c => c.id === cityIdNum);
    console.log('✅ ServiceZonesCreateModal - Ciudad seleccionada:', selectedCity?.name);
    console.log('📍 ServiceZonesCreateModal - Coordenadas de ciudad:', {
      latitude: selectedCity?.latitude,
      longitude: selectedCity?.longitude,
    });

    // Try to get coordinates from city, state, or use default fallback
    let newCenter: { lat: number; lng: number } | undefined;
    let coordinatesSource = 'country';

    // Helper function to safely convert coordinates to numbers
    const parseCoordinate = (value: any): number | null => {
      if (value == null) return null;
      const num = typeof value === 'string' ? parseFloat(value) : Number(value);
      return isNaN(num) ? null : num;
    };

    const lat = parseCoordinate(selectedCity?.latitude);
    const lng = parseCoordinate(selectedCity?.longitude);

    console.log('🔢 ServiceZonesCreateModal - Parsed coordinates:', { lat, lng, originalLat: selectedCity?.latitude, originalLng: selectedCity?.longitude });

    if (selectedCity &&
        lat !== null &&
        lng !== null &&
        lat >= -90 &&
        lat <= 90 &&
        lng >= -180 &&
        lng <= 180) {
      // Use city coordinates from database (converted to numbers)
      newCenter = {
        lat: lat,
        lng: lng,
      };
      coordinatesSource = 'city';
      console.log('🎯 ServiceZonesCreateModal - Usando coordenadas de ciudad (BD):', newCenter);
    } else {
      // City doesn't have coordinates in database
      console.log('⚠️ ServiceZonesCreateModal - Ciudad sin coordenadas en BD:', selectedCity?.name, {
        latitude: selectedCity?.latitude,
        longitude: selectedCity?.longitude
      });

      // No coordinates available - city needs to be configured in backend
      console.log('❌ ServiceZonesCreateModal - Ciudad sin coordenadas:', selectedCity?.name, '- Necesita configuración en backend');
    }

    if (newCenter) {
      console.log('🚀 ServiceZonesCreateModal - ACTUALIZANDO MAPA - newCenter:', newCenter);
      setMapCenter(newCenter);
      // Force map re-render with new center
      const newMapKey = `center-${newCenter.lat}-${newCenter.lng}-${Date.now()}`;
      console.log('🔑 ServiceZonesCreateModal - Nueva key del mapa:', newMapKey);
      setMapKey(newMapKey);
      console.log('✅ ServiceZonesCreateModal - Estado actualizado - mapCenter:', newCenter, 'mapKey:', newMapKey);
    } else {
      console.log('❌ ServiceZonesCreateModal - No se encontraron coordenadas. Ciudad:', selectedCity);
      setMapCenter(undefined);
      setMapKey('no-coordinates');
      console.log('🔄 ServiceZonesCreateModal - Estado reseteado - mapCenter: undefined, mapKey: no-coordinates');
    }

    // Clear current polygon when city changes
    setCurrentPolygon(null);
    setPolygonCenter(null);
    setValidationErrors([]);
    setValidationWarnings([]);
  };

  // Handle form submission
  const onSubmit = async (data: CreateServiceZoneInput) => {
    if (!currentPolygon || !polygonCenter) {
      setValidationErrors(['Debe dibujar un polígono en el mapa']);
      return;
    }

    if (validationErrors.length > 0) {
      return;
    }

    try {
      const zoneData = {
        ...data,
        cityId: selectedCityId!,
        boundaries: currentPolygon,
        centerLat: polygonCenter.lat,
        centerLng: polygonCenter.lng,
      };

      await createServiceZoneMutation.mutateAsync(zoneData);
      onSuccess?.();
      onClose();
      
      // Reset form
      form.reset();
      setCurrentPolygon(null);
      setPolygonCenter(null);
      setValidationErrors([]);
      setValidationWarnings([]);
    } catch (error) {
      console.error('Error creating service zone:', error);
    }
  };

  const isLoading = createServiceZoneMutation.isPending;
  const canSubmit = currentPolygon && polygonCenter && validationErrors.length === 0 && !isLoading;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear Nueva Zona de Servicio</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Form Section */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Información Básica</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Zone Name */}
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre de la Zona *</Label>
                    <Input
                      id="name"
                      {...form.register('name')}
                      placeholder="Ej: Centro Comercial, Aeropuerto, Zona Residencial"
                    />
                    {form.formState.errors.name && (
                      <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>
                    )}
                  </div>

                  {/* Country Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="countryId">País *</Label>
                    <Select value={selectedCountryId?.toString() || ''} onValueChange={handleCountryChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar país" />
                      </SelectTrigger>
                      <SelectContent>
                        {countries.map((country) => (
                          <SelectItem key={country.id} value={country.id.toString()}>
                            {country.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* State Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="stateId">Estado *</Label>
                    <Select
                      value={selectedStateId?.toString() || ''}
                      onValueChange={handleStateChange}
                      disabled={!selectedCountryId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={selectedCountryId ? "Seleccionar estado" : "Primero selecciona un país"} />
                      </SelectTrigger>
                      <SelectContent>
                        {states.map((state) => (
                          <SelectItem key={state.id} value={state.id.toString()}>
                            {state.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* City Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="cityId">Ciudad *</Label>
                    <Select
                      value={selectedCityId?.toString() || ''}
                      onValueChange={handleCityChange}
                      disabled={!selectedStateId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={selectedStateId ? "Seleccionar ciudad" : "Primero selecciona un estado"} />
                      </SelectTrigger>
                      <SelectContent>
                        {cities.map((city) => (
                          <SelectItem key={city.id} value={city.id.toString()}>
                            {city.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {form.formState.errors.cityId && (
                      <p className="text-sm text-red-600">{form.formState.errors.cityId.message}</p>
                    )}
                  </div>

                  {/* Zone Type */}
                  <div className="space-y-2">
                    <Label htmlFor="zoneType">Tipo de Zona *</Label>
                    <Select value={form.watch('zoneType')} onValueChange={(value) => form.setValue('zoneType', value as any)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="regular">Regular</SelectItem>
                        <SelectItem value="premium">Premium</SelectItem>
                        <SelectItem value="restricted">Restringida</SelectItem>
                      </SelectContent>
                    </Select>
                    {form.formState.errors.zoneType && (
                      <p className="text-sm text-red-600">{form.formState.errors.zoneType.message}</p>
                    )}
                  </div>

                  {/* Pricing Multiplier */}
                  <div className="space-y-2">
                    <Label htmlFor="pricingMultiplier">Multiplicador de Pricing *</Label>
                    <Input
                      id="pricingMultiplier"
                      type="number"
                      step="0.1"
                      min="0.5"
                      max="10"
                      {...form.register('pricingMultiplier', { valueAsNumber: true })}
                    />
                    {form.formState.errors.pricingMultiplier && (
                      <p className="text-sm text-red-600">{form.formState.errors.pricingMultiplier.message}</p>
                    )}
                  </div>

                  {/* Demand Multiplier */}
                  <div className="space-y-2">
                    <Label htmlFor="demandMultiplier">Multiplicador de Demanda *</Label>
                    <Input
                      id="demandMultiplier"
                      type="number"
                      step="0.1"
                      min="0.5"
                      max="10"
                      {...form.register('demandMultiplier', { valueAsNumber: true })}
                    />
                    {form.formState.errors.demandMultiplier && (
                      <p className="text-sm text-red-600">{form.formState.errors.demandMultiplier.message}</p>
                    )}
                  </div>

                  {/* Driver Limits */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="minDrivers">Mín. Conductores</Label>
                      <Input
                        id="minDrivers"
                        type="number"
                        min="0"
                        {...form.register('minDrivers', { valueAsNumber: true })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="maxDrivers">Máx. Conductores</Label>
                      <Input
                        id="maxDrivers"
                        type="number"
                        min="1"
                        {...form.register('maxDrivers', { valueAsNumber: true })}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Validation Results */}
              {validationErrors.length > 0 && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-1">
                      <p className="font-medium">Errores de validación:</p>
                      <ul className="list-disc list-inside text-sm">
                        {validationErrors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {validationWarnings.length > 0 && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-1">
                      <p className="font-medium">Advertencias:</p>
                      <ul className="list-disc list-inside text-sm">
                        {validationWarnings.map((warning, index) => (
                          <li key={index}>{warning}</li>
                        ))}
                      </ul>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {/* Map Section */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Dibujar Zona en el Mapa
                  </CardTitle>
                  {selectedCityId && (() => {
                    const selectedCity = cities?.find(c => c.id === selectedCityId);
                    // Helper function to check if coordinates are valid (string or number)
                    const hasValidCoordinates = (lat: any, lng: any): boolean => {
                      if (lat == null || lng == null) return false;
                      const latNum = typeof lat === 'string' ? parseFloat(lat) : Number(lat);
                      const lngNum = typeof lng === 'string' ? parseFloat(lng) : Number(lng);
                      return !isNaN(latNum) && !isNaN(lngNum) &&
                             latNum >= -90 && latNum <= 90 &&
                             lngNum >= -180 && lngNum <= 180;
                    };

                    const hasCityCoordinates = selectedCity &&
                      hasValidCoordinates(selectedCity.latitude, selectedCity.longitude);

                    return (
                      <div className="text-sm text-gray-600 mt-1 space-y-1">
                        <div>
                          Ciudad: <span className="font-medium">{selectedCity?.name}</span>
                          {hasCityCoordinates ? (
                            <span className="text-green-600 ml-2">✓ Coordenadas disponibles</span>
                          ) : (
                            <span className="text-red-600 ml-2">⚠ Sin coordenadas</span>
                          )}
                        </div>
                        {hasCityCoordinates ? (
                          <div className="text-xs text-gray-500">
                            Mapa centrado en la ubicación de la ciudad desde el backend.
                          </div>
                        ) : (
                          <div className="text-xs text-red-600">
                            ⚠️ Esta ciudad no tiene coordenadas configuradas en el backend.
                            Contacte al administrador para agregar las coordenadas GPS de esta ciudad.
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </CardHeader>
                <CardContent>
                  {selectedCityId ? (
                    mapCenter ? (
                      <GoogleMapProvider>
                        <ZoneDrawingMap
                          key={mapKey}
                          existingZones={existingZones || []}
                          onPolygonComplete={handlePolygonComplete}
                          onPolygonEdit={handlePolygonEdit}
                          center={mapCenter}
                        />
                      </GoogleMapProvider>
                    ) : (
                      <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg border-2 border-dashed border-red-300">
                        <div className="text-center text-red-600">
                          <MapPin className="h-16 w-16 mx-auto mb-4 opacity-50" />
                          <h3 className="text-lg font-semibold mb-2">Coordenadas no configuradas</h3>
                          <p className="text-sm mb-4">
                            Esta ciudad no tiene coordenadas GPS configuradas en el sistema.
                          </p>
                          <p className="text-xs text-gray-500">
                            Para crear zonas de servicio, primero debe configurar las coordenadas
                            de latitud y longitud de esta ciudad en la base de datos.
                          </p>
                        </div>
                      </div>
                    )
                  ) : (
                    <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
                      <div className="text-center text-gray-500">
                        <MapPin className="h-12 w-12 mx-auto mb-4" />
                        <p className="font-medium mb-2">Selecciona País → Estado → Ciudad</p>
                        <p className="text-sm">Primero selecciona un país, luego un estado, y finalmente una ciudad para comenzar a dibujar la zona de servicio.</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Polygon Info */}
              {currentPolygon && polygonCenter && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Zona Dibujada
                    </CardTitle>
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
                        {currentPolygon.coordinates[0].length} puntos
                      </Badge>
                    </div>
                    {existingZones && existingZones.length > 0 && (
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
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!canSubmit}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Crear Zona
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
