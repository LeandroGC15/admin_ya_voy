'use client';
import StatCard from '@/components/StatCard';
import OverviewChart from '@/components/OverviewChart';
import RecentSales from '@/components/RecentSales';
import { DollarSign, Users, CreditCard, Activity } from 'lucide-react';
import TotalUsersCard from './components/TotalUsersCard';
import { useTheme } from '@/providers/theme-provider';

export default function DashboardPage() {
  const { theme } = useTheme();

  // Determinar los colores basados en el tema actual
  const axisColor = theme === 'dark' ? '#ffffff' : '#4B5563'; // Cambiado a gris para el modo claro
  const barColor = theme === 'dark' ? '#ffffff' : '#F59E0B'; // Cambiado a amarillo para el modo claro
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-foreground">
        Dashboard
      </h1>
      <p className="mt-2 text-lg text-muted-foreground">
        Welcome back, Admin! Here&apos;s a summary of your store.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Total Revenue"
          value="$45,231.89"
          icon={DollarSign}
          change="+20.1% from last month"
          changeType="increase"
          backgroundImage="/Gemini_Generated_Image_jpv41ejpv41ejpv4.png" // Asignar la imagen de fondo
        />
        <TotalUsersCard />
        <StatCard 
          title="Sales"
          value="+12,234"
          icon={CreditCard}
          change="+19% from last month"
          changeType="increase"
          backgroundImage="/fondosencillo.png" // Asignar la imagen de fondo
        />
        <StatCard 
          title="Active Now"
          value="+573"
          icon={Activity}
          change="+201 since last hour"
          changeType="increase"
          backgroundImage="/card2.png" // Asignar la imagen de fondo
        />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-12 lg:grid-cols-3 items-start">
        <div className="rounded-lg border border-border bg-card p-6 shadow-sm lg:col-span-2">
          <h3 className="text-lg font-semibold text-foreground">Overview</h3>
          <OverviewChart axisColor={axisColor} barColor={barColor} />
        </div>
        <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-foreground">Recent Sales</h3>
          <p className="text-sm text-muted-foreground">You made 265 sales this month.</p>
          <div className="mt-6 max-h-[250px] overflow-y-auto">
            <RecentSales />
          </div>
        </div>
      </div>
    </div>
  );
}
