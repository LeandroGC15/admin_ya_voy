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

  // Handle loading state
  if (isLoading) {
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
        </div>

        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <RefreshCw className="mx-auto h-12 w-12 animate-spin text-gray-400" />
            <div className="space-y-2">
              <h3 className="text-lg font-medium text-gray-900">Cargando métricas...</h3>
              <p className="text-gray-500">Obteniendo datos del sistema</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Handle error state
  if (error) {
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
        </div>

        <div className="flex items-center justify-center py-12">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
                <div className="space-y-2">
                  <h3 className="text-lg font-medium text-gray-900">Error al cargar métricas</h3>
                  <p className="text-sm text-gray-500">
                    {error.message || 'Error desconocido al obtener los datos'}
                  </p>
                </div>
                <Button
                  onClick={() => refetch()}
                  disabled={isRefetching}
                  variant="outline"
                  className="w-full"
                >
                  {isRefetching ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Recargando...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Reintentar
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Handle no data state
  if (!metricsData) {
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
        </div>

        <div className="flex items-center justify-center py-12">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
                <div className="space-y-2">
                  <h3 className="text-lg font-medium text-gray-900">No hay datos disponibles</h3>
                  <p className="text-sm text-gray-500">
                    No se pudieron obtener las métricas del sistema
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

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
            <div className="text-2xl font-bold">{metricsData.totalUsers || 0}</div>
            <div className="flex gap-2 mt-2">
              <Badge variant="secondary" className="text-xs">
                <CheckCircle className="h-3 w-3 mr-1" />
                {metricsData.activeUsersToday || 0} activos hoy
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
            <div className="text-2xl font-bold">{(metricsData.onlineDrivers || 0) + (metricsData.availableDrivers || 0)}</div>
            <div className="flex gap-2 mt-2">
              <Badge variant="secondary" className="text-xs">
                <CheckCircle className="h-3 w-3 mr-1" />
                {metricsData.onlineDrivers || 0} en línea
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
            <div className="text-2xl font-bold">{(metricsData.completedRidesToday || 0) + (metricsData.activeRides || 0)}</div>
            <div className="flex gap-2 mt-2">
              <Badge variant="secondary" className="text-xs">
                <CheckCircle className="h-3 w-3 mr-1" />
                {metricsData.completedRidesToday || 0} completados
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
            <div className="text-2xl font-bold">${(metricsData.revenueToday || 0).toLocaleString()}</div>
            <div className="flex gap-2 mt-2">
              <Badge variant="secondary" className="text-xs">
                <TrendingUp className="h-3 w-3 mr-1" />
                +{((metricsData.revenueToday || 0) / (metricsData.revenueThisWeek || 1) * 100).toFixed(1)}% vs ayer
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
                <div className="text-2xl font-bold">{metricsData.totalUsers || 0}</div>
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
                <div className="text-2xl font-bold">{metricsData.activeUsersToday || 0}</div>
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
                <div className="text-2xl font-bold">{metricsData.newUsersThisWeek || 0}</div>
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
                <div className="text-2xl font-bold">{metricsData.averageUserRating?.toFixed(1) || 'N/A'}</div>
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
                <div className="text-2xl font-bold">{metricsData.onlineDrivers || 0}</div>
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
                <div className="text-2xl font-bold">{metricsData.busyDrivers || 0}</div>
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
                <div className="text-2xl font-bold">{metricsData.availableDrivers || 0}</div>
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
                <div className="text-2xl font-bold">{metricsData.averageDriverRating?.toFixed(1) || 'N/A'}</div>
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
                <div className="text-2xl font-bold">{metricsData.activeRides || 0}</div>
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
                <div className="text-2xl font-bold">{metricsData.completedRidesToday || 0}</div>
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
                <div className="text-2xl font-bold text-red-600">{metricsData.cancelledRidesToday || 0}</div>
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
                <div className="text-2xl font-bold">{metricsData.totalRidesThisWeek || 0}</div>
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
                <div className="text-2xl font-bold text-green-600">${(metricsData.revenueToday || 0).toLocaleString()}</div>
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
                <div className="text-2xl font-bold text-green-600">${(metricsData.revenueThisWeek || 0).toLocaleString()}</div>
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
                <div className="text-2xl font-bold">${(metricsData.averageFare || 0).toFixed(2)}</div>
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
                <div className="text-2xl font-bold">{metricsData.totalTransactions || 0}</div>
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
                  metricsData.systemStatus === 'healthy' ? 'text-green-600' :
                  metricsData.systemStatus === 'warning' ? 'text-yellow-600' :
                  metricsData.systemStatus === 'critical' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {metricsData.systemStatus === 'healthy' ? 'Saludable' :
                   metricsData.systemStatus === 'warning' ? 'Advertencia' :
                   metricsData.systemStatus === 'critical' ? 'Crítico' : 'Desconocido'}
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
                  {metricsData.lastUpdated ? new Date(metricsData.lastUpdated).toLocaleString() : 'N/A'}
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
                <div className="text-2xl font-bold">{metricsData.totalRidesThisWeek || 0}</div>
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
                  +{metricsData.newUsersThisWeek || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Nuevos usuarios/semana
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
};

export default MetricsPage;
