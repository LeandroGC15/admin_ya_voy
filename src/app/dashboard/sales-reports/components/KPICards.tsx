import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Minus,
  Car,
  Truck,
  Package,
  Receipt
} from 'lucide-react';
import { SalesReportSummary } from '@/features/sales-reports';

interface KPICardsProps {
  summary: SalesReportSummary;
}

export const KPICards: React.FC<KPICardsProps> = ({ summary }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const getTrendIcon = (growth: number) => {
    if (growth > 0) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (growth < 0) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-gray-600" />;
  };

  const getTrendVariant = (growth: number): "default" | "secondary" | "destructive" => {
    if (growth > 0) return 'default';
    if (growth < 0) return 'destructive';
    return 'secondary';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Revenue */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(summary.totalRevenue)}
          </div>
          <div className="flex items-center gap-2 mt-2">
            {getTrendIcon(summary.trendsAnalysis.growthRate)}
            <Badge variant={getTrendVariant(summary.trendsAnalysis.growthRate)} className="text-xs">
              {formatPercentage(summary.trendsAnalysis.growthRate)} vs período anterior
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Revenue Growth */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Crecimiento de Revenue</CardTitle>
          {getTrendIcon(summary.trendsAnalysis.growthRate)}
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${
            summary.trendsAnalysis.growthRate > 0 ? 'text-green-600' :
            summary.trendsAnalysis.growthRate < 0 ? 'text-red-600' : 'text-gray-600'
          }`}>
            {formatPercentage(summary.trendsAnalysis.growthRate)}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Comparado con el período anterior
          </p>
        </CardContent>
      </Card>

      {/* Average Revenue per Service */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Revenue Promedio</CardTitle>
          <Receipt className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(
              summary.totalRevenue /
              (summary.categoryBreakdown.services.reduce((sum, s) => sum + s.count, 0) || 1)
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Por servicio completado
          </p>
        </CardContent>
      </Card>

      {/* Services Breakdown */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Servicios Realizados</CardTitle>
          <div className="flex gap-1">
            <Car className="h-3 w-3 text-muted-foreground" />
            <Truck className="h-3 w-3 text-muted-foreground" />
            <Package className="h-3 w-3 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {summary.categoryBreakdown.services.reduce((sum, s) => sum + s.count, 0)}
          </div>
          <div className="flex gap-4 mt-2 text-xs">
            <div className="flex items-center gap-1">
              <Car className="h-3 w-3" />
              <span>{summary.categoryBreakdown.services.find(s => s.category === 'rides')?.count || 0}</span>
            </div>
            <div className="flex items-center gap-1">
              <Truck className="h-3 w-3" />
              <span>{summary.categoryBreakdown.services.find(s => s.category === 'deliveries')?.count || 0}</span>
            </div>
            <div className="flex items-center gap-1">
              <Package className="h-3 w-3" />
              <span>{(summary.categoryBreakdown.services.find(s => s.category === 'errands')?.count || 0) +
                     (summary.categoryBreakdown.services.find(s => s.category === 'parcels')?.count || 0)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Revenue by Service Type */}
      <Card className="md:col-span-2 lg:col-span-4">
        <CardHeader>
          <CardTitle className="text-lg">Revenue por Tipo de Servicio</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Car className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(summary.revenueSources.rides)}
              </div>
              <div className="text-sm text-gray-600">Viajes</div>
              <div className="text-xs text-gray-500">
                {summary.categoryBreakdown.services.find(s => s.category === 'rides')?.count || 0} servicios
              </div>
            </div>

            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Truck className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(summary.revenueSources.deliveries)}
              </div>
              <div className="text-sm text-gray-600">Deliveries</div>
              <div className="text-xs text-gray-500">
                {summary.categoryBreakdown.services.find(s => s.category === 'deliveries')?.count || 0} servicios
              </div>
            </div>

            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <Package className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <div className="text-2xl font-bold text-purple-600">
                {formatCurrency(summary.revenueSources.errands)}
              </div>
              <div className="text-sm text-gray-600">Mandados</div>
              <div className="text-xs text-gray-500">
                {summary.categoryBreakdown.services.find(s => s.category === 'errands')?.count || 0} servicios
              </div>
            </div>

            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <Package className="h-8 w-8 mx-auto mb-2 text-orange-600" />
              <div className="text-2xl font-bold text-orange-600">
                {formatCurrency(summary.revenueSources.parcels)}
              </div>
              <div className="text-sm text-gray-600">Paquetes</div>
              <div className="text-xs text-gray-500">
                {summary.categoryBreakdown.services.find(s => s.category === 'parcels')?.count || 0} servicios
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
