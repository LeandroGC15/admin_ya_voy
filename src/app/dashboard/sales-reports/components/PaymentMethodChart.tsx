'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import type { SalesReportChartData } from '@/features/sales-reports';

// Colors for different payment methods
const PAYMENT_METHOD_COLORS = {
  cash: '#10B981', // green
  card: '#3B82F6', // blue
  wallet: '#8B5CF6', // purple
  transfer: '#F59E0B', // yellow
  pago_movil: '#EF4444', // red
  zelle: '#06B6D4', // cyan
  bitcoin: '#F97316', // orange
  default: '#6B7280', // gray
};

interface PaymentMethodChartProps {
  data?: SalesReportChartData;
  title: string;
}

export const PaymentMethodChart: React.FC<PaymentMethodChartProps> = ({ data, title }) => {
  if (!data || !data.data || data.data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>No hay datos disponibles para mostrar</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px] text-gray-500">
            Sin datos de métodos de pago
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
          <p className="font-medium">{`Método: ${data.payload.name}`}</p>
          <p className="text-sm text-blue-600">
            {`Monto: ${formatCurrency(data.value)}`}
          </p>
          <p className="text-sm text-gray-600">
            {`Transacciones: ${data.payload.count || 0}`}
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
      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm text-gray-600">{entry.value}</span>
          </div>
        ))}
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
          Distribución del revenue por método de pago
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="40%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ percentage }) => `${percentage.toFixed(1)}%`}
                labelLine={false}
              >
                {chartData.map((entry: any, index: number) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={PAYMENT_METHOD_COLORS[entry.name as keyof typeof PAYMENT_METHOD_COLORS] || PAYMENT_METHOD_COLORS.default}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend content={<CustomLegend />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Summary Table */}
        <div className="mt-6">
          <h4 className="text-sm font-medium mb-3 text-gray-900">Resumen por Método</h4>
          <div className="space-y-2">
            {chartData.map((item: any, index: number) => (
              <div key={index} className="flex justify-between items-center py-1">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{
                      backgroundColor: PAYMENT_METHOD_COLORS[item.name as keyof typeof PAYMENT_METHOD_COLORS] || PAYMENT_METHOD_COLORS.default
                    }}
                  />
                  <span className="text-sm font-medium capitalize">{item.name}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold">{formatCurrency(item.value)}</div>
                  <div className="text-xs text-gray-500">{item.count || 0} transacciones</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
