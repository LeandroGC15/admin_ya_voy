// Sales Reports interfaces

export interface RevenueByPaymentMethod {
  [key: string]: {
    amount: number;
    count: number;
  };
}

export interface RevenueByServiceTier {
  tier_name: string;
  revenue: number;
  ride_count: number;
}

export interface RevenueByZone {
  zone: string;
  revenue: number;
  count: number;
}

export interface RevenueByTimePeriod {
  rides: Array<{
    period: string;
    revenue: number;
    count: number;
  }>;
  deliveries: Array<{
    period: string;
    revenue: number;
    count: number;
  }>;
}

export interface TrendsAnalysis {
  currentPeriodRevenue: number;
  previousPeriodRevenue: number;
  growthRate: number;
  trend: 'increasing' | 'decreasing' | 'stable';
}

export interface CategoryBreakdown {
  services: Array<{
    category: string;
    revenue: number;
    count: number;
  }>;
  discounts: {
    total: number;
    count: number;
  };
  taxesAndFees: {
    estimatedTaxes: number;
    platformFees: number;
  };
}

export interface PeriodComparison {
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

export interface SalesReportSummary {
  totalRevenue: number;
  revenueSources: {
    rides: number;
    deliveries: number;
    errands: number;
    parcels: number;
  };
  revenueByPaymentMethod: RevenueByPaymentMethod;
  revenueByTier: RevenueByServiceTier[];
  revenueByZone: RevenueByZone[];
  revenueByTimePeriod: RevenueByTimePeriod;
  trendsAnalysis: TrendsAnalysis;
  categoryBreakdown: CategoryBreakdown;
  periodComparison: PeriodComparison;
}

export interface SalesReportChartData {
  type: 'pie' | 'bar' | 'line' | 'doughnut';
  title: string;
  data: any[];
  config?: any;
  xAxis?: string;
  yAxis?: string;
}

export interface SalesReportData {
  summary: SalesReportSummary;
  chartData: SalesReportChartData[];
  details: any[];
  metadata: {
    generatedAt: string;
    filters: any;
    totalRecords: number;
    executionTime: number;
  };
}

export interface SalesReportFilters {
  dateFrom?: string;
  dateTo?: string;
  period?: 'today' | 'yesterday' | 'week' | 'month' | 'quarter' | 'year' | 'custom';
  groupBy?: 'day' | 'week' | 'month';
}
