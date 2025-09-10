import { api } from '@/lib/api/api-client';
import { ApiError } from '@/lib/api/api-client';
import { AuthResponseData } from '../interfaces/authResponse';

// Types
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Logs in an admin user and returns the authentication response data.
 * 
 * @param credentials The admin's login credentials.
 * @returns A promise that resolves with the authentication response data.
 */
export const loginAdmin = async (credentials: LoginCredentials): Promise<AuthResponseData> => {
  try {
    const response = await api.post<AuthResponseData>('/admin/auth/login', credentials, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    const responseData = response
    
    // Ensure the response has the expected structure
    if (!responseData?.data?.accessToken || !responseData?.data?.admin) {
      throw new ApiError(
        responseData?.message || 'Invalid response format',
        response.statusCode || 500,
        responseData
      );
    }
    
    return {
      accessToken: responseData.data.accessToken,
      refreshToken: responseData.data.refreshToken || '',
      admin: responseData.data.admin,
      expiresIn: responseData.data.expiresIn || 3600
    };
    
  } catch (error: any) {
    // The error is already processed by the ApiError.fromServerError
    throw error;
  }
};

export const logout = (): void => {
  localStorage.removeItem('authToken');
  // Redirect to login or home page
  window.location.href = '/login';
};
