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
    return response;
  } catch (error: any) {
    console.log(`ERROR 1 error ${error}`)
    throw error;
  }
};

export const logout = (): void => {
  localStorage.removeItem('authToken');
  // Redirect to login or home page
  window.location.href = '/login';
};
