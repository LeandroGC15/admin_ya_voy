import { z } from 'zod';

// Dashboard metrics schema (based on MetricsResponse interface)
// Making fields optional to handle backend inconsistencies gracefully
export const dashboardMetricsSchema = z.object({
  // Users metrics
  totalUsers: z.number().optional().default(0),
  activeUsers: z.number().optional().default(0),
  newUsersToday: z.number().optional().default(0),
  newUsersThisWeek: z.number().optional().default(0),
  newUsersThisMonth: z.number().optional().default(0),

  // Drivers metrics
  totalDrivers: z.number().optional().default(0),
  onlineDrivers: z.number().optional().default(0),
  pendingVerifications: z.number().optional().default(0),
  approvedDrivers: z.number().optional().default(0),
  suspendedDrivers: z.number().optional().default(0),

  // Rides metrics
  activeRides: z.number().optional().default(0),
  completedRidesToday: z.number().optional().default(0),
  cancelledRidesToday: z.number().optional().default(0),
  completedRidesThisWeek: z.number().optional().default(0),
  totalRides: z.number().optional().default(0),

  // Delivery metrics
  activeOrders: z.number().optional().default(0),
  completedOrdersToday: z.number().optional().default(0),
  completedOrdersThisWeek: z.number().optional().default(0),
  totalOrders: z.number().optional().default(0),

  // Financial metrics
  totalRevenue: z.number().optional().default(0),
  revenueToday: z.number().optional().default(0),
  revenueThisWeek: z.number().optional().default(0),
  revenueThisMonth: z.number().optional().default(0),
  pendingPayments: z.number().optional().default(0),
  totalWalletBalance: z.number().optional().default(0),

  // Stores metrics
  totalStores: z.number().optional().default(0),
  activeStores: z.number().optional().default(0),
  pendingStores: z.number().optional().default(0),

  // System metrics
  totalNotificationsSent: z.number().optional().default(0),
  systemUptime: z.string().optional().default('N/A'),
});

// Type inference from schema
export type DashboardMetrics = z.infer<typeof dashboardMetricsSchema>;
