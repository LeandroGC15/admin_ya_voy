import { useApiQuery } from '@/lib/api/react-query-client';
import { api } from '@/lib/api/api-client';
import { ENDPOINTS } from '@/lib/endpoints';
import { salesReportDataSchema, type SalesReportData, type SalesReportFilters } from '../schemas/sales-reports.schemas';

// Hook for fetching sales report data
export function useSalesReport(filters?: SalesReportFilters) {
  // Build query parameters from filters
  const queryParams = new URLSearchParams();

  // Map filters to the correct parameter names for the financial analytics endpoint
  if (filters?.period) {
    // Convert period to dateRange format expected by the endpoint
    const periodMap: Record<string, string> = {
      'today': 'today',
      'yesterday': 'yesterday',
      'week': '7d',
      'month': '30d',
      'quarter': '90d',
      'year': '1y',
      'custom': 'custom'
    };
    const dateRange = periodMap[filters.period] || '30d';
    queryParams.append('dateRange', dateRange);
  } else {
    // Default to month (30d)
    queryParams.append('dateRange', '30d');
  }

  if (filters?.dateFrom) queryParams.append('startDate', filters.dateFrom);
  if (filters?.dateTo) queryParams.append('endDate', filters.dateTo);
  if (filters?.groupBy) queryParams.append('groupBy', filters.groupBy);

  const queryString = queryParams.toString();
  const endpoint = queryString ? `${ENDPOINTS.reports.sales}?${queryString}` : ENDPOINTS.reports.sales;

  return useApiQuery(
    ['sales-reports', filters],
    async (): Promise<SalesReportData> => {
      try {
        const response = await api.get(endpoint);
        if (!response || !response.data) {
          throw new Error('Invalid API response: no data received');
        }

        // Transform backend response to match frontend schema
        const transformedData = transformFinancialAnalyticsResponse(response.data);

        // Validate response data with Zod schema
        const validatedData = salesReportDataSchema.parse(transformedData);
        return validatedData;
      } catch (error: any) {
        console.error('Error fetching sales report:', error);
        throw error;
      }
    },
    {
      enabled: true,
      staleTime: 10 * 60 * 1000, // 10 minutes - reports can be cached for a bit longer
      cacheTime: 30 * 60 * 1000, // 30 minutes
    }
  );
}

// Transform backend financial analytics response to match frontend schema
function transformFinancialAnalyticsResponse(backendData: any) {
  // Estructura de respuesta del backend:
  // {
  //   revenue: {...},
  //   trends: [...],
  //   byPaymentMethod: [...],
  //   byTier: [...],
  //   projections: {...},
  //   generatedAt: Date
  // }

  // Estructura esperada por el frontend:
  // {
  //   summary: {...},
  //   chartData: [...],
  //   details: [...],
  //   metadata: {...}
  // }

  // Convert arrays to objects for compatibility with frontend schema
  const revenueByPaymentMethod = Array.isArray(backendData.byPaymentMethod)
    ? backendData.byPaymentMethod.reduce((acc: any, item: any) => {
        acc[item.method || item.name || 'unknown'] = item;
        return acc;
      }, {})
    : backendData.byPaymentMethod || {};

  const summary = {
    totalRevenue: backendData.revenue?.netRevenue || 0,
    revenueSources: {
      rides: backendData.revenue?.grossRevenue || 0,
      deliveries: 0, // Not available in current backend response
      errands: 0,    // Not available in current backend response
      parcels: 0,    // Not available in current backend response
    },
    revenueByPaymentMethod,
    revenueByTier: backendData.byTier || [],
    revenueByZone: [], // Not available in current backend response
    revenueByTimePeriod: {
      rides: backendData.trends || [],
      deliveries: [],
    },
    trendsAnalysis: {
      currentPeriodRevenue: backendData.revenue?.netRevenue || 0,
      previousPeriodRevenue: 0, // Would need to calculate from trends
      growthRate: backendData.projections?.monthlyGrowth || 0,
      trend: 'stable' as const, // Would need to calculate from trends
    },
    categoryBreakdown: {
      services: [], // Not available in current backend response
      discounts: { total: 0, count: 0 },
      taxesAndFees: {
        estimatedTaxes: backendData.revenue?.taxes || 0,
        platformFees: backendData.revenue?.stripeFees || 0,
      },
    },
    periodComparison: {
      yearlyComparison: {
        current: backendData.revenue?.netRevenue || 0,
        previous: 0, // Would need to calculate
        growth: 0, // Would need to calculate
      },
      monthlyComparison: {
        current: backendData.revenue?.netRevenue || 0,
        previous: 0, // Would need to calculate
        growth: 0, // Would need to calculate
      },
    },
  };

  // Create chart data from backend response
  const chartData = [
    {
      type: 'line' as const,
      title: 'Ingresos por Tiempo',
      data: backendData.trends || [],
      config: {},
      xAxis: 'period',
      yAxis: 'revenue',
    },
    {
      type: 'pie' as const,
      title: 'Ingresos por Método de Pago',
      data: backendData.byPaymentMethod || [],
      config: {},
    },
    {
      type: 'doughnut' as const,
      title: 'Ingresos por Tipo de Servicio',
      data: backendData.byTier || [],
      config: {},
    },
  ];

  const details = backendData.trends || [];

  const metadata = {
    generatedAt: backendData.generatedAt || new Date().toISOString(),
    filters: {}, // Not available in current backend response
    totalRecords: backendData.trends?.length || 0,
    executionTime: 0, // Not available in current backend response
  };

  return {
    summary,
    chartData,
    details,
    metadata,
  };
}

