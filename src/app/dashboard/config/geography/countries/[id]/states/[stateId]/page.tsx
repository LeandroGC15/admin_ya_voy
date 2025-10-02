'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCountry, useState as useStateHook, useCitiesByState } from '@/features/config/hooks/use-geography';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, AlertTriangle, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CitiesTable, CitiesCreateModal, CitiesEditModal, CitiesDeleteModal, CitiesToggleModal } from '@/features/config/components/geography';
import { City } from '@/features/config/schemas/geography.schemas';

export default function StateDetailPage() {
  const params = useParams();
  const router = useRouter();
  const countryId = params.id as string;
  const stateId = params.stateId as string;

  // Convertir strings a numbers para los hooks
  const countryIdNumber = parseInt(countryId, 10);
  const stateIdNumber = parseInt(stateId, 10);

  const { data: countryData, isLoading: countryLoading } = useCountry(countryIdNumber);
  const { data: stateData, isLoading: stateLoading } = useStateHook(stateIdNumber);
  const { data: citiesData, isLoading: citiesLoading } = useCitiesByState(stateIdNumber);

  // State management
  const [selectedCity, setSelectedCity] = useState<City | null>(null);

  // Modal states
  const [createCityModalOpen, setCreateCityModalOpen] = useState(false);
  const [editCityModalOpen, setEditCityModalOpen] = useState(false);
  const [deleteCityModalOpen, setDeleteCityModalOpen] = useState(false);
  const [toggleCityModalOpen, setToggleCityModalOpen] = useState(false);

  const handleBack = () => {
    router.push(`/dashboard/config/geography/countries/${countryId}`);
  };

  const handleCitySelect = (city: City) => {
    router.push(`/dashboard/config/geography/countries/${countryId}/states/${stateId}/cities/${city.id}`);
  };

  const handleCityEdit = (city: City) => {
    setSelectedCity(city);
    setEditCityModalOpen(true);
  };

  const handleCityDelete = (city: City) => {
    setSelectedCity(city);
    setDeleteCityModalOpen(true);
  };

  const handleCityToggle = (city: City) => {
    setSelectedCity(city);
    setToggleCityModalOpen(true);
  };

  // Handle modal close
  const handleModalClose = () => {
    setCreateCityModalOpen(false);
    setEditCityModalOpen(false);
    setDeleteCityModalOpen(false);
    setToggleCityModalOpen(false);
    setSelectedCity(null);
  };

  // Handle success actions
  const handleSuccess = () => {
    handleModalClose();
    // Data will be refreshed automatically by React Query
  };

  if (countryLoading || stateLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Cargando estado...</span>
      </div>
    );
  }

  if (!countryData || !stateData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Error al cargar el estado
        </h3>
        <p className="text-gray-500 mb-4">
          No se pudo cargar la información del estado
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
            <MapPin className="h-8 w-8" />
            {state.name}
          </h1>
          <p className="text-gray-600 mt-1">
            Estado de {country.name} - Gestiona este estado y sus ciudades
          </p>
        </div>
      </div>

      {/* State Details */}
      <Card>
        <CardHeader>
          <CardTitle>Información del Estado</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-medium">Nombre:</span>
              <p className="mt-1">{state.name}</p>
            </div>
            <div>
              <span className="font-medium">Código:</span>
              <p className="mt-1 font-mono">{state.code}</p>
            </div>
            <div>
              <span className="font-medium">País:</span>
              <p className="mt-1">{country.name}</p>
            </div>
            <div>
              <span className="font-medium">Estado:</span>
              <p className="mt-1">
                <Badge variant={state.isActive ? "secondary" : "destructive"}>
                  {state.isActive ? 'Activo' : 'Inactivo'}
                </Badge>
              </p>
            </div>
            <div>
              <span className="font-medium">Código:</span>
              <p className="mt-1 font-mono">{state.code}</p>
            </div>
            <div>
              <span className="font-medium">Población:</span>
              <p className="mt-1">{state.population?.toLocaleString() || 'No especificada'}</p>
            </div>
            <div>
              <span className="font-medium">Área:</span>
              <p className="mt-1">{state.areaKm2 ? `${state.areaKm2.toLocaleString()} km²` : 'No especificada'}</p>
            </div>
            <div>
              <span className="font-medium">Capital:</span>
              <p className="mt-1">{state.capital || 'No especificada'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cities Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Ciudades de {state.name}</CardTitle>
            <Button onClick={() => setCreateCityModalOpen(true)}>
              Agregar Ciudad
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {citiesLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              Cargando ciudades...
            </div>
          ) : citiesData && citiesData.length > 0 ? (
            <CitiesTable
              data={citiesData ? {
                cities: citiesData,
                total: citiesData.length,
                page: 1,
                limit: citiesData.length,
                totalPages: 1
              } : undefined}
              loading={citiesLoading}
              onCitySelect={handleCitySelect}
              onCityEdit={handleCityEdit}
              onCityDelete={handleCityDelete}
              onCityToggle={handleCityToggle}
            />
          ) : (
            <div className="text-center py-8">
              <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay ciudades
              </h3>
              <p className="text-gray-500">
                Este estado aún no tiene ciudades configuradas.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <CitiesCreateModal
        isOpen={createCityModalOpen}
        onClose={handleModalClose}
        onSuccess={handleSuccess}
        defaultStateId={stateIdNumber}
      />

      <CitiesEditModal
        isOpen={editCityModalOpen}
        onClose={handleModalClose}
        city={selectedCity}
        onSuccess={handleSuccess}
      />

      <CitiesDeleteModal
        isOpen={deleteCityModalOpen}
        onClose={handleModalClose}
        city={selectedCity}
        onSuccess={handleSuccess}
      />

      <CitiesToggleModal
        isOpen={toggleCityModalOpen}
        onClose={handleModalClose}
        city={selectedCity}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
