'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCountry, useStatesByCountry } from '@/features/config/hooks/use-geography';
import { invalidateQueries } from '@/lib/api/react-query-client';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, Settings, AlertTriangle, Globe } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StatesTable, StatesCreateModal, StatesEditModal, StatesDeleteModal, StatesToggleModal } from '@/features/config/components/geography';
import { State, StateListItem } from '@/features/config/schemas/geography.schemas';

export default function CountryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const countryId = params.id as string;

  // Convertir string a number para el hook
  const countryIdNumber = parseInt(countryId, 10);

  const { data: countryData, isLoading, error } = useCountry(countryIdNumber);
  const { data: statesData, isLoading: statesLoading } = useStatesByCountry(countryIdNumber);

  // State management
  const [selectedState, setSelectedState] = useState<State | null>(null);

  // Modal states
  const [createStateModalOpen, setCreateStateModalOpen] = useState(false);
  const [editStateModalOpen, setEditStateModalOpen] = useState(false);
  const [deleteStateModalOpen, setDeleteStateModalOpen] = useState(false);
  const [toggleStateModalOpen, setToggleStateModalOpen] = useState(false);

  const handleBack = () => {
    router.push('/dashboard/config/geography/countries');
  };

  // Convert StateListItem to State with default values
  const convertStateListItemToState = (stateListItem: StateListItem): State => ({
    ...stateListItem,
    countryId: countryIdNumber, // Use the country ID from params
    latitude: undefined,
    longitude: undefined,
    timezone: undefined,
    pricingMultiplier: undefined,
    serviceFee: undefined,
    capital: undefined,
    population: undefined,
    areaKm2: undefined,
    createdAt: '',
    updatedAt: '',
    country: {
      id: countryIdNumber,
      name: stateListItem.countryName,
      isoCode2: 'VE', // Default fallback
      flag: undefined,
    },
  });

  const handleStateSelect = (state: StateListItem) => {
    router.push(`/dashboard/config/geography/countries/${countryId}/states/${state.id}`);
  };

  const handleStateEdit = (state: StateListItem) => {
    const fullState = convertStateListItemToState(state);
    setSelectedState(fullState);
    setEditStateModalOpen(true);
  };

  const handleStateDelete = (state: StateListItem) => {
    const fullState = convertStateListItemToState(state);
    setSelectedState(fullState);
    setDeleteStateModalOpen(true);
  };

  const handleStateToggle = (state: StateListItem) => {
    const fullState = convertStateListItemToState(state);
    setSelectedState(fullState);
    setToggleStateModalOpen(true);
  };

  // Handle modal close
  const handleModalClose = () => {
    setCreateStateModalOpen(false);
    setEditStateModalOpen(false);
    setDeleteStateModalOpen(false);
    setToggleStateModalOpen(false);
    setSelectedState(null);
  };

  // Handle success actions
  const handleSuccess = () => {
    handleModalClose();
    // Data will be refreshed automatically by React Query
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Cargando país...</span>
      </div>
    );
  }

  if (error || !countryData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Error al cargar el país
        </h3>
        <p className="text-gray-500 mb-4">
          {error?.message || 'No se pudo cargar la información del país'}
        </p>
        <Button onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
      </div>
    );
  }

  const country = countryData;

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
            <Globe className="h-8 w-8" />
            {country.name}
          </h1>
          <p className="text-gray-600 mt-1">
            Gestiona este país y sus estados
          </p>
        </div>
      </div>

      {/* Country Details */}
      <Card>
        <CardHeader>
          <CardTitle>Información del País</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-medium">Nombre:</span>
              <p className="mt-1">{country.name}</p>
            </div>
            <div>
              <span className="font-medium">Código ISO 2:</span>
              <p className="mt-1 font-mono">{country.isoCode2}</p>
            </div>
            <div>
              <span className="font-medium">Continente:</span>
              <p className="mt-1 capitalize">{country.continent}</p>
            </div>
            <div>
              <span className="font-medium">Estado:</span>
              <p className="mt-1">
                <Badge variant={country.isActive ? "secondary" : "destructive"}>
                  {country.isActive ? 'Activo' : 'Inactivo'}
                </Badge>
              </p>
            </div>
            <div>
              <span className="font-medium">Moneda:</span>
              <p className="mt-1">{country.currencyCode} ({country.currencySymbol})</p>
            </div>
            <div>
              <span className="font-medium">Zona Horaria:</span>
              <p className="mt-1 font-mono">{country.timezone}</p>
            </div>
            <div>
              <span className="font-medium">Población:</span>
              <p className="mt-1">{country.population?.toLocaleString() || 'No especificada'}</p>
            </div>
            <div>
              <span className="font-medium">IVA:</span>
              <p className="mt-1">{country.vatRate ? `${country.vatRate}%` : 'No configurado'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* States Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Estados de {country.name}</CardTitle>
            <Button onClick={() => setCreateStateModalOpen(true)}>
              Agregar Estado
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {statesLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              Cargando estados...
            </div>
          ) : statesData && statesData.states.length > 0 ? (
            <StatesTable
              data={statesData}
              loading={statesLoading}
              onStateSelect={handleStateSelect}
              onStateEdit={handleStateEdit}
              onStateDelete={handleStateDelete}
              onStateToggle={handleStateToggle}
            />
          ) : (
            <div className="text-center py-8">
              <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay estados
              </h3>
              <p className="text-gray-500">
                Este país aún no tiene estados configurados.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <StatesCreateModal
        isOpen={createStateModalOpen}
        onClose={handleModalClose}
        onSuccess={handleSuccess}
        defaultCountryId={countryIdNumber}
      />

      <StatesEditModal
        isOpen={editStateModalOpen}
        onClose={handleModalClose}
        state={selectedState}
        onSuccess={handleSuccess}
      />

      <StatesDeleteModal
        isOpen={deleteStateModalOpen}
        onClose={handleModalClose}
        state={selectedState}
        onSuccess={handleSuccess}
      />

      <StatesToggleModal
        isOpen={toggleStateModalOpen}
        onClose={handleModalClose}
        state={selectedState}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
