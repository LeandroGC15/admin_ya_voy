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
          return response.data.data;
        }
        return response.data || response;
      },
      (error: AxiosError) => {
        return Promise.reject(ApiError.fromServerError(error));
      }
    );
  }

  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.instance.get<ApiResponse<T>>(url, config);
    return response.data
  }

  public async post<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.instance.post<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  public async put<T>(
    url: string, 
    data?: unknown, 
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.instance.put<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  public async delete<T>(
    url: string, 
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.instance.delete<ApiResponse<T>>(url, config);
    return response.data;
  }

  public async patch<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.instance.patch<ApiResponse<T>>(url, data, config);
    return response.data;
  }
}

export const api = ApiClient.getInstance();
