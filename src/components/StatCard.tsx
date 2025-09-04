import { type LucideProps } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ComponentType<LucideProps>;
  change?: string;
  changeType?: 'increase' | 'decrease';
}

export default function StatCard({ title, value, icon: Icon, change, changeType }: StatCardProps) {
  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
        <Icon className="h-5 w-5 text-gray-400" />
      </div>
      <div className="mt-4">
        <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{value}</h3>
        {change && (
          <p className={`mt-1 text-sm font-medium ${changeType === 'increase' ? 'text-green-500' : 'text-red-500'}`}>
            {change}
          </p>
        )}
      </div>
    </div>
  );
}
