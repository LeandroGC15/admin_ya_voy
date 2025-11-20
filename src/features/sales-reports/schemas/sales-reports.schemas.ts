import { z } from 'zod';

// Revenue by payment method schema
export const revenueByPaymentMethodSchema = z.record(
  z.object({
    amount: z.number(),
    count: z.number(),
  })
);

// Revenue by service tier schema
export const revenueByServiceTierSchema = z.array(
  z.object({
    tier_name: z.string(),
    revenue: z.number(),
    ride_count: z.number(),
  })
);

// Revenue by zone schema
export const revenueByZoneSchema = z.array(
  z.object({
    zone: z.string(),
    revenue: z.number(),
    count: z.number(),
  })
);

// Revenue by time period schema
export const revenueByTimePeriodSchema = z.object({
  rides: z.array(
    z.object({
      period: z.string(),
      revenue: z.number(),
      count: z.number(),
    })
  ),
  deliveries: z.array(
    z.object({
      period: z.string(),
      revenue: z.number(),
      count: z.number(),
    })
  ),
});

// Trends analysis schema
export const trendsAnalysisSchema = z.object({
  currentPeriodRevenue: z.number(),
  previousPeriodRevenue: z.number(),
  growthRate: z.number(),
  trend: z.enum(['increasing', 'decreasing', 'stable']),
});

// Category breakdown schema
export const categoryBreakdownSchema = z.object({
  services: z.array(
    z.object({
      category: z.string(),
      revenue: z.number(),
      count: z.number(),
    })
  ),
  discounts: z.object({
    total: z.number(),
    count: z.number(),
  }),
  taxesAndFees: z.object({
    estimatedTaxes: z.number(),
    platformFees: z.number(),
  }),
});

// Period comparison schema
export const periodComparisonSchema = z.object({
  yearlyComparison: z.object({
    current: z.number(),
    previous: z.number(),
    growth: z.number(),
  }),
  monthlyComparison: z.object({
    current: z.number(),
    previous: z.number(),
    growth: z.number(),
  }),
});

// Sales report summary schema
export const salesReportSummarySchema = z.object({
  totalRevenue: z.number(),
  revenueSources: z.object({
    rides: z.number(),
    deliveries: z.number(),
    errands: z.number(),
    parcels: z.number(),
  }),
  revenueByPaymentMethod: revenueByPaymentMethodSchema,
  revenueByTier: revenueByServiceTierSchema,
  revenueByZone: revenueByZoneSchema,
  revenueByTimePeriod: revenueByTimePeriodSchema,
  trendsAnalysis: trendsAnalysisSchema,
  categoryBreakdown: categoryBreakdownSchema,
  periodComparison: periodComparisonSchema,
});

// Chart data schema
export const salesReportChartDataSchema = z.object({
  type: z.enum(['pie', 'bar', 'line', 'doughnut']),
  title: z.string(),
  data: z.array(z.any()),
  config: z.any().optional(),
  xAxis: z.string().optional(),
  yAxis: z.string().optional(),
});

// Main sales report data schema
export const salesReportDataSchema = z.object({
  summary: salesReportSummarySchema,
  chartData: z.array(salesReportChartDataSchema),
  details: z.array(z.any()),
  metadata: z.object({
    generatedAt: z.string(),
    filters: z.any(),
    totalRecords: z.number(),
    executionTime: z.number(),
  }),
});

// Filters schema
export const salesReportFiltersSchema = z.object({
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  period: z.enum(['today', 'yesterday', 'week', 'month', 'quarter', 'year', 'custom']).optional(),
  groupBy: z.enum(['day', 'week', 'month']).optional(),
});

// Type exports
export type SalesReportData = z.infer<typeof salesReportDataSchema>;
export type SalesReportSummary = z.infer<typeof salesReportSummarySchema>;
export type SalesReportFilters = z.infer<typeof salesReportFiltersSchema>;
export type SalesReportChartData = z.infer<typeof salesReportChartDataSchema>;
