'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { SalesReportChartData } from '@/features/sales-reports';

interface RevenueChartProps {
  data?: SalesReportChartData;
  title: string;
}

export const RevenueChart: React.FC<RevenueChartProps> = ({ data, title }) => {
  if (!data || !data.data || data.data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>No hay datos disponibles para mostrar</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px] text-gray-500">
            Sin datos de revenue por tiempo
          </div>
        </CardContent>
      </Card>
    );
  }

  // Transform data for the chart
  const chartData = data.data.map((item: any) => ({
    period: item.period,
    rides: item.rides || 0,
    deliveries: item.deliveries || 0,
    total: (item.rides || 0) + (item.deliveries || 0),
  }));

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium">{`Período: ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {`${entry.name}: ${formatCurrency(entry.value)}`}
            </p>
          ))}
          {payload.length > 1 && (
            <p className="text-sm font-medium border-t pt-1 mt-1">
              {`Total: ${formatCurrency(payload.reduce((sum: number, entry: any) => sum + entry.value, 0))}`}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {title}
        </CardTitle>
        <CardDescription>
          Evolución del revenue a lo largo del tiempo
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis
                dataKey="period"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => {
                  // Format period based on length (assuming date format)
                  if (value.length === 10) { // YYYY-MM-DD
                    return new Date(value).toLocaleDateString('es-ES', {
                      month: 'short',
                      day: 'numeric'
                    });
                  } else if (value.length === 7) { // YYYY-MM
                    return new Date(value + '-01').toLocaleDateString('es-ES', {
                      month: 'short',
                      year: '2-digit'
                    });
                  }
                  return value;
                }}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                tickFormatter={formatCurrency}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="rides"
                stroke="#3B82F6"
                strokeWidth={2}
                name="Viajes"
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="deliveries"
                stroke="#10B981"
                strokeWidth={2}
                name="Deliveries"
                dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="total"
                stroke="#8B5CF6"
                strokeWidth={3}
                strokeDasharray="5 5"
                name="Total"
                dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
