import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus, Calendar } from 'lucide-react';

interface PeriodComparison {
  yearlyComparison: {
    current: number;
    previous: number;
    growth: number;
  };
  monthlyComparison: {
    current: number;
    previous: number;
    growth: number;
  };
}

interface PeriodComparisonTableProps {
  comparison: PeriodComparison;
}

export const PeriodComparisonTable: React.FC<PeriodComparisonTableProps> = ({ comparison }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
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

  const getTrendColor = (growth: number) => {
    if (growth > 0) return 'text-green-600';
    if (growth < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getBadgeVariant = (growth: number): "default" | "secondary" | "destructive" => {
    if (growth > 0) return 'default';
    if (growth < 0) return 'destructive';
    return 'secondary';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Comparación de Períodos
        </CardTitle>
        <CardDescription>
          Análisis comparativo entre períodos actuales y anteriores
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Yearly Comparison */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Comparación Anual</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Período</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-700">Revenue</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-700">Crecimiento</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-700">Tendencia</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="font-medium">Este Año</div>
                      <div className="text-sm text-gray-500">Período actual</div>
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-green-600">
                      {formatCurrency(comparison.yearlyComparison.current)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge variant={getBadgeVariant(comparison.yearlyComparison.growth)} className="font-medium">
                        {formatPercentage(comparison.yearlyComparison.growth)}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className={`flex items-center justify-center gap-1 ${getTrendColor(comparison.yearlyComparison.growth)}`}>
                        {getTrendIcon(comparison.yearlyComparison.growth)}
                        <span className="text-sm font-medium">
                          {comparison.yearlyComparison.growth > 0 ? 'Creciente' :
                           comparison.yearlyComparison.growth < 0 ? 'Decreciente' : 'Estable'}
                        </span>
                      </div>
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="font-medium">Año Anterior</div>
                      <div className="text-sm text-gray-500">Período comparable</div>
                    </td>
                    <td className="py-3 px-4 text-right text-gray-600">
                      {formatCurrency(comparison.yearlyComparison.previous)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {/* Empty for previous period */}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {/* Empty for previous period */}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Monthly Comparison */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Comparación Mensual</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Período</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-700">Revenue</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-700">Crecimiento</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-700">Tendencia</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="font-medium">Este Mes</div>
                      <div className="text-sm text-gray-500">Período actual</div>
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-green-600">
                      {formatCurrency(comparison.monthlyComparison.current)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge variant={getBadgeVariant(comparison.monthlyComparison.growth)} className="font-medium">
                        {formatPercentage(comparison.monthlyComparison.growth)}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className={`flex items-center justify-center gap-1 ${getTrendColor(comparison.monthlyComparison.growth)}`}>
                        {getTrendIcon(comparison.monthlyComparison.growth)}
                        <span className="text-sm font-medium">
                          {comparison.monthlyComparison.growth > 0 ? 'Creciente' :
                           comparison.monthlyComparison.growth < 0 ? 'Decreciente' : 'Estable'}
                        </span>
                      </div>
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="font-medium">Mes Anterior</div>
                      <div className="text-sm text-gray-500">Período comparable</div>
                    </td>
                    <td className="py-3 px-4 text-right text-gray-600">
                      {formatCurrency(comparison.monthlyComparison.previous)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {/* Empty for previous period */}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {/* Empty for previous period */}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Summary Insights */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-3">Insights del Período</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Mejor rendimiento:</span>
                  <span className="text-sm font-medium">
                    {comparison.yearlyComparison.growth > comparison.monthlyComparison.growth ? 'Anual' : 'Mensual'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Crecimiento promedio:</span>
                  <span className={`text-sm font-medium ${getTrendColor((comparison.yearlyComparison.growth + comparison.monthlyComparison.growth) / 2)}`}>
                    {formatPercentage((comparison.yearlyComparison.growth + comparison.monthlyComparison.growth) / 2)}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Revenue total período:</span>
                  <span className="text-sm font-bold text-green-600">
                    {formatCurrency(comparison.yearlyComparison.current + comparison.monthlyComparison.current)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Estabilidad:</span>
                  <Badge
                    variant={Math.abs(comparison.yearlyComparison.growth - comparison.monthlyComparison.growth) < 5 ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {Math.abs(comparison.yearlyComparison.growth - comparison.monthlyComparison.growth) < 5 ? 'Estable' : 'Variable'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
