import { z } from 'zod';

// Dashboard metrics schema (based on backend DashboardMetrics interface)
export const dashboardMetricsSchema = z.object({
  // Rides metrics
  activeRides: z.number().optional().default(0),
  completedRidesToday: z.number().optional().default(0),
  cancelledRidesToday: z.number().optional().default(0),
  totalRidesThisWeek: z.number().optional().default(0),

  // Financial metrics
  revenueToday: z.number().optional().default(0),
  revenueThisWeek: z.number().optional().default(0),
  averageFare: z.number().optional().default(0),
  totalTransactions: z.number().optional().default(0),

  // Drivers metrics
  onlineDrivers: z.number().optional().default(0),
  busyDrivers: z.number().optional().default(0),
  availableDrivers: z.number().optional().default(0),
  averageDriverRating: z.number().optional().default(0),

  // Users metrics
  activeUsersToday: z.number().optional().default(0),
  newUsersThisWeek: z.number().optional().default(0),
  totalUsers: z.number().optional().default(0),
  averageUserRating: z.number().optional().default(0),

  // System health
  systemStatus: z.enum(['healthy', 'warning', 'critical']).optional().default('healthy'),
  lastUpdated: z.coerce.date().optional(),
});

// Type inference from schema
export type DashboardMetrics = z.infer<typeof dashboardMetricsSchema>;
