import { ApiResponse } from '@/interfaces/ApiResponse';
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

// Types
export interface ServerErrorResponse {
  statusCode: number;
  message: string;
  timestamp?: string;
  path?: string;
  [key: string]: unknown;
}

export class ApiError extends Error {
  status: number;
  timestamp?: string;
  path?: string;
  data: Record<string, unknown>;

  constructor(message: string, status: number, data: ServerErrorResponse | unknown = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    
    // Handle structured server error response
    if (data && typeof data === 'object') {
      const errorData = data as ServerErrorResponse;
      this.timestamp = errorData.timestamp;
      this.path = errorData.path;
      this.data = { ...errorData };
    } else {
      this.data = { originalData: data };
    }
  }

  static fromServerError(error: AxiosError): ApiError {
    if (error.response?.data) {
      const { statusCode, message, ...rest } = error.response.data as ServerErrorResponse;
      return new ApiError(
        message || 'An error occurred', 
        statusCode || error.response.status || 500, 
        rest
      );
    }
    
    if (error instanceof ApiError) {
      return error;
    }
    
    return new ApiError(
      error.message || 'An unknown error occurred',
      (error as any).status || 0,
      (error as any).data || {}
    );
  }
}

class ApiClient {
  private instance: AxiosInstance;
  private static _instance: ApiClient;

  private constructor() {
    this.instance = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.initializeInterceptors();
  }

  public static getInstance(): ApiClient {
    if (!ApiClient._instance) {
      ApiClient._instance = new ApiClient();
    }
    return ApiClient._instance;
  }

  private initializeInterceptors() {
    // Request interceptor
    this.instance.interceptors.request.use(
      (config) => {
        // Get auth data from localStorage
        const authData = localStorage.getItem('auth');
        if (authData) {
          try {
            const { accessToken } = JSON.parse(authData);
            if (accessToken) {
              config.headers.Authorization = `Bearer ${accessToken}`;
            }
          } catch (error) {
            console.error('Error parsing auth data:', error);
          }
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    this.instance.interceptors.response.use(
      (response: AxiosResponse<ApiResponse<unknown>>) => {
        const { data } = response;
        if (data && typeof data === 'object' && 'data' in data) {
          // Create a new response object with the unwrapped data
          return {
            ...response,
            data: data.data
          };
        }
        throw new ApiError(
          'Unexpected successful response format',
          response.status || 500,
          data || response
        );
      },
      (error: AxiosError) => {
        return Promise.reject(ApiError.fromServerError(error));
      }
    );
  }

  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.instance.get<ApiResponse<T>>(url, config);
    console.log(response.data)
    return response.data
  }

  public async post<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.instance.post<ApiResponse<T>>(url, data, config);
    return response.data
  }

  public async put<T>(
    url: string, 
    data?: unknown, 
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.instance.put<ApiResponse<T>>(url, data, config);
    return response.data as ApiResponse<T>;
  }

  public async delete<T>(
    url: string, 
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.instance.delete<ApiResponse<T>>(url, config);
    return response.data as ApiResponse<T>;
  }

  public async patch<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.instance.patch<ApiResponse<T>>(url, data, config);
    return response.data as ApiResponse<T>;
  }
}

export const api = ApiClient.getInstance();
