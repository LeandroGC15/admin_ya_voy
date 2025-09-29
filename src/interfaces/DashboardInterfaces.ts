/**
 * Dashboard related interfaces
 */

export interface DashboardAlert {
  id: string;
  type: 'performance' | 'security' | 'system' | 'business';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  timestamp: string;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
}

export interface DashboardMetrics {
  // Ride metrics
  activeRides: number;
  completedRidesToday: number;
  cancelledRidesToday: number;
  totalRidesThisWeek: number;
  totalRides: number;

  // Revenue metrics
  revenueToday: number;
  revenueThisWeek: number;
  averageFare: number;
  totalTransactions: number;

  // Driver metrics
  onlineDrivers: number;
  busyDrivers: number;
  availableDrivers: number;
  averageDriverRating: number;

  // User metrics
  activeUsersToday: number;
  newUsersThisWeek: number;
  totalUsers: number;
  averageUserRating: number;

  // Order metrics
  activeOrders: number;
  completedOrdersToday: number;
  totalOrders: number;

  // Financial metrics
  pendingPayments: number;
  totalWalletBalance: number;

  // Store metrics
  totalStores: number;
  activeStores: number;

  // System metrics
  totalNotificationsSent: number;
  systemStatus: 'healthy' | 'warning' | 'critical';
  systemUptime: string;
  lastUpdated: string;
}

export interface DashboardData {
  metrics: DashboardMetrics;
  alerts: DashboardAlert[];
  timestamp: string;
}

export interface DashboardResponse {
  metrics: DashboardMetrics;
  alerts: DashboardAlert[];
  timestamp: string;
}

export interface MetricsResponse {
  metrics: DashboardMetrics;
  timestamp: string;
}

export interface AlertsResponse {
  alerts: DashboardAlert[];
  timestamp: string;
}
