'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useRideTier, useToggleRideTierStatus } from '@/features/config/hooks';
import { invalidateQueries } from '@/lib/api/react-query-client';
import { PriceExamples, RideTiersEditModal } from '@/features/config/components/pricing';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Loader2, Car, DollarSign, Users, Edit, ToggleLeft, ToggleRight } from 'lucide-react';

export default function RideTierDetailPage() {
  const params = useParams();
  const router = useRouter();
  const tierId = params.id as string;

  // Estados para controlar los modales
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Convertir string a number para el hook
  const tierIdNumber = parseInt(tierId, 10);

  const { data: tierData, isLoading, error } = useRideTier(tierIdNumber);
  const toggleTierMutation = useToggleRideTierStatus();

  const handleBack = () => {
    router.push('/dashboard/config/pricing');
  };

  const handleToggleActive = () => {
    if (!tierData) return;

    toggleTierMutation.mutate(
      { id: tierIdNumber },
      {
        onSuccess: () => {
          // El hook ya invalida las queries, pero podemos agregar lógica adicional aquí si es necesario
        },
        onError: (error: any) => {
          alert(`Error al actualizar el estado del tier: ${error.message || 'Error desconocido'}`);
        }
      }
    );
  };

  const formatCurrency = (amount: number) => {
    return `$${(amount / 100).toFixed(2)}`;
  };

  const formatPassengers = (min: number, max: number) => {
    if (min === max) return `${min} pasajero${min === 1 ? '' : 's'}`;
    return `${min}-${max} pasajeros`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Cargando detalles del nivel de tarifa...</span>
        </div>
      </div>
    );
  }

  if (error || !tierData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-red-600">
              <h3 className="text-lg font-semibold mb-2">Error al cargar nivel de tarifa</h3>
              <p>No se pudo cargar la información del nivel de tarifa. Puede que no exista o haya ocurrido un error.</p>
              {error && <p className="text-sm text-gray-600 mt-2">Error: {error.message}</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Back Button and Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Niveles de Tarifa
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Car className="h-8 w-8" />
              Detalles del Nivel de Tarifa
            </h1>
            <p className="text-muted-foreground">
              Información completa de {tierData.name}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setIsEditModalOpen(true)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
          <Button
            variant={tierData.isActive ? "destructive" : "default"}
            onClick={handleToggleActive}
            disabled={toggleTierMutation.isPending}
          >
            {toggleTierMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : tierData.isActive ? (
              <>
                <ToggleRight className="h-4 w-4 mr-2" />
                Desactivar
              </>
            ) : (
              <>
                <ToggleLeft className="h-4 w-4 mr-2" />
                Activar
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="h-5 w-5" />
            Información Básica
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Nombre</label>
              <p className="text-sm font-medium">{tierData.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Estado</label>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={tierData.isActive ? "default" : "secondary"}>
                  {tierData.isActive ? 'Activo' : 'Inactivo'}
                </Badge>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Prioridad</label>
              <Badge className={
                tierData.priority <= 3 ? 'bg-red-100 text-red-800' :
                tierData.priority <= 6 ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }>
                {tierData.priority}
              </Badge>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">ID</label>
              <p className="text-sm font-mono font-medium">{tierData.id}</p>
            </div>
            {(tierData as any).imageUrl && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Imagen</label>
                <div className="mt-1">
                  <img
                    src={(tierData as any).imageUrl}
                    alt={tierData.name}
                    className="w-16 h-16 object-cover rounded border"
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pricing Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Configuración de Precios
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Tarifa Base</label>
              <p className="text-lg font-bold text-green-600">{formatCurrency(tierData.baseFare)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Por Minuto</label>
              <p className="text-lg font-bold text-blue-600">{formatCurrency(tierData.perMinuteRate)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Por Kilómetro</label>
              <p className="text-lg font-bold text-purple-600">{formatCurrency(tierData.perKmRate)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Pasajeros</label>
              <p className="text-sm font-medium">{formatPassengers(tierData.minPassengers, tierData.maxPassengers)}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Tarifa Mínima</label>
              <p className="text-sm font-medium">
                {tierData.minimumFare ? formatCurrency(tierData.minimumFare) : 'No definida'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Price Examples */}
      <PriceExamples
        baseFare={tierData.baseFare}
        perKmRate={tierData.perKmRate}
        perMinuteRate={tierData.perMinuteRate}
        tierMultiplier={tierData.tierMultiplier}
        surgeMultiplier={tierData.surgeMultiplier}
        demandMultiplier={tierData.demandMultiplier}
        minimumFare={tierData.minimumFare}
      />

      {/* Multipliers */}
      <Card>
        <CardHeader>
          <CardTitle>Multiplicadores</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Multiplicador Base</label>
              <p className="text-lg font-bold">{tierData.tierMultiplier}x</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Multiplicador de Demanda</label>
              <p className="text-lg font-bold">{tierData.surgeMultiplier}x</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Multiplicador de Pico</label>
              <p className="text-lg font-bold">{tierData.demandMultiplier}x</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Multiplicador de Lujo</label>
              <p className="text-lg font-bold">
                {tierData.luxuryMultiplier ? `${tierData.luxuryMultiplier}x` : 'No definido'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Multiplicador de Confort</label>
              <p className="text-lg font-bold">
                {tierData.comfortMultiplier ? `${tierData.comfortMultiplier}x` : 'No definido'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vehicle Types */}
      {tierData.vehicleTypes && tierData.vehicleTypes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="h-5 w-5" />
              Tipos de Vehículo Asociados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {tierData.vehicleTypes.map((vehicleType) => (
                <Badge key={vehicleType.id} variant="outline" className="flex items-center gap-1">
                  <span>{vehicleType.displayName}</span>
                </Badge>
              ))}
            </div>
            {tierData.vehicleTypes.length === 0 && (
              <p className="text-sm text-muted-foreground">No hay tipos de vehículo asociados</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Usage Statistics */}
      {tierData.ridesCount !== undefined && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Estadísticas de Uso
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Viajes Realizados</label>
                <p className="text-2xl font-bold text-blue-600">{tierData.ridesCount.toLocaleString()}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Estado de Uso</label>
                <div className="mt-1">
                  <Badge variant={tierData.ridesCount > 0 ? "default" : "secondary"}>
                    {tierData.ridesCount > 0 ? 'En uso' : 'Sin viajes'}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Modal */}
      {tierData && (
        <RideTiersEditModal
          tierId={tierIdNumber}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={() => {
            setIsEditModalOpen(false);
            // El modal ya invalida las queries, pero podemos agregar lógica adicional aquí si es necesario
          }}
        />
      )}
    </div>
  );
}
