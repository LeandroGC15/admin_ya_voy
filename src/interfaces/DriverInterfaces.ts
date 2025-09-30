/**
 * Driver Management interfaces
 */

export interface DriverFilters {
  status?: ('online' | 'offline' | 'busy' | 'suspended')[];
  verificationStatus?: ('pending' | 'approved' | 'rejected' | 'under_review')[];
  canDoDeliveries?: boolean;
  dateFrom?: string;
  dateTo?: string;
  minRating?: number;
  maxRating?: number;
  minRides?: number;
  maxRides?: number;
  minEarnings?: number;
  maxEarnings?: number;
  search?: string;
  zoneId?: number;
  page?: number;
  limit?: number;
}

export interface DriverBasic {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: 'online' | 'offline' | 'busy' | 'unavailable';
  verificationStatus: 'pending' | 'approved' | 'rejected' | 'under_review';
  canDoDeliveries: boolean;
  averageRating: number;
  totalRides: number;
  completedRides: number;
  cancelledRides: number;
  totalEarnings: number;
  completionRate: number;
}

export interface CurrentWorkZone {
  id: number;
  name: string;
}

export interface DefaultVehicle {
  make: string;
  model: string;
  licensePlate: string;
}

export interface DriverListItem extends DriverBasic {
  currentWorkZone?: CurrentWorkZone;
  defaultVehicle?: DefaultVehicle;
}

export interface DriverStats {
  averageRating: number;
  totalRides: number;
  completedRides: number;
  cancelledRides: number;
  totalEarnings: number;
  completionRate: number;
}

export interface DriverAddress {
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
}

export interface DriverDocument {
  id: number;
  documentType: string;
  documentUrl?: string;
  uploadedAt: string;
  verificationStatus: string;
}

export interface DriverVehicle {
  id: number;
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  color: string;
  isDefault: boolean;
}

export interface DriverWorkZone {
  id: number;
  name: string;
  city?: string;
}

export interface PaymentMethod {
  id: number;
  type: string;
  isDefault: boolean;
}

export interface DriverPerformanceStats {
  todayRides: number;
  weekRides: number;
  monthRides: number;
  todayEarnings: number;
  weekEarnings: number;
  monthEarnings: number;
  averageResponseTime: number;
  customerSatisfaction: number;
}

export interface DriverDetail extends DriverBasic {
  dateOfBirth?: string;
  gender?: string;
  lastActive?: string;
  createdAt: string;
  stats: DriverStats;
  address: DriverAddress;
  documents: DriverDocument[];
  vehicles: DriverVehicle[];
  currentWorkZone?: DriverWorkZone;
  paymentMethods: PaymentMethod[];
  recentRides: RecentRide[];
  performanceStats: DriverPerformanceStats;
}

export interface DriverListResponse {
  drivers: DriverListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface DriverDetailResponse extends DriverDetail {
  _type?: never;
}

export interface UpdateDriverStatusRequest {
  status: 'online' | 'offline' | 'busy' | 'suspended';
  reason?: string;
  suspensionEndDate?: string;
}

export interface UpdateDriverVerificationRequest {
  verificationStatus: 'pending' | 'approved' | 'rejected' | 'under_review';
  notes?: string;
}

export interface UpdateDriverWorkZonesRequest {
  zoneIds: number[];
  primaryZoneId: number;
}

export interface BulkUpdateDriversRequest {
  driverIds: number[];
  status: 'online' | 'offline' | 'busy' | 'suspended';
  reason?: string;
}

export interface RecentRide {
  id: number;
  status: string;
  createdAt: string;
  farePrice: number;
}
