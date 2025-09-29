export interface MetricsData {
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;

  totalDrivers: number;
  onlineDrivers: number;
  pendingVerifications: number;
  approvedDrivers: number;
  suspendedDrivers: number;

  activeRides: number;
  completedRidesToday: number;
  cancelledRidesToday: number;
  completedRidesThisWeek: number;
  totalRides: number;

  activeOrders: number;
  completedOrdersToday: number;
  completedOrdersThisWeek: number;
  totalOrders: number;

  totalRevenue: number;
  revenueToday: number;
  revenueThisWeek: number;
  revenueThisMonth: number;
  pendingPayments: number;
  totalWalletBalance: number;

  totalStores: number;
  activeStores: number;
  pendingStores: number;

  totalNotificationsSent: number;
  systemUptime: string;
}
