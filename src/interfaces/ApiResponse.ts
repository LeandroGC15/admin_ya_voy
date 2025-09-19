/**
 * Standard API response format for all API calls
 * @template T - Type of the data payload
 */
export interface  ApiResponse<T> {
  data: T;
  message: string;
  statusCode: number;
  timestamp: string;
  path: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  error?: {
    code: string;
    details?: string;
    metadata?: Record<string, unknown>;
  };
}