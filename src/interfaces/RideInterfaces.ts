/**
 * Ride Management interfaces
 */

export interface RideFilters {
  status?: string[];
  driverId?: number;
  userId?: number;
  dateFrom?: string;
  dateTo?: string;
  minFare?: number;
  maxFare?: number;
  originAddress?: string;
  destinationAddress?: string;
  page?: number;
  limit?: number;
}

export interface RideLocation {
  originAddress: string;
  destinationAddress: string;
  originLatitude: number;
  originLongitude: number;
  destinationLatitude: number;
  destinationLongitude: number;
}

export interface RideDriver {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  profileImageUrl?: string;
  carModel: string;
  licensePlate: string;
  averageRating: number;
}

export interface RideUser {
  id: number;
  name: string;
  email: string;
  phone?: string;
}

export interface RideTier {
  id: number;
  name: string;
  baseFare: number;
  perMinuteRate: number;
  perMileRate: number;
}

export interface RideRating {
  id: number;
  rating: number;
  comment?: string;
  createdAt: string;
}

export interface RideMessage {
  id: number;
  sender: 'user' | 'driver';
  message: string;
  timestamp: string;
}

export interface RideLocationUpdate {
  latitude: number;
  longitude: number;
  timestamp: string;
}

export interface RideBasic {
  id: number;
  rideId: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  rideTime: number;
  farePrice: number;
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
}

export interface RideListItem extends RideBasic {
  originAddress: string;
  destinationAddress: string;
  driver: RideDriver;
  user: RideUser;
  tier: RideTier;
  messagesCount: number;
}

export interface RideDetail extends RideBasic {
  locations: RideLocation;
  driver: RideDriver;
  user: RideUser;
  tier: RideTier;
  ratings: RideRating[];
  messages: RideMessage[];
  recentLocations: RideLocationUpdate[];
}

export interface RideListResponse {
  rides: RideListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface RideDetailResponse extends RideDetail {
  _type?: never;
}

export interface ReassignRideRequest {
  newDriverId: number;
  reason: string;
}

export interface CancelRideRequest {
  reason: string;
  refundAmount?: number;
}

export interface CompleteRideRequest {
  reason?: string;
}
