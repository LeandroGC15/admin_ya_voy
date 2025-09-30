/**
 * User Management interfaces
 */

export interface UserFilters {
  status?: ('active' | 'inactive')[];
  emailVerified?: boolean;
  phoneVerified?: boolean;
  identityVerified?: boolean;
  hasWallet?: boolean;
  dateFrom?: string;
  dateTo?: string;
  minRides?: number;
  maxRides?: number;
  search?: string;
  page?: number;
  limit?: number;
}

export interface UserBasic {
  id: number;
  name: string;
  email: string;
  phone?: string;
  isActive: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
  identityVerified: boolean;
  createdAt: string;
  totalRides: number;
  completedRides: number;
  cancelledRides: number;
  averageRating: number;
}

export interface UserAddress {
  profileImage?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
}

export interface UserPreferences {
  preferredLanguage: string;
  timezone: string;
  currency: string;
}

export interface UserStats {
  totalRides: number;
  completedRides: number;
  cancelledRides: number;
  averageRating: number;
}

export interface UserWallet {
  balance: number;
  totalTransactions: number;
}

export interface EmergencyContact {
  id: number;
  contactName: string;
  contactPhone: string;
}

export interface RecentRide {
  id: number;
  status: string;
  createdAt: string;
  farePrice: number;
}

export interface UserDetail extends UserBasic {
  dateOfBirth?: string;
  gender?: string;
  lastLogin?: string;
  address: UserAddress;
  preferences: UserPreferences;
  stats: UserStats;
  wallet: UserWallet;
  emergencyContacts: EmergencyContact[];
  recentRides: RecentRide[];
}

export interface UserListItem extends UserBasic {
  wallet: UserWallet;
}

export interface UserListResponse {
  users: UserListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UserDetailResponse extends UserDetail {
  _type?: never;
}

export interface UpdateUserStatusRequest {
  isActive: boolean;
  reason?: string;
}

export interface AdjustWalletRequest {
  amount: number;
  reason: string;
  description: string;
}

export interface AddEmergencyContactRequest {
  contactName: string;
  contactPhone: string;
}

export interface BulkUpdateUsersRequest {
  userIds: number[];
  isActive: boolean;
  reason?: string;
}
