'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@/features/users/hooks';
import { invalidateQueries } from '@/lib/api/react-query-client';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const { data: userData, isLoading, error } = useUser(userId);

  const handleBack = () => {
    router.push('/dashboard/users');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Cargando detalles del usuario...</span>
        </div>
      </div>
    );
  }

  if (error || !userData) {
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
              <h3 className="text-lg font-semibold mb-2">Error al cargar usuario</h3>
              <p>No se pudo cargar la información del usuario. Puede que no exista o haya ocurrido un error.</p>
              {error && <p className="text-sm text-gray-600 mt-2">Error: {error.message}</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // La API devuelve una estructura anidada como conductores
  const { basic, address, preferences, stats, wallet, emergencyContacts, recentRides } = userData;
  const isDeactivated = !!basic.deletedAt;

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a Usuarios
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Detalles del Usuario
          </h1>
          <p className="text-muted-foreground">
            Información completa de {basic.name}
          </p>
        </div>
      </div>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Información Básica</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Profile Image */}
          {address?.profileImage && (
            <div className="flex justify-center mb-6">
              <div className="h-24 w-24 rounded-full overflow-hidden border-4 border-gray-200">
                <img
                  src={address.profileImage}
                  alt={`Foto de perfil de ${basic.name}`}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${basic.name}`;
                  }}
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Nombre</label>
              <p className="text-sm font-medium">{basic.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              <p className="text-sm font-medium">{basic.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Teléfono</label>
              <p className="text-sm font-medium">{basic.phone || 'No especificado'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Tipo de Usuario</label>
              <Badge variant="secondary">
                Pasajero
              </Badge>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Estado</label>
              <Badge variant={basic.isActive ? 'default' : 'destructive'}>
                {basic.isActive ? 'Activo' : 'Inactivo'}
              </Badge>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Email Verificado</label>
              <Badge variant={basic.emailVerified ? 'default' : 'secondary'}>
                {basic.emailVerified ? 'Sí' : 'No'}
              </Badge>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Teléfono Verificado</label>
              <Badge variant={basic.phoneVerified ? 'default' : 'secondary'}>
                {basic.phoneVerified ? 'Sí' : 'No'}
              </Badge>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Identidad Verificada</label>
              <Badge variant={basic.identityVerified ? 'default' : 'secondary'}>
                {basic.identityVerified ? 'Sí' : 'No'}
              </Badge>
            </div>
            {basic.dateOfBirth && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Fecha de Nacimiento</label>
                <p className="text-sm font-medium">{new Date(basic.dateOfBirth).toLocaleDateString()}</p>
              </div>
            )}
            {basic.gender && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Género</label>
                <p className="text-sm font-medium capitalize">{basic.gender}</p>
              </div>
            )}
            {basic.lastLogin && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Último Login</label>
                <p className="text-sm font-medium">{new Date(basic.lastLogin).toLocaleString()}</p>
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-muted-foreground">Fecha de Registro</label>
              <p className="text-sm font-medium">{new Date(basic.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Address Information */}
      {address && (
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
                <label className="text-sm font-medium text-muted-foreground">País</label>
                <p className="text-sm font-medium">{address.country || 'No especificado'}</p>
              </div>
              {address.postalCode && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Código Postal</label>
                  <p className="text-sm font-medium">{address.postalCode}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preferences */}
      {preferences && (
        <Card>
          <CardHeader>
            <CardTitle>Preferencias</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Idioma Preferido</label>
                <p className="text-sm font-medium">{preferences.preferredLanguage || 'No especificado'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Zona Horaria</label>
                <p className="text-sm font-medium">{preferences.timezone || 'No especificada'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Moneda</label>
                <p className="text-sm font-medium">{preferences.currency || 'No especificada'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistics */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle>Estadísticas de Viajes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.totalRides}</div>
                <div className="text-sm text-muted-foreground">Viajes Totales</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.completedRides}</div>
                <div className="text-sm text-muted-foreground">Viajes Completados</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{stats.cancelledRides}</div>
                <div className="text-sm text-muted-foreground">Viajes Cancelados</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {stats.averageRating ? stats.averageRating.toFixed(1) : 'N/A'}
                </div>
                <div className="text-sm text-muted-foreground">Calificación Promedio</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Wallet Information */}
      {wallet && (
        <Card>
          <CardHeader>
            <CardTitle>Billetera</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  ${wallet.balance ? wallet.balance.toFixed(2) : '0.00'}
                </div>
                <div className="text-sm text-muted-foreground">Saldo Actual</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{wallet.totalTransactions}</div>
                <div className="text-sm text-muted-foreground">Transacciones Totales</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Emergency Contacts */}
      {emergencyContacts && emergencyContacts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Contactos de Emergencia ({emergencyContacts.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {emergencyContacts.map((contact, index) => (
                <div key={contact.id || index} className="border rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Nombre del Contacto</label>
                      <p className="text-sm font-medium">{contact.contactName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Teléfono del Contacto</label>
                      <p className="text-sm font-medium">{contact.contactPhone}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Rides */}
      {recentRides && recentRides.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Viajes Recientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentRides.slice(0, 5).map((ride, index) => (
                <div key={ride.id || index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">Viaje #{ride.id || ride.rideId}</h4>
                    <Badge variant={ride.status === 'completed' ? 'default' : 'secondary'}>
                      {ride.status === 'completed' ? 'Completado' :
                       ride.status === 'cancelled' ? 'Cancelado' :
                       ride.status === 'active' ? 'Activo' : ride.status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Fecha:</span>
                      <span className="ml-2 font-medium">
                        {new Date(ride.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Tarifa:</span>
                      <span className="ml-2 font-medium">
                        ${ride.farePrice?.toFixed(2) || 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Estado:</span>
                      <span className="ml-2 font-medium capitalize">
                        {ride.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
