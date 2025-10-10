'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useDriver, useUpdateDriverVerification } from '@/features/drivers/hooks';
import { invalidateQueries } from '@/lib/api/react-query-client';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function DriverDetailPage() {
  const params = useParams();
  const router = useRouter();
  const driverId = params.id as string;

  // Convertir string a number para el hook
  const driverIdNumber = parseInt(driverId, 10);

  const { data: driverData, isLoading, error } = useDriver(driverIdNumber);
  const updateVerificationMutation = useUpdateDriverVerification();

  const handleBack = () => {
    router.push('/dashboard/drivers');
  };

  const handleVerificationToggle = () => {
    if (!driverData) return;

    const newStatus = driverData.basic.verificationStatus === 'VERIFIED' ? 'SUSPENDED' : 'VERIFIED';
    updateVerificationMutation.mutate(
      {
        driverId: driverIdNumber,
        verificationStatus: newStatus
      },
      {
        onSuccess: () => {
          // Invalidate and refetch the driver data to update the UI
          invalidateQueries(['drivers', 'detail', driverIdNumber.toString()]);
        },
        onError: (error: any) => {
          alert(`Error al actualizar verificación: ${error.message || 'Error desconocido'}`);
        }
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Cargando detalles del conductor...</span>
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
            Volver
          </Button>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-red-600">
              <h3 className="text-lg font-semibold mb-2">Error al cargar conductor</h3>
              <p>No se pudo cargar la información del conductor. Puede que no exista o haya ocurrido un error.</p>
              {error && <p className="text-sm text-gray-600 mt-2">Error: {error.message}</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { basic, stats, address, documents, vehicles, currentWorkZone, paymentMethods, recentRides, performanceStats } = driverData;

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a Conductores
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Detalles del Conductor
          </h1>
          <p className="text-muted-foreground">
            Información completa de {basic.firstName} {basic.lastName}
          </p>
        </div>
      </div>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Información Básica</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Nombre</label>
              <p className="text-sm font-medium">{basic.firstName} {basic.lastName}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              <p className="text-sm font-medium">{basic.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Teléfono</label>
              <p className="text-sm font-medium">{basic.phone}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Estado</label>
              <Badge variant={basic.status === 'ONLINE' ? 'default' : 'secondary'}>
                {basic.status === 'ONLINE' ? 'En línea' :
                 basic.status === 'BUSY' ? 'Ocupado' :
                 basic.status === 'OFFLINE' ? 'Fuera de línea' :
                 basic.status === 'SUSPENDED' ? 'Suspendido' :
                 basic.status}
              </Badge>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Verificación</label>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={basic.verificationStatus === 'VERIFIED' ? 'default' : 'secondary'}>
                  {basic.verificationStatus === 'VERIFIED' ? 'Verificado' :
                   basic.verificationStatus === 'PENDING' ? 'Pendiente' :
                   basic.verificationStatus === 'REJECTED' ? 'Rechazado' :
                   basic.verificationStatus === 'PENDING' ? 'En revisión' : basic.verificationStatus}
                </Badge>
                <Button
                  variant={basic.verificationStatus === 'VERIFIED' ? 'destructive' : 'default'}
                  size="sm"
                  onClick={handleVerificationToggle}
                  disabled={updateVerificationMutation.isPending}
                >
                  {updateVerificationMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : basic.verificationStatus === 'VERIFIED' ? (
                    <XCircle className="h-4 w-4 mr-2" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  )}
                  {updateVerificationMutation.isPending
                    ? 'Actualizando...'
                    : basic.verificationStatus === 'VERIFIED'
                      ? 'Suspender'
                      : 'Verificar'}
                </Button>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Entregas</label>
              <Badge variant={basic.canDoDeliveries ? 'default' : 'secondary'}>
                {basic.canDoDeliveries ? 'Sí' : 'No'}
              </Badge>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Fecha de Nacimiento</label>
              <p className="text-sm font-medium">
                {basic.dateOfBirth ? new Date(basic.dateOfBirth).toLocaleDateString() : 'No especificada'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Género</label>
              <p className="text-sm font-medium">{basic.gender || 'No especificado'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Última Actividad</label>
              <p className="text-sm font-medium">
                {basic.lastActive ? new Date(basic.lastActive).toLocaleString() : 'Nunca'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Fecha de Registro</label>
              <p className="text-sm font-medium">{new Date(basic.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Estadísticas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.totalRides}</div>
              <div className="text-sm text-muted-foreground">Viajes Totales</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.completedRides}</div>
              <div className="text-sm text-muted-foreground">Viajes Completados</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.cancelledRides}</div>
              <div className="text-sm text-muted-foreground">Viajes Cancelados</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.averageRating.toFixed(1)}</div>
              <div className="text-sm text-muted-foreground">Calificación Promedio</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">${stats.totalEarnings.toFixed(2)}</div>
              <div className="text-sm text-muted-foreground">Ganancias Totales</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">{stats.completionRate}%</div>
              <div className="text-sm text-muted-foreground">Tasa de Finalización</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Address Information */}
      <Card>
        <CardHeader>
          <CardTitle>Dirección</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Dirección</label>
              <p className="text-sm font-medium">{address.address || 'No especificada'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Ciudad</label>
              <p className="text-sm font-medium">{address.city || 'No especificada'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Estado</label>
              <p className="text-sm font-medium">{address.state || 'No especificado'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Código Postal</label>
              <p className="text-sm font-medium">{address.postalCode || 'No especificado'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Driver Documents */}
      {documents && documents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Documentos del Conductor ({documents.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {documents.map((document, index) => (
                <div key={document.id || index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold capitalize">{document.documentType.replace('_', ' ')}</h4>
                    <Badge variant={document.verificationStatus === 'VERIFIED' ? 'default' : 'secondary'}>
                      {document.verificationStatus === 'VERIFIED' ? 'Verificado' :
                       document.verificationStatus === 'PENDING' ? 'Pendiente' :
                       document.verificationStatus === 'REJECTED' ? 'Rechazado' : document.verificationStatus}
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

      {/* Vehicles */}
      {vehicles && vehicles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Vehículos ({vehicles.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {vehicles.map((vehicle, index) => (
                <div key={vehicle.id || index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">{vehicle.make} {vehicle.model}</h4>
                    <div className="flex items-center gap-2">
                      {vehicle.isDefault && <Badge variant="default">Vehículo Principal</Badge>}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/dashboard/drivers/${driverIdNumber}/vehicles/${vehicle.id}`)}
                      >
                        Ver Detalles
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Año:</span>
                      <span className="ml-2 font-medium">{vehicle.year || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Color:</span>
                      <span className="ml-2 font-medium">{vehicle.color || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Placa:</span>
                      <span className="ml-2 font-medium">{vehicle.licensePlate}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Asientos:</span>
                      <span className="ml-2 font-medium">{vehicle.seatingCapacity || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Combustible:</span>
                      <span className="ml-2 font-medium">{vehicle.fuelType || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Estado:</span>
                      <Badge variant={vehicle.status === 'ACTIVE' ? 'default' : 'secondary'} className="ml-2">
                        {vehicle.status === 'ACTIVE' ? 'Activo' : vehicle.status}
                      </Badge>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Verificación:</span>
                      <Badge variant={vehicle.verificationStatus === 'VERIFIED' ? 'default' : 'secondary'} className="ml-2">
                        {vehicle.verificationStatus === 'VERIFIED' ? 'Verificado' : vehicle.verificationStatus}
                      </Badge>
                    </div>
                    {vehicle.vehicleType && (
                      <div>
                        <span className="text-muted-foreground">Tipo:</span>
                        <span className="ml-2 font-medium">{vehicle.vehicleType.displayName}</span>
                      </div>
                    )}
                  </div>
                  {vehicle.insuranceExpiryDate && (
                    <div className="mt-2">
                      <span className="text-muted-foreground">Seguro expira:</span>
                      <span className="ml-2 font-medium">
                        {new Date(vehicle.insuranceExpiryDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Performance Stats */}
      {performanceStats && (
        <Card>
          <CardHeader>
            <CardTitle>Estadísticas de Rendimiento (Hoy)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{performanceStats.todayRides || 0}</div>
                <div className="text-sm text-muted-foreground">Viajes Hoy</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">${performanceStats.todayEarnings?.toFixed(2) || '0.00'}</div>
                <div className="text-sm text-muted-foreground">Ganancias Hoy</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{performanceStats.averageResponseTime || 'N/A'}</div>
                <div className="text-sm text-muted-foreground">Tiempo de Respuesta Promedio</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{performanceStats.customerSatisfaction || 'N/A'}</div>
                <div className="text-sm text-muted-foreground">Satisfacción del Cliente</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
