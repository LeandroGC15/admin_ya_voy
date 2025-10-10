'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@/features/users/hooks';
import { invalidateQueries } from '@/lib/api/react-query-client';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Loader from '@/components/ui/loader';

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const { data: userData, isLoading, error } = useUser(userId);

  const handleBack = () => {
    router.push('/dashboard/users');
  };

  // Solo mostrar error si no está cargando y hay un error real
  if (!isLoading && error) {
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

  // No renderizar nada mientras está cargando (el loader se mostrará)
  if (isLoading || !userData) {
    return (
      <div className="min-h-screen">
        <Loader isVisible={true} showBackground={true} />
      </div>
    );
  }

  // La API devuelve una estructura plana para usuarios
  const isDeactivated = !!userData.deletedAt;

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
            Información completa de {userData.name}
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
          {/* Note: Users don't have profileImage in current API structure */}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Nombre</label>
              <p className="text-sm font-medium">{userData.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              <p className="text-sm font-medium">{userData.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Teléfono</label>
              <p className="text-sm font-medium">{userData.phone || 'No especificado'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Tipo de Usuario</label>
              <Badge variant="secondary">
                Pasajero
              </Badge>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Estado</label>
              <Badge variant={userData.isActive ? 'default' : 'destructive'}>
                {userData.isActive ? 'Activo' : 'Inactivo'}
              </Badge>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Email Verificado</label>
              <Badge variant={userData.emailVerified ? 'default' : 'secondary'}>
                {userData.emailVerified ? 'Sí' : 'No'}
              </Badge>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Teléfono Verificado</label>
              <Badge variant={userData.phoneVerified ? 'default' : 'secondary'}>
                {userData.phoneVerified ? 'Sí' : 'No'}
              </Badge>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Identidad Verificada</label>
              <Badge variant={userData.identityVerified ? 'default' : 'secondary'}>
                {userData.identityVerified ? 'Sí' : 'No'}
              </Badge>
            </div>
            {/* Note: Properties like dateOfBirth, gender, lastLogin are not in current user schema */}
            <div>
              <label className="text-sm font-medium text-muted-foreground">Fecha de Registro</label>
              <p className="text-sm font-medium">{new Date(userData.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Address Information */}
      {(userData.city || userData.state || userData.country) && (
        <Card>
          <CardHeader>
            <CardTitle>Dirección</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Ciudad</label>
                <p className="text-sm font-medium">{userData.city || 'No especificada'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Estado</label>
                <p className="text-sm font-medium">{userData.state || 'No especificado'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">País</label>
                <p className="text-sm font-medium">{userData.country || 'No especificado'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preferences */}
      {/* Note: Preferences are not in current user schema */}

      {/* Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Estadísticas de Viajes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{userData.totalRides}</div>
              <div className="text-sm text-muted-foreground">Viajes Totales</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{userData.completedRides}</div>
              <div className="text-sm text-muted-foreground">Viajes Completados</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{userData.cancelledRides}</div>
              <div className="text-sm text-muted-foreground">Viajes Cancelados</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {userData.averageRating ? userData.averageRating.toFixed(1) : 'N/A'}
              </div>
              <div className="text-sm text-muted-foreground">Calificación Promedio</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Wallet Information */}
      {userData.wallet && (
        <Card>
          <CardHeader>
            <CardTitle>Billetera</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  ${userData.wallet.balance ? userData.wallet.balance.toFixed(2) : '0.00'}
                </div>
                <div className="text-sm text-muted-foreground">Saldo Actual</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{userData.wallet.totalTransactions}</div>
                <div className="text-sm text-muted-foreground">Transacciones Totales</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Emergency Contacts */}
      {/* Note: Emergency contacts are not in current user schema */}

      {/* Recent Rides */}
      {/* Note: Recent rides are not in current user schema */}
    </div>
  );
}
