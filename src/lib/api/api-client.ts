import { ApiResponse } from '@/interfaces/ApiResponse';
import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from 'axios';

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

  constructor(
    message: string,
    status: number,
    data: ServerErrorResponse | unknown = {}
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;

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
      const { statusCode, message, ...rest } =
        error.response.data as ServerErrorResponse;
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
      (error as unknown).status || 0,
      (error as unknown).data || {}
    );
  }
}

class ApiClient {
  private instance: AxiosInstance;
  private static _instance: ApiClient;
  private isRefreshing = false;
  private failedQueue: {
    resolve: (value?: unknown) => void;
    reject: (error?: unknown) => void;
  }[] = [];

  private constructor() {
    this.instance = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true, // importante si usas cookies httpOnly
    });

    this.initializeInterceptors();
  }

  public static getInstance(): ApiClient {
    if (!ApiClient._instance) {
      ApiClient._instance = new ApiClient();
    }
    return ApiClient._instance;
  }

  private processQueue(error: unknown, token: string | null = null) {
    this.failedQueue.forEach((prom) => {
      if (error) {
        prom.reject(error);
      } else {
        prom.resolve(token);
      }
    });

    this.failedQueue = [];
  }

  private initializeInterceptors() {
    // Request interceptor
    this.instance.interceptors.request.use(
      (config) => {
        if (typeof window !== 'undefined') {
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
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.instance.interceptors.response.use(
      (response: AxiosResponse<ApiResponse<unknown>>) => {
        const { data } = response;
        if (data && typeof data === 'object' && 'data' in data) {
          return {
            ...response,
            data: data.data,
          };
        }
        throw new ApiError(
          'Unexpected successful response format',
          response.status || 500,
          data || response
        );
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & {
          _retry?: boolean;
        };

        // Manejo de token expirado (ejemplo 401)
        if (
          error.response?.status === 401 &&
          !originalRequest._retry &&
          typeof window !== 'undefined'
        ) {
          if (this.isRefreshing) {
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            })
              .then((token) => {
                if (originalRequest.headers && token) {
                  originalRequest.headers.Authorization = `Bearer ${token}`;
                }
                return this.instance(originalRequest);
              })
              .catch((err) => Promise.reject(err));
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const authData = localStorage.getItem('auth');
            const { refreshToken } = authData ? JSON.parse(authData) : {};

            if (!refreshToken) throw new Error('No refresh token found');

            // 🔄 Llamar al endpoint de refresh del backend
            const { data } = await this.instance.post<{
              accessToken: string;
            }>('/admin/auth/refresh', { refreshToken });

            const newAccessToken = data?.accessToken;

            if (newAccessToken) {
              const parsed = authData ? JSON.parse(authData) : {};
              localStorage.setItem(
                'auth',
                JSON.stringify({ ...parsed, accessToken: newAccessToken })
              );

              this.processQueue(null, newAccessToken);

              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
              }
              return this.instance(originalRequest);
            }
          } catch (err) {
            this.processQueue(err, null);
            localStorage.removeItem('auth');
            window.location.href = '/login';
            return Promise.reject(err);
          } finally {
            this.isRefreshing = false;
          }
        }

        return Promise.reject(ApiError.fromServerError(error));
      }
    );
  }

  // Métodos HTTP
  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.instance.get<ApiResponse<T>>(url, config);
    return response.data;
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

  public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
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
