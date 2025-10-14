'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Car, Truck, Package, Receipt } from 'lucide-react';
import type { SalesReportChartData } from '@/features/sales-reports';

// Colors for different service categories
const CATEGORY_COLORS = {
  rides: '#3B82F6', // blue
  deliveries: '#10B981', // green
  errands: '#8B5CF6', // purple
  parcels: '#F59E0B', // yellow
  default: '#6B7280', // gray
};

const CATEGORY_ICONS = {
  rides: Car,
  deliveries: Truck,
  errands: Package,
  parcels: Package,
  default: Receipt,
};

interface CategoryBreakdownChartProps {
  data?: SalesReportChartData;
  title: string;
}

export const CategoryBreakdownChart: React.FC<CategoryBreakdownChartProps> = ({ data, title }) => {
  if (!data || !data.data || data.data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>No hay datos disponibles para mostrar</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px] text-gray-500">
            Sin datos de categorías de servicio
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium">{`Categoría: ${data.payload.name}`}</p>
          <p className="text-sm text-blue-600">
            {`Revenue: ${formatCurrency(data.value)}`}
          </p>
          <p className="text-sm text-gray-500">
            {`${data.payload.percentage?.toFixed(1) || 0}% del total`}
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }: any) => {
    return (
      <div className="grid grid-cols-2 gap-4 mt-4">
        {payload.map((entry: any, index: number) => {
          const IconComponent = CATEGORY_ICONS[entry.payload.name as keyof typeof CATEGORY_ICONS] || CATEGORY_ICONS.default;
          return (
            <div key={index} className="flex items-center gap-2">
              <IconComponent className="h-4 w-4" style={{ color: entry.color }} />
              <div className="flex-1">
                <div className="text-sm font-medium capitalize">{entry.value}</div>
                <div className="text-xs text-gray-500">
                  {formatCurrency(entry.payload.value)} ({entry.payload.percentage?.toFixed(1) || 0}%)
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Calculate percentages and prepare data
  const totalAmount = data.data.reduce((sum: number, item: any) => sum + item.value, 0);
  const chartData = data.data.map((item: any) => ({
    ...item,
    percentage: totalAmount > 0 ? (item.value / totalAmount) * 100 : 0,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {title}
        </CardTitle>
        <CardDescription>
          Distribución del revenue por tipo de servicio
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="45%"
                innerRadius={60}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                stroke="none"
              >
                {chartData.map((entry: any, index: number) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={CATEGORY_COLORS[entry.name as keyof typeof CATEGORY_COLORS] || CATEGORY_COLORS.default}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend content={<CustomLegend />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Summary Stats */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {chartData.map((item: any, index: number) => {
            const IconComponent = CATEGORY_ICONS[item.name as keyof typeof CATEGORY_ICONS] || CATEGORY_ICONS.default;
            return (
              <div key={index} className="text-center p-3 bg-gray-50 rounded-lg">
                <IconComponent
                  className="h-6 w-6 mx-auto mb-2"
                  style={{
                    color: CATEGORY_COLORS[item.name as keyof typeof CATEGORY_COLORS] || CATEGORY_COLORS.default
                  }}
                />
                <div className="text-lg font-bold" style={{
                  color: CATEGORY_COLORS[item.name as keyof typeof CATEGORY_COLORS] || CATEGORY_COLORS.default
                }}>
                  {item.percentage.toFixed(1)}%
                </div>
                <div className="text-xs text-gray-600 capitalize">{item.name}</div>
                <div className="text-xs text-gray-500 font-medium">
                  {formatCurrency(item.value)}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