// Hook to invalidate sales reports cache
export function invalidateSalesReports() {
  // This will be called from react-query-client when needed
  // Implementation will be handled by the component when needed
}

// Export report hook and utility functions
export type ExportFormat = 'csv' | 'excel' | 'pdf';

export interface ExportReportOptions {
  format: ExportFormat;
  filters: SalesReportFilters;
}

// Utility function to export reports
export async function exportReport({ format, filters }: ExportReportOptions): Promise<void> {
  try {
    const axios = (await import('axios')).default;
    const { ENDPOINTS } = await import('@/lib/endpoints');

    // Get session for authentication
    let accessToken: string | null = null;
    if (typeof window !== 'undefined') {
      try {
        const { getSession } = await import('next-auth/react');
        const session = await getSession();
        accessToken = session?.accessToken || null;
      } catch (err) {
        console.warn('Could not get session for export:', err);
      }
    }

    // Map frontend filters to backend format
    const backendFilters = {
      entityType: 'financial',
      period: filters.period,
      groupBy: filters.groupBy,
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo,
    };

    // Make direct axios request to avoid response interceptors
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}${ENDPOINTS.reports.export}`,
      {
        format,
        ...backendFilters,
      },
      {
        responseType: 'blob', // Important for file downloads
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        },
        withCredentials: true,
      }
    );

    // Create blob and download
    const blob = new Blob([response.data], {
      type: getContentType(format),
    });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const filename = `sales-report-${timestamp}.${getFileExtension(format)}`;
    link.download = filename;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up
    window.URL.revokeObjectURL(url);

  } catch (error: any) {
    console.error('Error exporting report:', error);

    // Try to extract error message from response if available
    let errorMessage = 'Unknown error';
    if (error.response?.data) {
      try {
        // If it's a blob, try to read it as text
        if (error.response.data instanceof Blob) {
          const text = await error.response.data.text();
          try {
            const parsed = JSON.parse(text);
            errorMessage = parsed.message || parsed.error || text;
          } catch {
            errorMessage = text;
          }
        } else {
          errorMessage = error.response.data.message || error.response.data.error || error.message;
        }
      } catch {
        errorMessage = error.message || 'Export failed';
      }
    } else {
      errorMessage = error.message || 'Export failed';
    }

    throw new Error(`Failed to export report: ${errorMessage}`);
  }
}

// Helper function to get content type for different formats
function getContentType(format: ExportFormat): string {
  switch (format) {
    case 'csv':
      return 'text/csv;charset=utf-8';
    case 'excel':
      return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    case 'pdf':
      return 'application/pdf';
    default:
      return 'application/octet-stream';
  }
}

// Helper function to get file extension
function getFileExtension(format: ExportFormat): string {
  switch (format) {
    case 'csv':
      return 'csv';
    case 'excel':
      return 'xlsx';
    case 'pdf':
      return 'pdf';
    default:
      return 'bin';
  }
}
