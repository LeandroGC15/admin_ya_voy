import { api } from '@/lib/api/api-client';
import { AuthResponseData } from '../interfaces/authResponse';

// Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export const loginAdmin = async (credentials: LoginCredentials): Promise<AuthResponseData> => {
  try {
    console.log('Sending login request with:', credentials);
    const response = await api.post<AuthResponseData>('/admin/auth/login', credentials, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    console.log('Login response in service:', response);
    
    if (!response) {
      throw new Error('No response received from server');
    }
    
    const responseData = response.data;
    
    if (!responseData || !responseData.accessToken) {
      throw new Error('Invalid response data');
    }
    
    // Store token in localStorage or cookies as needed
    localStorage.setItem('auth', JSON.stringify(responseData));
    
    return responseData;
  } catch (error: unknown) {
    console.error('Login error in service:', error);
    throw error;
  }
};

export const logout = (): void => {
  localStorage.removeItem('authToken');
  // Redirect to login or home page
  window.location.href = '/login';
};
