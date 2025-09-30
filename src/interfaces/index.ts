// Export all interfaces for easy importing
export * from './ApiResponse';
export * from './AuthInterfaces';
export * from './DashboardInterfaces';
export * from './GeographyInterfaces';
export * from './NotificationInterfaces';
export * from './ReportsInterfaces';
export * from './ConfigInterfaces';
export * from './MetricsResponse';

// Export interfaces with aliases to resolve naming conflicts
export type { RideTier as PricingRideTier } from './PricingInterfaces';
export type { RideTier as RideRideTier } from './RideInterfaces';
export type { RecentRide as DriverRecentRide } from './DriverInterfaces';
export type { RecentRide as UserRecentRide } from './UserInterfaces';

// Note: Conflicting interface names (RideTier, RecentRide) are exported with aliases above.
// Use PricingRideTier, RideRideTier, DriverRecentRide, UserRecentRide respectively.
