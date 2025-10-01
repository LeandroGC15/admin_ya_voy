'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useDriver } from '@/features/drivers/hooks';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function VehicleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const driverId = params.id as string;
  const vehicleId = params.vehicleId as string;

  // Convertir strings a numbers para el hook
  const driverIdNumber = parseInt(driverId, 10);
  const vehicleIdNumber = parseInt(vehicleId, 10);

  const { data: driverData, isLoading, error } = useDriver(driverIdNumber);

  // Encontrar el vehículo específico
  const vehicle = driverData?.vehicles?.find(v => v.id === vehicleIdNumber);

  const handleBack = () => {
    router.push(`/dashboard/drivers/${driverId}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Cargando detalles del vehículo...</span>
        </div>
      </div>
    );
  }

  if (error || !driverData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al Conductor
          </Button>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-red-600">
              <h3 className="text-lg font-semibold mb-2">Error al cargar vehículo</h3>
              <p>No se pudo cargar la información del vehículo. Puede que no exista o haya ocurrido un error.</p>
              {error && <p className="text-sm text-gray-600 mt-2">Error: {error.message}</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al Conductor
          </Button>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-red-600">
              <h3 className="text-lg font-semibold mb-2">Vehículo no encontrado</h3>
              <p>El vehículo solicitado no existe o no pertenece a este conductor.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { basic } = driverData;

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver al Conductor
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Detalles del Vehículo
          </h1>
          <p className="text-muted-foreground">
            {vehicle.make} {vehicle.model} - Conductor: {basic.firstName} {basic.lastName}
          </p>
        </div>
      </div>

      {/* Basic Vehicle Information */}
      <Card>
        <CardHeader>
          <CardTitle>Información Básica del Vehículo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Marca</label>
              <p className="text-sm font-medium">{vehicle.make}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Modelo</label>
              <p className="text-sm font-medium">{vehicle.model}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Año</label>
              <p className="text-sm font-medium">{vehicle.year || 'No especificado'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Color</label>
              <p className="text-sm font-medium">{vehicle.color || 'No especificado'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Placa</label>
              <p className="text-sm font-medium">{vehicle.licensePlate}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">VIN</label>
              <p className="text-sm font-medium">{vehicle.vin || 'No especificado'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Asientos</label>
              <p className="text-sm font-medium">{vehicle.seatingCapacity || 'No especificado'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Combustible</label>
              <p className="text-sm font-medium">{vehicle.fuelType || 'No especificado'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Tipo de Vehículo</label>
              <p className="text-sm font-medium">
                {vehicle.vehicleType ? vehicle.vehicleType.displayName : 'No especificado'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Estado</label>
              <Badge variant={vehicle.status === 'active' ? 'default' : 'secondary'}>
                {vehicle.status === 'active' ? 'Activo' :
                 vehicle.status === 'inactive' ? 'Inactivo' :
                 vehicle.status === 'maintenance' ? 'En mantenimiento' : vehicle.status}
              </Badge>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Verificación</label>
              <Badge variant={vehicle.verificationStatus === 'verified' ? 'default' : 'secondary'}>
                {vehicle.verificationStatus === 'verified' ? 'Verificado' :
                 vehicle.verificationStatus === 'pending' ? 'Pendiente' :
                 vehicle.verificationStatus === 'rejected' ? 'Rechazado' :
                 vehicle.verificationStatus === 'under_review' ? 'En revisión' : vehicle.verificationStatus}
              </Badge>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Vehículo Principal</label>
              <Badge variant={vehicle.isDefault ? 'default' : 'secondary'}>
                {vehicle.isDefault ? 'Sí' : 'No'}
              </Badge>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Fecha de Creación</label>
              <p className="text-sm font-medium">
                {vehicle.createdAt ? new Date(vehicle.createdAt).toLocaleDateString() : 'No especificada'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Última Actualización</label>
              <p className="text-sm font-medium">
                {vehicle.updatedAt ? new Date(vehicle.updatedAt).toLocaleDateString() : 'No especificada'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vehicle Features */}
      <Card>
        <CardHeader>
          <CardTitle>Características del Vehículo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${vehicle.hasAC ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              <span className="text-sm">Aire Acondicionado</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${vehicle.hasGPS ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              <span className="text-sm">GPS</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Insurance Information */}
      {(vehicle.insuranceProvider || vehicle.insurancePolicyNumber || vehicle.insuranceExpiryDate) && (
        <Card>
          <CardHeader>
            <CardTitle>Información del Seguro</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Proveedor</label>
                <p className="text-sm font-medium">{vehicle.insuranceProvider || 'No especificado'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Número de Póliza</label>
                <p className="text-sm font-medium">{vehicle.insurancePolicyNumber || 'No especificado'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Fecha de Expiración</label>
                <p className="text-sm font-medium">
                  {vehicle.insuranceExpiryDate ? new Date(vehicle.insuranceExpiryDate).toLocaleDateString() : 'No especificada'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Vehicle Images */}
      {(vehicle.frontImageUrl || vehicle.sideImageUrl || vehicle.backImageUrl || vehicle.interiorImageUrl) && (
        <Card>
          <CardHeader>
            <CardTitle>Imágenes del Vehículo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {vehicle.frontImageUrl && (
                <div className="text-center">
                  <img
                    src={vehicle.frontImageUrl}
                    alt="Frontal del vehículo"
                    className="w-full h-32 object-cover rounded-lg mb-2"
                  />
                  <p className="text-sm text-muted-foreground">Vista Frontal</p>
                </div>
              )}
              {vehicle.sideImageUrl && (
                <div className="text-center">
                  <img
                    src={vehicle.sideImageUrl}
                    alt="Lateral del vehículo"
                    className="w-full h-32 object-cover rounded-lg mb-2"
                  />
                  <p className="text-sm text-muted-foreground">Vista Lateral</p>
                </div>
              )}
              {vehicle.backImageUrl && (
                <div className="text-center">
                  <img
                    src={vehicle.backImageUrl}
                    alt="Trasera del vehículo"
                    className="w-full h-32 object-cover rounded-lg mb-2"
                  />
                  <p className="text-sm text-muted-foreground">Vista Trasera</p>
                </div>
              )}
              {vehicle.interiorImageUrl && (
                <div className="text-center">
                  <img
                    src={vehicle.interiorImageUrl}
                    alt="Interior del vehículo"
                    className="w-full h-32 object-cover rounded-lg mb-2"
                  />
                  <p className="text-sm text-muted-foreground">Vista Interior</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Vehicle Documents */}
      {vehicle.documents && vehicle.documents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Documentos del Vehículo ({vehicle.documents.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {vehicle.documents.map((document, index) => (
                <div key={document.id || index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold capitalize">{document.documentType.replace('_', ' ')}</h4>
                    <Badge variant={document.verificationStatus === 'verified' ? 'default' : 'secondary'}>
                      {document.verificationStatus === 'verified' ? 'Verificado' :
                       document.verificationStatus === 'pending' ? 'Pendiente' :
                       document.verificationStatus === 'rejected' ? 'Rechazado' : document.verificationStatus}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Tipo:</span>
                      <span className="ml-2 font-medium capitalize">{document.documentType.replace('_', ' ')}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Subido:</span>
                      <span className="ml-2 font-medium">
                        {new Date(document.uploadedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Verificado:</span>
                      <span className="ml-2 font-medium">
                        {document.verifiedAt ? new Date(document.verifiedAt).toLocaleDateString() : 'No verificado'}
                      </span>
                    </div>
                  </div>
                  {document.documentUrl && (
                    <div className="mt-2">
                      <Button variant="outline" size="sm" asChild>
                        <a href={document.documentUrl} target="_blank" rel="noopener noreferrer">
                          Ver Documento
                        </a>
                      </Button>
                    </div>
                  )}
                  {document.rejectedReason && (
                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                      <strong>Razón de rechazo:</strong> {document.rejectedReason}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
