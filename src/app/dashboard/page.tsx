import StatCard from '@/components/StatCard';
import OverviewChart from '@/components/OverviewChart';
import RecentSales from '@/components/RecentSales';
import { DollarSign, Users, CreditCard, Activity } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
        Dashboard
      </h1>
      <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
        Welcome back, Admin! Here's a summary of your store.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Total Revenue"
          value="$45,231.89"
          icon={DollarSign}
          change="+20.1% from last month"
          changeType="increase"
        />
        <StatCard 
          title="Subscriptions"
          value="+2350"
          icon={Users}
          change="+180.1% from last month"
          changeType="increase"
        />
        <StatCard 
          title="Sales"
          value="+12,234"
          icon={CreditCard}
          change="+19% from last month"
          changeType="increase"
        />
        <StatCard 
          title="Active Now"
          value="+573"
          icon={Activity}
          change="+201 since last hour"
          changeType="increase"
        />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-lg border bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Overview</h3>
          <OverviewChart />
        </div>
        <div className="rounded-lg border bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Sales</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">You made 265 sales this month.</p>
          <div className="mt-6">
            <RecentSales />
          </div>
        </div>
      </div>
    </div>
  );
}
