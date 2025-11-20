'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  BarChart3,
  Users,
  Car,
  DollarSign,
  TrendingUp,
  Truck,
  ShieldCheck,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { useDashboardMetrics, type DashboardMetrics } from '@/features/dashboard';
import Loader from '@/components/ui/loader';

const MetricsPage: React.FC = () => {
  const { status } = useSession();

  // Use TanStack Query hook for dashboard metrics
  const {
    data: metricsData,
    isLoading,
    error,
    refetch,
    isRefetching
  }: {
    data: DashboardMetrics | undefined;
    isLoading: boolean;
    error: Error | null;
    refetch: () => Promise<any>;
    isRefetching: boolean;
  } = useDashboardMetrics();

  // Handle main data loading error
  React.useEffect(() => {
    if (error) {
      console.error('Error loading dashboard metrics:', error);
    }
  }, [error]);

  // Handle unauthenticated state
  if (status === 'unauthenticated') {
    return (
      <div className="container mx-auto p-6 text-center text-red-500">
        No autenticado. Por favor inicia sesión.
      </div>
    );
  }



  // Default data when no data is available
  const defaultMetricsData: DashboardMetrics = {
    totalUsers: 0,
    activeUsersToday: 0,
    newUsersThisWeek: 0,
    averageUserRating: 0,
    onlineDrivers: 0,
    busyDrivers: 0,
    availableDrivers: 0,
    averageDriverRating: 0,
    activeRides: 0,
    completedRidesToday: 0,
    cancelledRidesToday: 0,
    totalRidesThisWeek: 0,
    revenueToday: 0,
    revenueThisWeek: 0,
    averageFare: 0,
    totalTransactions: 0,
    systemStatus: 'healthy',
    lastUpdated: new Date(),
  };
  

  const displayData = metricsData || defaultMetricsData;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="h-8 w-8" />
            Dashboard de Métricas
          </h1>
          <p className="text-gray-600 mt-1">
            Vista general de métricas y estadísticas del sistema
          </p>
        </div>
        <Button
          onClick={() => refetch()}
          disabled={isRefetching}
          variant="outline"
          size="sm"
        >
          {isRefetching ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Actualizando...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Actualizar
            </>
          )}
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{displayData.totalUsers || 0}</div>
            <div className="flex gap-2 mt-2">
              <Badge variant="secondary" className="text-xs">
                <CheckCircle className="h-3 w-3 mr-1" />
                {displayData.activeUsersToday || 0} activos hoy
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conductores Activos</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(displayData.onlineDrivers || 0) + (displayData.availableDrivers || 0)}</div>
            <div className="flex gap-2 mt-2">
              <Badge variant="secondary" className="text-xs">
                <CheckCircle className="h-3 w-3 mr-1" />
                {displayData.onlineDrivers || 0} en línea
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Viajes Hoy</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(displayData.completedRidesToday || 0) + (displayData.activeRides || 0)}</div>
            <div className="flex gap-2 mt-2">
              <Badge variant="secondary" className="text-xs">
                <CheckCircle className="h-3 w-3 mr-1" />
                {displayData.completedRidesToday || 0} completados
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Hoy</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(displayData.revenueToday || 0).toLocaleString()}</div>
            <div className="flex gap-2 mt-2">
              <Badge variant="secondary" className="text-xs">
                <TrendingUp className="h-3 w-3 mr-1" />
                +{((displayData.revenueToday || 0) / (displayData.revenueThisWeek || 1) * 100).toFixed(1)}% vs ayer
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Metrics Sections */}
      <div className="space-y-6">
        <section>
          <h2 className="text-xl font-bold mb-4 text-gray-900">Usuarios</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Total Registrados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{displayData.totalUsers || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Usuarios en el sistema
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Activos Hoy
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{displayData.activeUsersToday || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Usuarios activos
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Nuevos Esta Semana
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{displayData.newUsersThisWeek || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Registro semanal
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Rating Promedio
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{displayData.averageUserRating?.toFixed(1) || 'N/A'}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Calificación de usuarios
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4 text-gray-900">Conductores</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Truck className="h-4 w-4" />
                  En Línea
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{displayData.onlineDrivers || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Conductores conectados
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Car className="h-4 w-4" />
                  Ocupados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{displayData.busyDrivers || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  En viaje activo
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4" />
                  Disponibles
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{displayData.availableDrivers || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Listos para viaje
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Rating Promedio
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{displayData.averageDriverRating?.toFixed(1) || 'N/A'}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Calificación de conductores
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4 text-gray-900">Viajes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Truck className="h-4 w-4" />
                  Viajes Activos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{displayData.activeRides || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  En progreso
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Completados Hoy
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{displayData.completedRidesToday || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Finalizados exitosamente
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Cancelados Hoy
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{displayData.cancelledRidesToday || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Viajes cancelados
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Total Esta Semana
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{displayData.totalRidesThisWeek || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Viajes semanales
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Delivery section - Not implemented in backend yet */}
        {/* <section>
          <h2 className="text-2xl font-bold mb-4">Delivery</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <MetricCard title="Próximamente" value="--" icon={<ShoppingCart />} />
          </div>
        </section> */}

        <section>
          <h2 className="text-xl font-bold mb-4 text-gray-900">Finanzas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Ingresos Hoy
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">${(displayData.revenueToday || 0).toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Ingresos del día
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Ingresos Esta Semana
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">${(displayData.revenueThisWeek || 0).toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Total semanal
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Tarifa Promedio
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${(displayData.averageFare || 0).toFixed(2)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Por viaje completado
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Total Transacciones
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{displayData.totalTransactions || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Pagos procesados
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4 text-gray-900">Sistema</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4" />
                  Estado del Sistema
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${
                  displayData.systemStatus === 'healthy' ? 'text-green-600' :
                  displayData.systemStatus === 'warning' ? 'text-yellow-600' :
                  displayData.systemStatus === 'critical' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {displayData.systemStatus === 'healthy' ? 'Saludable' :
                   displayData.systemStatus === 'warning' ? 'Advertencia' :
                   displayData.systemStatus === 'critical' ? 'Crítico' : 'Desconocido'}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Estado operativo
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Última Actualización
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {displayData.lastUpdated ? new Date(displayData.lastUpdated).toLocaleString() : 'N/A'}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Datos más recientes
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Total Viajes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{displayData.totalRidesThisWeek || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Esta semana
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Crecimiento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  +{displayData.newUsersThisWeek || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Nuevos usuarios/semana
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>

      {/* Loader para estados de carga */}
      <Loader isVisible={isLoading} showBackground={true} />
    </div>
  );
};

export default MetricsPage;
