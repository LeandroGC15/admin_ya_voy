import { api } from '@/lib/api/api-client';
import { ENDPOINTS } from '@/lib/endpoints';
import type { ApiResponse } from '@/interfaces/ApiResponse';
import type { RegisterDriverPayload, DriverData } from '../interfaces/drivers';
import type { DriverSearchValues } from '../schemas/driver-search.schema';

export interface SearchDriversData {
  drivers: DriverData[];
  total: number;
  page: number;
  totalPages: number;
}

interface RegisterDriverData {
  driverId: string;
  email: string;
}

/**
 * Registers a new driver with the provided data.
 * 
 * @param driverData The driver's registration data.
 * @returns A promise that resolves with the registration response.
 */
export const registerDriver = async (driverData: RegisterDriverPayload): Promise<ApiResponse<RegisterDriverData>> => {
  try {
    const response = await api.post<RegisterDriverData>(ENDPOINTS.drivers.register, driverData);
    return response;
  } catch (error) {
    console.error('Error registering driver:', error);
    throw error;
  }
};

/**
 * Deletes a driver by their ID.
 * 
 * @param driverId The ID of the driver to delete.
 * @returns A promise that resolves with the delete response.
 */
export const deleteDriver = async (driverId: string): Promise<ApiResponse<void>> => {
  try {
    const response = await api.delete<void>(ENDPOINTS.drivers.byId(driverId));
    return response;
  } catch (error) {
    console.error(`Error deleting driver ${driverId}:`, error);
    throw error;
  }
};

/**
 * Search for drivers based on the provided criteria.
 * 
 * @param searchParams The search criteria.
 * @returns A promise that resolves with the search results.
 */
export const searchDrivers = async (
  searchParams: Partial<DriverSearchValues> = {}
): Promise<ApiResponse<SearchDriversData>> => {
  try {
    const { search, page = 1, limit = 10, ...restParams } = searchParams;
    let searchCriteria = {};
    if (search) {
      searchCriteria = {
        $or: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { licensePlate: { contains: search, mode: 'insensitive' } }
        ]
      };
    }
    const params = {
      ...restParams,
      ...searchCriteria,
      page: Number(page) || 1,
      limit: Math.min(Number(limit) || 10, 100), // Cap at 100 items per page
    };
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v !== undefined && v !== '')
    );
  
    const response = await api.get<SearchDriversData>('api/driver', { 
      params: cleanParams,
      paramsSerializer: {
        indexes: null // Prevents array indices in URLs
      }
    });
    return response;
  } catch (error) {
    console.error('Error searching drivers:', error);
    throw error;
  }
};

