import { type LucideProps } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ComponentType<LucideProps>;
  change?: string;
  changeType?: 'increase' | 'decrease';
  backgroundImage?: string; // Nueva propiedad para la imagen de fondo
}

export default function StatCard({ title, value, icon: Icon, change, changeType, backgroundImage }: StatCardProps) {
  const backgroundStyle = backgroundImage ? { backgroundImage: `url(${backgroundImage})` } : {};
  const backgroundClasses = backgroundImage ? "bg-cover bg-center bg-no-repeat" : "";

  return (
    <div className={`rounded-lg border border-border bg-card p-6 shadow-sm ${backgroundClasses}`} style={backgroundStyle}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <Icon className="h-5 w-5 text-muted-foreground" />
      </div>
      <div className="mt-4">
        <h3 className="text-3xl font-bold text-foreground">{value}</h3>
        {change && (
          <p className={`mt-1 text-sm font-medium ${changeType === 'increase' ? 'text-green-500' : 'text-red-500'}`}>
            {change}
          </p>
        )}
      </div>
    </div>
  );
}
