import { api } from '@/lib/api/api-client';
import { ENDPOINTS } from '@/lib/endpoints';
import type { ApiResponse } from '@/interfaces/ApiResponse';

export interface UserData {
  id: string;
  name: string;
  email: string;
  phone?: string;
  city?: string;
  state?: string;
  country?: string;
  isActive?: boolean;
  userType?: string;
  adminRole?: string;
  createdAt?: string;
  wallet?: {
    balance: number;
  };
  _count?: {
    rides?: number;
    deliveryOrders?: number;
    ratings?: number;
  };
  clerkId?: string;
}

export interface UserListResponse {
  data: UserData[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filters: {
    applied: string[];
    searchTerm: string;
  };
}

export interface CreateUserPayload {
  name: string;
  email: string;
  phone?: string;
  city?: string;
  state?: string;
  country?: string;
  userType?: string;
}

export interface UpdateUserPayload {
  name?: string;
  email?: string;
  phone?: string;
  city?: string;
  state?: string;
  country?: string;
  isActive?: boolean;
  userType?: string;
}

/**
 * Fetches users with pagination and search
 */
export const fetchUsers = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  userType?: string;
}): Promise<UserListResponse> => {
  try {
    const response = await api.get<UserListResponse>(ENDPOINTS.users.base, {
      params: {
        page: params?.page || 1,
        limit: params?.limit || 10,
        search: params?.search,
        isActive: params?.isActive,
        userType: params?.userType,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

/**
 * Creates a new user
 */
export const createUser = async (userData: CreateUserPayload): Promise<UserData> => {
  try {
    const response = await api.post<UserData>(ENDPOINTS.users.base, userData);
    return response.data;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

/**
 * Updates an existing user
 */
export const updateUser = async (userId: string, userData: UpdateUserPayload): Promise<UserData> => {
  try {
    const response = await api.put<UserData>(ENDPOINTS.users.byId(userId), userData);
    return response.data;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

/**
 * Deletes a user
 */
export const deleteUser = async (userId: string): Promise<void> => {
  try {
    await api.delete<void>(ENDPOINTS.users.byId(userId));
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

/**
 * Searches for users by email
 */
export const searchUsers = async (email: string): Promise<UserListResponse> => {
  try {
    const response = await api.get<UserListResponse>(ENDPOINTS.users.search, {
      params: { email },
    });
    return response.data;
  } catch (error) {
    console.error('Error searching users:', error);
    throw error;
  }
};

