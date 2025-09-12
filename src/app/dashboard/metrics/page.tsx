'use client';

import React, { useEffect, useState } from 'react';
import MetricCard from '../../../components/MetricCard';
import { Users, Car, ShoppingCart, DollarSign, Package, Bell, Server, TrendingUp, Handshake, ShieldCheck, Clock, XCircle, Home, Truck, CircleDollarSign } from 'lucide-react';
import { api } from '../../../lib/api/api-client'; // Importa la instancia de ApiClient
import { MetricsResponse } from '../../../interfaces/MetricsResponse'; // Importa la interfaz

interface MetricCardData {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  backgroundImage?: string; // Hacemos que backgroundImage sea opcional
}

const MetricsPage = () => {
  const [metricsData, setMetricsData] = useState<MetricsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await api.get<MetricsResponse>('/admin/dashboard/metrics');
        setMetricsData(data);
      } catch (err) {
        console.error("Error fetching metrics:", err);
        setError('Error al cargar las métricas. Por favor, inténtelo de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  // Mapeo de los datos de la API a la estructura que espera MetricCard
  const mappedMetrics = metricsData ? {
    users: [
      { title: "Total de Usuarios", value: metricsData.totalUsers, icon: <Users size={24}/>, backgroundImage: '/metricasusuarios.png' },
      { title: "Usuarios Activos", value: metricsData.activeUsers, icon: <Users size={24} />, backgroundImage: '/metricasusuarios.png' },
      { title: "Nuevos Hoy", value: metricsData.newUsersToday, icon: <TrendingUp size={24} />, backgroundImage: '/metricasusuarios.png' },
      { title: "Nuevos Esta Semana", value: metricsData.newUsersThisWeek, icon: <TrendingUp size={24} />, backgroundImage: '/metricasusuarios.png' },
      { title: "Nuevos Este Mes", value: metricsData.newUsersThisMonth, icon: <TrendingUp size={24} />, backgroundImage: '/metricasusuarios.png' },
    ],
    drivers: [
      { title: "Total de Conductores", value: metricsData.totalDrivers, icon: <Car size={24} />, backgroundImage: '/MetricasConductores.png' },
      { title: "Conductores en Línea", value: metricsData.onlineDrivers, icon: <Truck size={24} />, backgroundImage: '/MetricasConductores.png' },
      { title: "Verificaciones Pendientes", value: metricsData.pendingVerifications, icon: <Handshake size={24} />, backgroundImage: '/MetricasConductores.png' },
      { title: "Conductores Aprobados", value: metricsData.approvedDrivers, icon: <ShieldCheck size={24} />, backgroundImage: '/MetricasConductores.png' },
      { title: "Conductores Suspendidos", value: metricsData.suspendedDrivers, icon: <XCircle size={24} />, backgroundImage: '/MetricasConductores.png' },
    ],
    rides: [
      { title: "Viajes Activos", value: metricsData.activeRides, icon: <Car size={24} />, backgroundImage: '/metricasviajes.png' },
      { title: "Completados Hoy", value: metricsData.completedRidesToday, icon: <CircleDollarSign size={24} />, backgroundImage: '/metricasviajes.png' },
      { title: "Cancelados Hoy", value: metricsData.cancelledRidesToday, icon: <XCircle size={24} />, backgroundImage: '/metricasviajes.png' },
      { title: "Completados Esta Semana", value: metricsData.completedRidesThisWeek, icon: <CircleDollarSign size={24} />, backgroundImage: '/metricasviajes.png' },
      { title: "Total de Viajes", value: metricsData.totalRides, icon: <Car size={24} />, backgroundImage: '/metricasviajes.png' },
    ],
    deliveryOrders: [
      { title: "Órdenes en Tránsito", value: metricsData.activeOrders, icon: <ShoppingCart size={24} />, backgroundImage: '/metricasntrega.png' },
      { title: "Entregadas Hoy", value: metricsData.completedOrdersToday, icon: <ShoppingCart size={24} />, backgroundImage: '/metricasntrega.png' },
      { title: "Entregadas Esta Semana", value: metricsData.completedOrdersThisWeek, icon: <ShoppingCart size={24} />, backgroundImage: '/metricasntrega.png' },
      { title: "Total de Órdenes", value: metricsData.totalOrders, icon: <ShoppingCart size={24} />, backgroundImage: '/metricasntrega.png' },
    ],
    financial: [
      { title: "Ingresos Totales", value: `$${metricsData.totalRevenue.toLocaleString()}`, icon: <DollarSign size={24} />, backgroundImage: '/metricasfinancieras.png' },
      { title: "Ingresos Hoy", value: `$${metricsData.revenueToday.toLocaleString()}`, icon: <DollarSign size={24} />, backgroundImage: '/metricasfinancieras.png' },
      { title: "Ingresos Esta Semana", value: `$${metricsData.revenueThisWeek.toLocaleString()}`, icon: <DollarSign size={24} />, backgroundImage: '/metricasfinancieras.png' },
      { title: "Ingresos Este Mes", value: `$${metricsData.revenueThisMonth.toLocaleString()}`, icon: <DollarSign size={24} />, backgroundImage: '/metricasfinancieras.png' },
      { title: "Pagos Pendientes", value: `$${metricsData.pendingPayments.toLocaleString()}`, icon: <DollarSign size={24} />, backgroundImage: '/metricasfinancieras.png' },
      { title: "Saldo Total Carteras", value: `$${metricsData.totalWalletBalance.toLocaleString()}`, icon: <DollarSign size={24} />, backgroundImage: '/metricasfinancieras.png' },
    ],
    stores: [
      { title: "Total de Tiendas", value: metricsData.totalStores, icon: <Home size={24} />, backgroundImage: '/metricastiendas.png' },
      { title: "Tiendas Activas", value: metricsData.activeStores, icon: <Home size={24} />, backgroundImage: '/metricastiendas.png' },
      { title: "Tiendas Pendientes", value: metricsData.pendingStores, icon: <Home size={24} />, backgroundImage: '/metricastiendas.png' },
    ],
    system: [
      { title: "Notificaciones Enviadas", value: metricsData.totalNotificationsSent.toLocaleString(), icon: <Bell size={24} />, backgroundImage: '/metricassistema.png' },
      { title: "Tiempo de Actividad", value: metricsData.systemUptime, icon: <Clock size={24} />, backgroundImage: '/metricassistema.png' },
    ],
  } : null;

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 text-center text-gray-500 dark:text-gray-400">
        Cargando métricas...
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4 text-center text-red-500 dark:text-red-400">
        {error}
      </div>
    );
  }

  if (!mappedMetrics) {
    return (
      <div className="container mx-auto py-8 px-4 text-center text-gray-500 dark:text-gray-400">
        No hay datos de métricas disponibles.
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-[#4b5563]">Métricas del Sistema</h1>

      {Object.entries(mappedMetrics).map(([category, cards]) => (
        <section key={category} className="mb-10">
          <h2 className="text-2xl font-semibold mb-6 capitalize text-gray-900 dark:text-[#4b5563]">
            {category === 'users' && 'Métricas de Usuarios'}
            {category === 'drivers' && 'Métricas de Conductores'}
            {category === 'rides' && 'Métricas de Viajes'}
            {category === 'deliveryOrders' && 'Métricas de Órdenes de Entrega'}
            {category === 'financial' && 'Métricas Financieras'}
            {category === 'stores' && 'Métricas de Tiendas'}
            {category === 'system' && 'Métricas del Sistema'}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {cards.map((metric: MetricCardData, index) => (
              <MetricCard key={index} title={metric.title} value={metric.value} icon={metric.icon} backgroundImage={metric.backgroundImage} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
};

export default MetricsPage;
