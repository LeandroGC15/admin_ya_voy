import { ApiResponse } from '@/interfaces/ApiResponse';
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

interface ServerErrorResponse {
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

  static fromServerError(error: any): ApiError {
    if (error.response?.data) {
      const { statusCode, message, ...rest } = error.response.data;
      return new ApiError(message || 'An error occurred', statusCode || error.response.status, rest);
    }
    
    if (error instanceof ApiError) {
      return error;
    }
    
    return new ApiError(
      error.message || 'An unknown error occurred',
      error.status || 0,
      error.data || {}
    );
  }
}

class ApiClient {
  private instance: AxiosInstance;
  private static _instance: ApiClient;

  private constructor() {
    this.instance = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
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
        const token = localStorage.getItem('accessToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => {
        // If the response has a data property, return it directly
        if (response.data && typeof response.data === 'object' && 'data' in response.data) {
          return response.data.data; // This is T
        }
        // If we reach here, the response format is unexpected for a successful call.
        // Treat this as an error as the expected ApiResponse<T> wrapper is missing.
        throw new ApiError(
          response.data?.message || 'Unexpected successful response format',
          response.status || 500,
          response.data || response
        );
      },
      (error: AxiosError) => {
        return Promise.reject(ApiError.fromServerError(error));
      }
    );
  }

  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.get<any>(url, config);
    return response as T
  }

  public async post<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.instance.post<any>(url, data, config);
    return response as T;
  }

  public async put<T>(
    url: string, 
    data?: unknown, 
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.instance.put<any>(url, data, config);
    return response as T;
  }

  public async delete<T>(
    url: string, 
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.instance.delete<any>(url, config);
    return response as T;
  }

  public async patch<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.instance.patch<any>(url, data, config);
    return response as T;
  }
}

export const api = ApiClient.getInstance();
