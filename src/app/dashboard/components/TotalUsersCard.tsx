'use client';

import StatCard from '@/components/StatCard';
import { Users } from 'lucide-react';
import { useUserStats } from '@/features/users/hooks';


export default function TotalUsersCard() {
  const { data: userStats, isLoading, error } = useUserStats();

  const getDisplayValue = () => {
    if (isLoading) return "Cargando...";
    if (error) return "Error";
    return userStats?.total !== undefined ? `+${userStats.total}` : "N/A";
  };

  return (
    <StatCard
      title="Subscriptions"
      value={getDisplayValue()}
      icon={Users}
      change="+180.1% from last month"
      changeType="increase"
      backgroundImage="/fondo.png" // Asignar la imagen de fondo a TotalUsersCard
    />
  );
}
