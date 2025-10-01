'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import MetricCard from '../../../components/MetricCard';
import { Users, Car, DollarSign, Bell, TrendingUp, Truck, ShieldCheck, RefreshCw } from 'lucide-react';
import { useDashboardMetrics, type DashboardMetrics } from '@/features/dashboard';
import { Button } from '@/components/ui/button';

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
      <div className="container mx-auto py-8 text-center text-red-500">
        No autenticado. Por favor inicia sesión.
      </div>
    );
  }

  // Handle loading state
  if (isLoading) {
    return (
      <div className="container mx-auto py-8 text-center text-gray-500">
        <RefreshCw className="mx-auto h-8 w-8 animate-spin mb-4" />
        Cargando métricas...
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="container mx-auto py-8 text-center space-y-4">
        <div className="text-red-500">
          Error al cargar métricas: {error.message || 'Error desconocido'}
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
    );
  }

  // Handle no data state
  if (!metricsData) {
    return (
      <div className="container mx-auto py-8 text-center text-gray-500">
        No hay datos de métricas disponibles.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard de Métricas</h1>
          <p className="text-muted-foreground">
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

      {/* Metrics Sections */}
      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-bold mb-4">Usuarios</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <MetricCard title="Total de Usuarios" value={metricsData.totalUsers || 0} icon={<Users />} />
            <MetricCard title="Usuarios Activos Hoy" value={metricsData.activeUsersToday || 0} icon={<Users />} />
            <MetricCard title="Nuevos (Semana)" value={metricsData.newUsersThisWeek || 0} icon={<TrendingUp />} />
            <MetricCard title="Rating Promedio" value={`${metricsData.averageUserRating?.toFixed(1) || 0}/5`} icon={<TrendingUp />} />
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Conductores</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <MetricCard title="Conductores en Línea" value={metricsData.onlineDrivers || 0} icon={<Truck />} />
            <MetricCard title="Conductores Ocupados" value={metricsData.busyDrivers || 0} icon={<Car />} />
            <MetricCard title="Conductores Disponibles" value={metricsData.availableDrivers || 0} icon={<ShieldCheck />} />
            <MetricCard title="Rating Promedio" value={`${metricsData.averageDriverRating?.toFixed(1) || 0}/5`} icon={<TrendingUp />} />
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Viajes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <MetricCard title="Viajes Activos" value={metricsData.activeRides || 0} icon={<Truck />} />
            <MetricCard title="Completados Hoy" value={metricsData.completedRidesToday || 0} icon={<Truck />} />
            <MetricCard title="Cancelados Hoy" value={metricsData.cancelledRidesToday || 0} icon={<Truck />} />
            <MetricCard title="Total (Semana)" value={metricsData.totalRidesThisWeek || 0} icon={<Truck />} />
            <MetricCard title="Total Transacciones" value={metricsData.totalTransactions || 0} icon={<TrendingUp />} />
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
          <h2 className="text-2xl font-bold mb-4">Finanzas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <MetricCard title="Ingresos Hoy" value={`$${(metricsData.revenueToday || 0).toLocaleString()}`} icon={<DollarSign />} />
            <MetricCard title="Ingresos Semana" value={`$${(metricsData.revenueThisWeek || 0).toLocaleString()}`} icon={<DollarSign />} />
            <MetricCard title="Tarifa Promedio" value={`$${(metricsData.averageFare || 0).toFixed(2)}`} icon={<DollarSign />} />
            <MetricCard title="Total Transacciones" value={metricsData.totalTransactions || 0} icon={<TrendingUp />} />
          </div>
        </section>

        {/* Stores section - Not implemented in backend yet */}
        {/* <section>
          <h2 className="text-2xl font-bold mb-4">Tiendas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <MetricCard title="Próximamente" value="--" icon={<Home />} />
          </div>
        </section> */}

        <section>
          <h2 className="text-2xl font-bold mb-4">Sistema</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <MetricCard
              title="Estado del Sistema"
              value={metricsData.systemStatus === 'healthy' ? 'Saludable' :
                     metricsData.systemStatus === 'warning' ? 'Advertencia' :
                     metricsData.systemStatus === 'critical' ? 'Crítico' : 'Desconocido'}
              icon={<ShieldCheck />}
            />
            <MetricCard
              title="Última Actualización"
              value={metricsData.lastUpdated ? new Date(metricsData.lastUpdated).toLocaleString() : 'N/A'}
              icon={<TrendingUp />}
            />
          </div>
        </section>
      </div>
    </div>
  );
};

export default MetricsPage;
