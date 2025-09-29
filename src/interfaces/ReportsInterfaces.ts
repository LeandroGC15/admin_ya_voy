/**
 * Reports & Analytics interfaces
 */

// Report Generation
export interface GenerateReportRequest {
  dateFrom: string;
  dateTo: string;
  period: 'day' | 'week' | 'month' | 'quarter' | 'year';
  entityType: 'rides' | 'financial' | 'users' | 'drivers' | 'system';
  groupBy: 'day' | 'week' | 'month' | 'hour';
  metrics: string[];
  filters?: Record<string, any>;
}

export interface ReportChart {
  type: 'line' | 'bar' | 'pie' | 'area';
  title: string;
  data: any[];
  xAxis?: string;
  yAxis?: string;
  series: Array<{
    name: string;
    data: number[];
    color?: string;
  }>;
}

export interface ReportData {
  date: string;
  [metric: string]: string | number;
}

export interface GeneratedReport {
  summary: Record<string, number>;
  data: ReportData[];
  charts: ReportChart[];
  generatedAt: string;
  dateRange: {
    from: string;
    to: string;
  };
  filters: Record<string, any>;
  metadata: {
    totalRecords: number;
    processingTime: number;
    dataSource: string;
  };
}

export interface ReportExportRequest extends GenerateReportRequest {
  format: 'csv' | 'excel' | 'pdf';
  includeCharts: boolean;
}

// Dashboard Widgets
export interface DashboardWidget {
  id: string;
  type: 'metric' | 'chart' | 'table' | 'progress';
  title: string;
  description?: string;
  size: 'small' | 'medium' | 'large';
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  config: Record<string, any>;
  dataSource: string;
  refreshInterval: number; // in seconds
  isActive: boolean;
  lastUpdated?: string;
}

export interface DashboardWidgetsResponse {
  widgets: DashboardWidget[];
  timestamp: string;
}

// Custom Dashboard
export interface CustomDashboard {
  id: string;
  name: string;
  description?: string;
  widgets: DashboardWidget[];
  layout: {
    columns: number;
    rows: number;
    gap: number;
  };
  isPublic: boolean;
  sharedWithRoles: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCustomDashboardRequest {
  name: string;
  description?: string;
  widgets: Omit<DashboardWidget, 'id' | 'lastUpdated'>[];
  layout: {
    columns: number;
    rows: number;
    gap: number;
  };
  isPublic: boolean;
  sharedWithRoles: string[];
}

// Scheduled Reports
export interface ScheduledReport {
  id: string;
  name: string;
  description?: string;
  reportConfig: GenerateReportRequest;
  schedule: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
    dayOfWeek?: number; // 0-6, Sunday = 0
    dayOfMonth?: number; // 1-31
    time: string; // HH:mm format
    timezone: string;
  };
  recipients: string[];
  format: 'pdf' | 'excel' | 'csv';
  isActive: boolean;
  lastRun?: string;
  nextRun: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateScheduledReportRequest {
  name: string;
  description?: string;
  reportConfig: GenerateReportRequest;
  schedule: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
    dayOfWeek?: number;
    dayOfMonth?: number;
    time: string;
    timezone: string;
  };
  recipients: string[];
  format: 'pdf' | 'excel' | 'csv';
  isActive: boolean;
}

export interface ScheduledReportsResponse {
  reports: ScheduledReport[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Quick Reports
export interface QuickRidesReport {
  period: string;
  totalRides: number;
  completedRides: number;
  cancelledRides: number;
  averageFare: number;
  totalRevenue: number;
  completionRate: number;
  topRoutes: Array<{
    origin: string;
    destination: string;
    rideCount: number;
    averageFare: number;
  }>;
  hourlyDistribution: Array<{
    hour: number;
    rideCount: number;
  }>;
}

export interface QuickFinancialReport {
  period: string;
  totalRevenue: number;
  totalTransactions: number;
  averageTransactionValue: number;
  paymentMethods: Record<string, number>;
  refunds: {
    count: number;
    totalAmount: number;
  };
  revenueByDay: Array<{
    date: string;
    revenue: number;
    transactionCount: number;
  }>;
  topEarningDrivers: Array<{
    driverId: number;
    driverName: string;
    totalEarnings: number;
    rideCount: number;
  }>;
}

export interface QuickDriversReport {
  totalDrivers: number;
  activeDrivers: number;
  onlineDrivers: number;
  averageRating: number;
  completionRate: number;
  topPerformers: Array<{
    driverId: number;
    name: string;
    rating: number;
    completionRate: number;
    totalRides: number;
  }>;
  statusDistribution: Record<string, number>;
  verificationStatus: Record<string, number>;
}

export interface QuickUsersReport {
  totalUsers: number;
  activeUsers: number;
  newUsersThisPeriod: number;
  averageRating: number;
  userGrowth: Array<{
    date: string;
    newUsers: number;
    cumulativeUsers: number;
  }>;
  topUserLocations: Array<{
    city: string;
    state: string;
    userCount: number;
  }>;
  rideFrequency: {
    oneTime: number;
    occasional: number;
    frequent: number;
    regular: number;
  };
}

// System Metrics Overview
export interface SystemMetricsOverview {
  overview: {
    totalRides: number;
    activeRides: number;
    totalUsers: number;
    activeDrivers: number;
    todayRevenue: number;
    pendingPayments: number;
  };
  trends: {
    ridesGrowth: number;
    revenueGrowth: number;
    userGrowth: number;
    driverGrowth: number;
  };
  health: {
    systemStatus: 'healthy' | 'warning' | 'critical';
    lastBackup: string;
    activeAlerts: number;
    uptime: number;
  };
  performance: {
    averageResponseTime: number;
    errorRate: number;
    throughput: number;
    memoryUsage: number;
    cpuUsage: number;
  };
}

// Common filters
export interface ReportFilters {
  dateFrom?: string;
  dateTo?: string;
  entityType?: string;
  groupBy?: string;
  metrics?: string[];
}
