'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  TrendingUp,
  TrendingDown,
  RefreshCw,
  AlertTriangle,
  Filter,
  BarChart3,
  Download,
  ChevronDown,
  FileText,
  FileSpreadsheet,
  File
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useSalesReport, exportReport, type SalesReportFilters, type ExportFormat, type SalesReportData } from '@/features/sales-reports';
import { RevenueChart } from './components/RevenueChart';
import { PaymentMethodChart } from './components/PaymentMethodChart';
import { CategoryBreakdownChart } from './components/CategoryBreakdownChart';
import { PeriodComparisonTable } from './components/PeriodComparisonTable';
import { KPICards } from './components/KPICards';
import Loader from '@/components/ui/loader';

const SalesReportsPage: React.FC = () => {
  const [filters, setFilters] = useState<SalesReportFilters>({
    period: 'month',
    groupBy: 'day',
  });
  const [isExporting, setIsExporting] = useState(false);

  // Fetch sales report data
  const {
    data: salesData,
    isLoading,
    error,
    refetch,
    isRefetching
  } = useSalesReport(filters);

  // Handle filter changes
  const handleFilterChange = (newFilters: Partial<SalesReportFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  // Handle refresh
  const handleRefresh = () => {
    refetch();
  };

  // Handle export with format selection
  const handleExport = async (format: ExportFormat) => {
    if (!displayData) return;

    setIsExporting(true);
    try {
      await exportReport({
        format,
        filters,
      });
      // Could add toast notification here for success
    } catch (error) {
      console.error('Export failed:', error);
      // Could add toast notification here for error
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      alert(`Error al exportar: ${errorMessage}`);
    } finally {
      setIsExporting(false);
    }
  };



  // Default data when no data is available
  const defaultSalesData: SalesReportData = {
    summary: {
      totalRevenue: 0,
      revenueSources: {
        rides: 0,
        deliveries: 0,
        errands: 0,
        parcels: 0,
      },
      revenueByPaymentMethod: {},
      revenueByTier: [],
      revenueByZone: [],
      revenueByTimePeriod: {
        rides: [],
        deliveries: [],
      },
      trendsAnalysis: {
        currentPeriodRevenue: 0,
        previousPeriodRevenue: 0,
        growthRate: 0,
        trend: 'stable',
      },
      categoryBreakdown: {
        services: [],
        discounts: { total: 0, count: 0 },
        taxesAndFees: {
          estimatedTaxes: 0,
          platformFees: 0,
        },
      },
      periodComparison: {
        yearlyComparison: {
          current: 0,
          previous: 0,
          growth: 0,
        },
        monthlyComparison: {
          current: 0,
          previous: 0,
          growth: 0,
        },
      },
    },
    chartData: [],
    details: [],
    metadata: {
      generatedAt: new Date().toISOString(),
      filters: {},
      totalRecords: 0,
      executionTime: 0,
    },
  };

  const displayData = salesData || defaultSalesData;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="h-8 w-8" />
            Reporte de Ventas
          </h1>
          <p className="text-gray-600 mt-1">
            Análisis detallado de ingresos y métricas financieras
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleRefresh}
            disabled={isRefetching}
            variant="outline"
            size="sm"
          >
            {isRefetching ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Actualizando...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Actualizar
              </>
            )}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                disabled={!displayData || isExporting}
              >
                {isExporting ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Exportando...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Exportar
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => handleExport('csv')}
                disabled={isExporting}
              >
                <FileText className="mr-2 h-4 w-4" />
                Exportar como CSV
                <span className="ml-auto text-xs text-gray-500">Texto</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleExport('excel')}
                disabled={isExporting}
              >
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Exportar como Excel
                <span className="ml-auto text-xs text-gray-500">Hojas múltiples</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleExport('pdf')}
                disabled={isExporting}
              >
                <File className="mr-2 h-4 w-4" />
                Exportar como PDF
                <span className="ml-auto text-xs text-gray-500">Profesional</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
          <CardDescription>
            Configura el período y agrupación para el análisis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Período:</label>
              <select
                value={filters.period || 'month'}
                onChange={(e) => handleFilterChange({ period: e.target.value as any })}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm"
              >
                <option value="today">Hoy</option>
                <option value="yesterday">Ayer</option>
                <option value="week">Esta semana</option>
                <option value="month">Este mes</option>
                <option value="quarter">Este trimestre</option>
                <option value="year">Este año</option>
                <option value="custom">Personalizado</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Agrupar por:</label>
              <select
                value={filters.groupBy || 'day'}
                onChange={(e) => handleFilterChange({ groupBy: e.target.value as any })}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm"
              >
                <option value="day">Día</option>
                <option value="week">Semana</option>
                <option value="month">Mes</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <KPICards summary={displayData.summary} />

      {/* Charts and Tables */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Vista General</TabsTrigger>
          <TabsTrigger value="charts">Gráficos</TabsTrigger>
          <TabsTrigger value="breakdown">Desglose</TabsTrigger>
          <TabsTrigger value="comparison">Comparación</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RevenueChart
              data={displayData.chartData.find(c => c.type === 'line')}
              title="Revenue por Tiempo"
            />
            <PaymentMethodChart
              data={displayData.chartData.find(c => c.type === 'pie')}
              title="Revenue por Método de Pago"
            />
          </div>
        </TabsContent>

        <TabsContent value="charts" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RevenueChart
              data={displayData.chartData.find(c => c.type === 'line')}
              title="Revenue por Tiempo"
            />
            <PaymentMethodChart
              data={displayData.chartData.find(c => c.type === 'pie')}
              title="Revenue por Método de Pago"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CategoryBreakdownChart
              data={displayData.chartData.find(c => c.type === 'doughnut')}
              title="Revenue por Tipo de Servicio"
            />
            <Card>
              <CardHeader>
                <CardTitle>Revenue por Tier de Servicio</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {displayData.summary.revenueByTier.map((tier, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm font-medium">{tier.tier_name}</span>
                      <div className="text-right">
                        <div className="text-sm font-bold">${tier.revenue.toFixed(2)}</div>
                        <div className="text-xs text-gray-500">{tier.ride_count} viajes</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="breakdown" className="space-y-6">
          <CategoryBreakdownChart
            data={displayData.chartData.find(c => c.type === 'doughnut')}
            title="Revenue por Tipo de Servicio"
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue por Zona Geográfica</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {displayData.summary.revenueByZone.map((zone, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm font-medium">{zone.zone}</span>
                      <div className="text-right">
                        <div className="text-sm font-bold">${zone.revenue.toFixed(2)}</div>
                        <div className="text-xs text-gray-500">{zone.count} servicios</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Desglose por Categorías</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Servicios</span>
                    <span className="text-sm font-bold">
                      ${(displayData.summary.categoryBreakdown.services.reduce((sum, s) => sum + s.revenue, 0)).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Descuentos</span>
                    <span className="text-sm font-bold text-red-600">
                      -${displayData.summary.categoryBreakdown.discounts.total.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Impuestos Estimados</span>
                    <span className="text-sm font-bold">
                      ${displayData.summary.categoryBreakdown.taxesAndFees.estimatedTaxes.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center border-t pt-2">
                    <span className="text-sm font-bold">Total Neto</span>
                    <span className="text-sm font-bold text-green-600">
                      ${displayData.summary.totalRevenue.toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-6">
          <PeriodComparisonTable comparison={displayData.summary.periodComparison} />

          <Card>
            <CardHeader>
              <CardTitle>Análisis de Tendencias</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Revenue Período Actual</span>
                  <span className="text-sm font-bold">${displayData.summary.trendsAnalysis.currentPeriodRevenue.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Revenue Período Anterior</span>
                  <span className="text-sm font-bold">${displayData.summary.trendsAnalysis.previousPeriodRevenue.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Tasa de Crecimiento</span>
                  <Badge variant={displayData.summary.trendsAnalysis.growthRate >= 0 ? "default" : "destructive"}>
                    {displayData.summary.trendsAnalysis.growthRate >= 0 ? (
                      <TrendingUp className="h-3 w-3 mr-1" />
                    ) : (
                      <TrendingDown className="h-3 w-3 mr-1" />
                    )}
                    {displayData.summary.trendsAnalysis.growthRate.toFixed(2)}%
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Tendencia</span>
                  <Badge variant={
                    displayData.summary.trendsAnalysis.trend === 'increasing' ? 'default' :
                    displayData.summary.trendsAnalysis.trend === 'decreasing' ? 'destructive' : 'secondary'
                  }>
                    {displayData.summary.trendsAnalysis.trend === 'increasing' ? 'Creciente' :
                     displayData.summary.trendsAnalysis.trend === 'decreasing' ? 'Decreciente' : 'Estable'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Loader para estados de carga */}
      <Loader isVisible={isLoading} showBackground={true} />
    </div>
  );
};

export default SalesReportsPage;
