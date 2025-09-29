'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import MetricCard from '../../../components/MetricCard';
import { Users, Car, ShoppingCart, DollarSign, Bell, TrendingUp, Truck, CircleDollarSign, Home, ShieldCheck, RefreshCw } from 'lucide-react';
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
            <MetricCard title="Usuarios Activos" value={metricsData.activeUsers || 0} icon={<Users />} />
            <MetricCard title="Nuevos Hoy" value={metricsData.newUsersToday || 0} icon={<TrendingUp />} />
            <MetricCard title="Nuevos (Semana)" value={metricsData.newUsersThisWeek || 0} icon={<TrendingUp />} />
            <MetricCard title="Nuevos (Mes)" value={metricsData.newUsersThisMonth || 0} icon={<TrendingUp />} />
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Conductores</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <MetricCard title="Total de Conductores" value={metricsData.totalDrivers || 0} icon={<Car />} />
            <MetricCard title="Conductores en Línea" value={metricsData.onlineDrivers || 0} icon={<Truck />} />
            <MetricCard title="Verificaciones Pendientes" value={metricsData.pendingVerifications || 0} icon={<ShieldCheck />} />
            <MetricCard title="Conductores Aprobados" value={metricsData.approvedDrivers || 0} icon={<ShieldCheck />} />
            <MetricCard title="Conductores Suspendidos" value={metricsData.suspendedDrivers || 0} icon={<ShieldCheck />} />
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Viajes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <MetricCard title="Viajes Activos" value={metricsData.activeRides || 0} icon={<Truck />} />
            <MetricCard title="Completados Hoy" value={metricsData.completedRidesToday || 0} icon={<Truck />} />
            <MetricCard title="Cancelados Hoy" value={metricsData.cancelledRidesToday || 0} icon={<Truck />} />
            <MetricCard title="Completados (Semana)" value={metricsData.completedRidesThisWeek || 0} icon={<Truck />} />
            <MetricCard title="Viajes Totales" value={metricsData.totalRides || 0} icon={<Truck />} />
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Delivery</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <MetricCard title="Órdenes Activas" value={metricsData.activeOrders || 0} icon={<ShoppingCart />} />
            <MetricCard title="Entregadas Hoy" value={metricsData.completedOrdersToday || 0} icon={<ShoppingCart />} />
            <MetricCard title="Entregadas (Semana)" value={metricsData.completedOrdersThisWeek || 0} icon={<ShoppingCart />} />
            <MetricCard title="Órdenes Totales" value={metricsData.totalOrders || 0} icon={<ShoppingCart />} />
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Finanzas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <MetricCard title="Ingresos Totales" value={`$${(metricsData.totalRevenue || 0).toLocaleString()}`} icon={<DollarSign />} />
            <MetricCard title="Ingresos Hoy" value={`$${(metricsData.revenueToday || 0).toLocaleString()}`} icon={<DollarSign />} />
            <MetricCard title="Ingresos Semana" value={`$${(metricsData.revenueThisWeek || 0).toLocaleString()}`} icon={<DollarSign />} />
            <MetricCard title="Ingresos Mes" value={`$${(metricsData.revenueThisMonth || 0).toLocaleString()}`} icon={<DollarSign />} />
            <MetricCard title="Pagos Pendientes" value={`$${(metricsData.pendingPayments || 0).toLocaleString()}`} icon={<DollarSign />} />
            <MetricCard title="Saldo Carteras" value={`$${(metricsData.totalWalletBalance || 0).toLocaleString()}`} icon={<CircleDollarSign />} />
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Tiendas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <MetricCard title="Tiendas Totales" value={metricsData.totalStores || 0} icon={<Home />} />
            <MetricCard title="Tiendas Activas" value={metricsData.activeStores || 0} icon={<Home />} />
            <MetricCard title="Tiendas Pendientes" value={metricsData.pendingStores || 0} icon={<Home />} />
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Sistema</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <MetricCard title="Notificaciones Enviadas" value={metricsData.totalNotificationsSent || 0} icon={<Bell />} />
            <MetricCard title="Disponibilidad del Sistema" value={metricsData.systemUptime || 'N/A'} icon={<ShieldCheck />} />
          </div>
        </section>
      </div>
    </div>
  );
};

export default MetricsPage;
