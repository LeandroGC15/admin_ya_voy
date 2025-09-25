'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import MetricCard from '../../../components/MetricCard';
import { Users, Car, ShoppingCart, DollarSign, Bell, TrendingUp, Truck, CircleDollarSign, Home, ShieldCheck } from 'lucide-react';
import { api } from '../../../lib/api/api-client';
import { MetricsData } from '../../../interfaces/MetricsResponse';

interface MetricCardData {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  backgroundImage?: string;
}

const MetricsPage: React.FC = () => {
  const { data: session, status } = useSession();
  const [metricsData, setMetricsData] = useState<MetricsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
useEffect(() => {
  const fetchMetrics = async () => {
    if (!session?.accessToken) {
      setError('No hay token de sesión válido.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
  const response = await api.get<MetricsData>(
    '/admin/dashboard/metrics',
    { headers: { Authorization: `Bearer ${session.accessToken}` } }
  );

  console.log(response)
if (response) {
  setMetricsData(response); // <-- Esto ya es MetricsData
} else {
  console.warn('Respuesta inesperada de la API:', response);
  setError('La API no devolvió datos válidos.');
}
} catch (err: unknown) {
  console.error('Error fetching metrics:', err);
  const errorMessage =
    err instanceof Error ? err.message : typeof err === 'string' ? err : 'Error desconocido';
  setError(`Error al cargar métricas: ${errorMessage}`);
} finally {
  setLoading(false);
}
  };

  console.log(metricsData);
  if (status === 'authenticated') fetchMetrics();
  else if (status === 'unauthenticated') {
    setError('No autenticado. Por favor inicia sesión.');
    setLoading(false);
  }
}, [session, status]);

  if (loading) return <div className="container mx-auto py-8 text-center text-gray-500">Cargando métricas...</div>;
  if (error) return <div className="container mx-auto py-8 text-center text-red-500">{error}</div>;
  if (!metricsData) return <div className="container mx-auto py-8 text-center text-gray-500">No hay datos de métricas disponibles.</div>;

  const mappedMetrics: MetricCardData[] = [
    { title: 'Total de Usuarios', value: metricsData.totalUsers, icon: <Users /> },
    { title: 'Usuarios Activos', value: metricsData.activeUsers, icon: <Users /> },
    { title: 'Nuevos Hoy', value: metricsData.newUsersToday, icon: <TrendingUp /> },
    { title: 'Total de Conductores', value: metricsData.totalDrivers, icon: <Car /> },
    { title: 'Conductores en Línea', value: metricsData.onlineDrivers, icon: <Truck /> },
    { title: 'Viajes Totales', value: metricsData.totalRides, icon: <Truck /> },
    { title: 'Órdenes Totales', value: metricsData.totalOrders, icon: <ShoppingCart /> },
    { title: 'Ingresos Totales', value: `$${metricsData.totalRevenue.toLocaleString()}`, icon: <DollarSign /> },
    { title: 'Saldo Carteras', value: `$${metricsData.totalWalletBalance.toLocaleString()}`, icon: <CircleDollarSign /> },
    { title: 'Tiendas Activas', value: metricsData.activeStores, icon: <Home /> },
    { title: 'Notificaciones Enviadas', value: metricsData.totalNotificationsSent, icon: <Bell /> },
    { title: 'Disponibilidad del Sistema', value: metricsData.systemUptime, icon: <ShieldCheck /> },
  ];

  return (
    <div className="container mx-auto py-8 px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {mappedMetrics.map((metric, idx) => (
        <MetricCard
          key={idx}
          title={metric.title}
          value={metric.value}
          icon={metric.icon}
          backgroundImage={metric.backgroundImage}
        />
      ))}
    </div>
  );
};

export default MetricsPage;
