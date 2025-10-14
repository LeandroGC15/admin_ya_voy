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
import { updateServiceZoneSchema, type UpdateServiceZoneInput } from '@/features/config/schemas/service-zones.schemas';
import { useUpdateServiceZone, useServiceZone, useServiceZonesByCity } from '@/features/config/hooks/use-service-zones';
import { useCountries, useStatesByCountry, useCities } from '@/features/config/hooks/use-geography';
import { getComprehensiveValidation } from '@/lib/maps/validation-utils';
import type { GeoJSONPolygon } from '@/interfaces/GeographyInterfaces';

interface ServiceZonesEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  zoneId: number;
}

export function ServiceZonesEditModal({
  isOpen,
  onClose,
  onSuccess,
  zoneId,
}: ServiceZonesEditModalProps) {
  const [currentPolygon, setCurrentPolygon] = useState<GeoJSONPolygon | null>(null);
  const [polygonCenter, setPolygonCenter] = useState<{ lat: number; lng: number } | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);
  const [selectedCountryId, setSelectedCountryId] = useState<number | null>(null);
  const [selectedStateId, setSelectedStateId] = useState<number | null>(null);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | undefined>(undefined);
  const [mapKey, setMapKey] = useState<string>('initial');
  const [zoneDataLoaded, setZoneDataLoaded] = useState<boolean>(false);

  // Reset zone data loaded when modal opens/closes or zoneId changes
  React.useEffect(() => {
    if (isOpen && zoneId) {
      setZoneDataLoaded(false);
    }
  }, [isOpen, zoneId]);

  const form = useForm<UpdateServiceZoneInput>({
    resolver: zodResolver(updateServiceZoneSchema),
    defaultValues: {
      name: '',
      cityId: 0,
      zoneType: 'regular',
      pricingMultiplier: 1.0,
      demandMultiplier: 1.0,
      isActive: true,
      maxDrivers: undefined,
      minDrivers: undefined,
      peakHours: undefined,
    },
  });

  const updateServiceZoneMutation = useUpdateServiceZone();
  const { data: zone, isLoading: isLoadingZone } = useServiceZone(zoneId);
  const { data: existingZones } = useServiceZonesByCity(zone?.cityId || 0, false);

  // Load zone data when available
  React.useEffect(() => {
    if (zone && !isLoadingZone) {
      // Convert enum to string
      const zoneTypeValue = zone?.zoneType?.toLowerCase() as 'regular' | 'premium' | 'restricted';

      form.reset({
        name: zone.name,
        cityId: zone.cityId,
        zoneType: zoneTypeValue,
        pricingMultiplier: zone.pricingMultiplier,
        demandMultiplier: zone.demandMultiplier,
        isActive: zone.isActive,
        maxDrivers: zone.maxDrivers,
        minDrivers: zone.minDrivers,
        peakHours: zone.peakHours,
      });


      // Set hierarchical selection values
      if (zone.city?.state?.country) {
        console.log('🌍 ServiceZonesEditModal - Setting hierarchical values:', {
          countryId: zone.city.state.country.id,
          stateId: zone.city.state.id,
          cityId: zone.cityId
        });
        setSelectedCountryId(zone.city.state.country.id);
        setSelectedStateId(zone.city.state.id);

        // Also set the city value explicitly
        form.setValue('cityId', zone.cityId);
      }

      // Set polygon data if available
      if (zone.boundaries) {
        setCurrentPolygon(zone.boundaries);
      }

      // Set polygon center if available
      if (typeof zone.centerLat === 'number' && typeof zone.centerLng === 'number' &&
          !isNaN(zone.centerLat) && !isNaN(zone.centerLng)) {
        setPolygonCenter({
          lat: zone.centerLat,
          lng: zone.centerLng,
        });

        // Also set map center for immediate display
        setMapCenter({
          lat: zone.centerLat,
          lng: zone.centerLng,
        });
        // Force map re-render with zone coordinates
        const zoneMapKey = `zone-${zone.id}-${zone.centerLat}-${zone.centerLng}-${Date.now()}`;
        setMapKey(zoneMapKey);

        // Run initial validation for existing zone
        if (zone.boundaries) {
          const initialValidation = getComprehensiveValidation(
            {
              // For initial validation of existing zone, only validate geometry and pricing
              cityId: zone.cityId,
              pricingMultiplier: zone.pricingMultiplier,
              demandMultiplier: zone.demandMultiplier,
              boundaries: zone.boundaries,
              centerLat: zone.centerLat,
              centerLng: zone.centerLng,
            },
            existingZones || [], // Use available existing zones for validation
            zoneId
          );
          setValidationErrors(initialValidation.errors);
          setValidationWarnings(initialValidation.warnings);
        }
      }

      setZoneDataLoaded(true);
    }
  }, [zone, isLoadingZone, form, existingZones]);

  // Additional effect to center map on city coordinates if zone doesn't have valid coordinates
  React.useEffect(() => {
    if (zone && cities.length > 0 && !mapCenter) {
      console.log('🎯 ServiceZonesEditModal - Centering map on city coordinates for loaded zone');

      // Find the city of the current zone
      const zoneCity = cities.find(c => c.id === zone.cityId);
      if (zoneCity) {
        console.log('🏙️ ServiceZonesEditModal - Found zone city:', zoneCity.name);

        // Try to get coordinates from city
        const parseCoordinate = (value: any): number | null => {
          if (value == null) return null;
          const num = typeof value === 'string' ? parseFloat(value) : Number(value);
          return isNaN(num) ? null : num;
        };

        const lat = parseCoordinate(zoneCity.latitude);
        const lng = parseCoordinate(zoneCity.longitude);

        if (lat !== null && lng !== null && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
          console.log('🎯 ServiceZonesEditModal - Centering map on city coordinates:', { lat, lng });
          setMapCenter({ lat, lng });
          const cityMapKey = `city-${zoneCity.id}-${lat}-${lng}-${Date.now()}`;
          setMapKey(cityMapKey);
        } else {
          console.log('⚠️ ServiceZonesEditModal - City has no valid coordinates');
        }
      }
    }
  }, [zone, mapCenter]); // Temporarily remove cities dependency

  // Get geography data for hierarchical selection
  // Only load geography data after zone is loaded to ensure proper IDs
  const shouldLoadGeography = zone && selectedCountryId && selectedStateId;
  const { data: countriesData } = useCountries({ isActive: true });
  const { data: statesData } = useStatesByCountry(
    shouldLoadGeography ? selectedCountryId : 0,
    true
  );
  const { data: citiesData } = useCities(
    shouldLoadGeography ? {
      ...(selectedStateId ? { stateId: selectedStateId } : {}),
      isActive: true,
      limit: 100
    } : {
      isActive: true,
      limit: 100
    }
  );

  // Force refresh of geography data when selection changes
  React.useEffect(() => {
    if (selectedCountryId) {
      console.log('🔄 ServiceZonesEditModal - Country changed, refreshing states for:', selectedCountryId);
    }
  }, [selectedCountryId]);

  React.useEffect(() => {
    if (selectedStateId) {
      console.log('🔄 ServiceZonesEditModal - State changed, refreshing cities for:', selectedStateId);
    }
  }, [selectedStateId]);

  // Extract arrays from responses
  const countries = countriesData?.countries || [];
  const states = statesData?.states || [];
  const cities = citiesData?.cities || [];

  // Additional effect to center map on city coordinates if zone doesn't have valid coordinates
  React.useEffect(() => {
    if (zone && cities.length > 0 && !mapCenter) {
      console.log('🎯 ServiceZonesEditModal - Centering map on city coordinates for loaded zone');

      // Find the city of the current zone
      const zoneCity = cities.find(c => c.id === zone.cityId);
      if (zoneCity) {
        console.log('🏙️ ServiceZonesEditModal - Found zone city:', zoneCity.name);

        // Try to get coordinates from city
        const parseCoordinate = (value: any): number | null => {
          if (value == null) return null;
          const num = typeof value === 'string' ? parseFloat(value) : Number(value);
          return isNaN(num) ? null : num;
        };

        const lat = parseCoordinate(zoneCity.latitude);
        const lng = parseCoordinate(zoneCity.longitude);

        if (lat !== null && lng !== null && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
          console.log('🎯 ServiceZonesEditModal - Centering map on city coordinates:', { lat, lng });
          setMapCenter({ lat, lng });
          const cityMapKey = `city-${zoneCity.id}-${lat}-${lng}-${Date.now()}`;
          setMapKey(cityMapKey);
        } else {
          console.log('⚠️ ServiceZonesEditModal - City has no valid coordinates');
        }
      }
    }
  }, [zone, cities, mapCenter]);

  // Watch specific form values for validation (memoized to prevent unnecessary re-renders)
  const watchedValues = React.useMemo(() => ({
    name: form.watch('name'),
    zoneType: form.watch('zoneType'),
    pricingMultiplier: form.watch('pricingMultiplier'),
    demandMultiplier: form.watch('demandMultiplier'),
    maxDrivers: form.watch('maxDrivers'),
    minDrivers: form.watch('minDrivers'),
    isActive: form.watch('isActive'),
  }), [form]);

  // Watch zoneType specifically for the select component
  const currentZoneType = form.watch('zoneType');


  // Debug log for cities data and check coordinates
  React.useEffect(() => {
    console.log('🏙️ ServiceZonesEditModal - Cities data loaded:', {
      totalCities: cities?.length || 0,
      selectedStateId,
      zoneId,
      zoneCityId: zone?.cityId
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

      console.log('📊 ServiceZonesEditModal - Cities stats:', {
        withCoords: citiesWithCoords.length,
        withoutCoords: citiesWithoutCoords.length,
        total: cities.length
      });
    }
  }, [citiesData, cities, selectedStateId, zoneId, zone]);


  // For editing existing zones, we only validate geometry initially
  // Form validation is handled by React Hook Form schema
  // Only validate when polygon changes, not when form fields change

  // Handle polygon completion
  const handlePolygonComplete = (polygon: GeoJSONPolygon, center: { lat: number; lng: number }) => {
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
    form.setValue('cityId', 0);

    // For editing existing zones, don't clear the polygon when changing country
    // The polygon should remain from the existing zone
    setValidationErrors([]);
    setValidationWarnings([]);
  };

  // Handle state selection
  const handleStateChange = (stateId: string) => {
    const stateIdNum = parseInt(stateId);
    setSelectedStateId(stateIdNum);
    form.setValue('cityId', 0);

    // For editing existing zones, don't clear the polygon when changing state
    // The polygon should remain from the existing zone
    setValidationErrors([]);
    setValidationWarnings([]);
  };

  // Handle city selection
  const handleCityChange = (cityId: string) => {
    const cityIdNum = parseInt(cityId);
    form.setValue('cityId', cityIdNum);

    // Find selected city and update map center
    const selectedCity = cities.find(c => c.id === cityIdNum);
    console.log('✅ ServiceZonesEditModal - Ciudad seleccionada:', selectedCity?.name);
    console.log('📍 ServiceZonesEditModal - Coordenadas de ciudad:', {
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

    console.log('🔢 ServiceZonesEditModal - Parsed coordinates:', { lat, lng, originalLat: selectedCity?.latitude, originalLng: selectedCity?.longitude });

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
      console.log('🎯 ServiceZonesEditModal - Usando coordenadas de ciudad (BD):', newCenter);
    } else {
      // City doesn't have coordinates in database
      console.log('⚠️ ServiceZonesEditModal - Ciudad sin coordenadas en BD:', selectedCity?.name, {
        latitude: selectedCity?.latitude,
        longitude: selectedCity?.longitude
      });

      // No coordinates available - city needs to be configured in backend
      console.log('❌ ServiceZonesEditModal - Ciudad sin coordenadas:', selectedCity?.name, '- Necesita configuración en backend');
    }

    if (newCenter) {
      console.log('🚀 ServiceZonesEditModal - ACTUALIZANDO MAPA - newCenter:', newCenter);
      setMapCenter(newCenter);
      // Force map re-render with new center
      const newMapKey = `center-${newCenter.lat}-${newCenter.lng}-${Date.now()}`;
      console.log('🔑 ServiceZonesEditModal - Nueva key del mapa:', newMapKey);
      setMapKey(newMapKey);
      console.log('✅ ServiceZonesEditModal - Estado actualizado - mapCenter:', newCenter, 'mapKey:', newMapKey);
    } else {
      console.log('❌ ServiceZonesEditModal - No se encontraron coordenadas. Ciudad:', selectedCity);
      setMapCenter(undefined);
      setMapKey('no-coordinates');
      console.log('🔄 ServiceZonesEditModal - Estado reseteado - mapCenter: undefined, mapKey: no-coordinates');

    }

    // For editing existing zones, don't clear the polygon when changing city
    // The polygon should remain from the existing zone
    // Only clear validation since city change might affect validation rules
    setValidationErrors([]);
    setValidationWarnings([]);

    // Note: We keep the map center set above, so the map will center on the new city coordinates
  };

  // Handle polygon edit
  const handlePolygonEdit = (polygon: GeoJSONPolygon, center: { lat: number; lng: number }) => {
    setCurrentPolygon(polygon);
    setPolygonCenter(center);

    // Update form with center coordinates - this will make form dirty
    form.setValue('centerLat', center.lat);
    form.setValue('centerLng', center.lng);
    form.setValue('boundaries', polygon);
  };

  // Handle form submission
  const onSubmit = async (data: UpdateServiceZoneInput) => {
    if (!currentPolygon || !polygonCenter) {
      setValidationErrors(['Debe tener un polígono válido']);
      return;
    }

    // Final validation before submit
    const finalValidation = getComprehensiveValidation(
      {
        ...data,
        boundaries: currentPolygon,
        centerLat: polygonCenter.lat,
        centerLng: polygonCenter.lng,
      },
      existingZones || [],
      zoneId
    );

    if (finalValidation.errors.length > 0) {
      setValidationErrors(finalValidation.errors);
      return;
    }

    try {
      const zoneData = {
        ...data,
        boundaries: currentPolygon,
        centerLat: polygonCenter.lat,
        centerLng: polygonCenter.lng,
      };

      await updateServiceZoneMutation.mutateAsync({ id: zoneId, data: zoneData });
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error updating service zone:', error);
    }
  };

  const isLoading = updateServiceZoneMutation.isPending;

  // For editing existing zones, be reactive - activate button as soon as zone data is loaded
  // Check both local state and zone data for geometry
  const hasValidGeometry = (currentPolygon && polygonCenter) ||
    (zone && zone.boundaries &&
     typeof zone.centerLat === 'number' && typeof zone.centerLng === 'number' &&
     !isNaN(zone.centerLat) && !isNaN(zone.centerLng));

  // Button should be active when zone data is loaded and has geometry
  // Always active for editing - user can save anytime
  const canSubmit = zoneDataLoaded && hasValidGeometry && !isLoading;

  // Debug: Log button state
  React.useEffect(() => {
    console.log('🔘 ServiceZonesEditModal - Button state:', {
      zoneDataLoaded,
      hasValidGeometry,
      isLoading,
      canSubmit
    });
  }, [zoneDataLoaded, hasValidGeometry, isLoading, canSubmit]);


  const isLoadingGeography = shouldLoadGeography && (!statesData || !citiesData);

  // Wait for all data to be loaded before showing the form
  const isLoadingAllData = isLoadingZone || isLoadingGeography || !zoneDataLoaded;

  if (isLoadingAllData) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Cargando Zona de Servicio...</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-sm text-gray-600 mb-2">
                Preparando formulario de edición...
              </p>
              <p className="text-xs text-gray-500">
                Cargando datos de la zona y configuración geográfica
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!zone) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <div className="text-center py-8">
            <p className="text-red-600">No se pudo cargar la zona</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Zona de Servicio: {zone?.name || 'Cargando...'}</DialogTitle>
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
                    <Select
                      value={selectedCountryId?.toString() || ''}
                      onValueChange={handleCountryChange}
                      disabled={!countries.length}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={countries.length ? "Seleccionar país" : "Cargando países..."} />
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
                      disabled={!selectedCountryId || !states.length}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={
                          !selectedCountryId ? "Primero selecciona un país" :
                          !states.length ? "Cargando estados..." :
                          "Seleccionar estado"
                        } />
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
                      value={form.watch('cityId')?.toString() || ''}
                      onValueChange={handleCityChange}
                      disabled={!selectedStateId || !cities.length}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={
                          !selectedStateId ? "Primero selecciona un estado" :
                          !cities.length ? "Cargando ciudades..." :
                          "Seleccionar ciudad"
                        } />
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
                    {zoneDataLoaded ? (
                      <Select
                        value={currentZoneType}
                        onValueChange={(value) => form.setValue('zoneType', value as any)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="regular">Regular</SelectItem>
                          <SelectItem value="premium">Premium</SelectItem>
                          <SelectItem value="restricted">Restringida</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Select disabled>
                        <SelectTrigger>
                          <SelectValue placeholder="Cargando..." />
                        </SelectTrigger>
                      </Select>
                    )}
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

                  {/* Active Status */}
                  <div className="space-y-2">
                    <Label htmlFor="isActive">Estado</Label>
                    <Select
                      value={form.watch('isActive') ? 'true' : 'false'}
                      onValueChange={(value) => form.setValue('isActive', value === 'true')}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Activa</SelectItem>
                        <SelectItem value="false">Inactiva</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Validation Results - Only show errors when validation fails on submit */}
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
            </div>

            {/* Map Section */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Editar Zona en el Mapa
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {mapCenter || currentPolygon ? (
                    <GoogleMapProvider>
                      <ZoneDrawingMap
                        existingZones={Array.isArray(existingZones) ? existingZones.filter(z => z.id !== zoneId) : []}
                        onPolygonComplete={handlePolygonComplete}
                        onPolygonEdit={handlePolygonEdit}
                        initialPolygon={currentPolygon || undefined}
                        center={mapCenter || (zone &&
                          typeof zone.centerLat === 'number' &&
                          typeof zone.centerLng === 'number' &&
                          !isNaN(zone.centerLat) &&
                          !isNaN(zone.centerLng) ? {
                            lat: zone.centerLat,
                            lng: zone.centerLng,
                          } : undefined)}
                      />
                    </GoogleMapProvider>
                  ) : (
                    <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg border-2 border-dashed border-red-300">
                      <div className="text-center text-red-600">
                        <MapPin className="h-16 w-16 mx-auto mb-4 opacity-50" />
                        <h3 className="text-lg font-semibold mb-2">Coordenadas no disponibles</h3>
                        <p className="text-sm mb-4">
                          Esta ciudad no tiene coordenadas GPS configuradas para editar zonas.
                        </p>
                        <p className="text-xs text-gray-500">
                          Configure las coordenadas de latitud y longitud en la base de datos
                          antes de poder editar zonas de servicio.
                        </p>
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
                      Zona Actualizada
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
                    {existingZones && existingZones.length > 1 && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Otras zonas:</span>
                        <Badge variant="outline">
                          {existingZones.length - 1} zona(s)
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
              Actualizar Zona
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
