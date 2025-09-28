import { useQuery, useMutation, useQueryClient, QueryClient, DefaultOptions } from '@tanstack/react-query';
import { api } from './api-client';

// QueryClient configuration
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        return failureCount < 3;
      },
    },
  },
});

// Types for API functions
export interface ApiQueryOptions {
  enabled?: boolean;
  refetchOnWindowFocus?: boolean;
  refetchOnMount?: boolean;
  staleTime?: number;
  cacheTime?: number;
}

export interface ApiMutationOptions<TData = unknown, TVariables = unknown> {
  onSuccess?: (data: TData) => void;
  onError?: (error: any) => void;
  onSettled?: () => void;
}

// Custom hook for API queries with automatic token handling
export function useApiQuery<TData = unknown>(
  queryKey: string[],
  queryFn: () => Promise<TData>,
  options: ApiQueryOptions = {}
) {
  return useQuery({
    queryKey,
    queryFn,
    enabled: options.enabled !== false,
    refetchOnWindowFocus: options.refetchOnWindowFocus ?? true,
    refetchOnMount: options.refetchOnMount ?? true,
    staleTime: options.staleTime ?? 5 * 60 * 1000,
    ...options,
  });
}

// Custom hook for API mutations with automatic token handling
export function useApiMutation<TData = unknown, TVariables = unknown>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options: ApiMutationOptions<TData, TVariables> = {}
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: (data) => {
      options.onSuccess?.(data);
    },
    onError: (error) => {
      options.onError?.(error);
    },
    onSettled: () => {
      options.onSettled?.();
    },
  });
}

// Utility function to create query keys
export function createQueryKey(...keys: (string | number | undefined)[]): string[] {
  return keys.filter(Boolean) as string[];
}

// Utility function to invalidate queries
export function invalidateQueries(queryKey: string[]) {
  queryClient.invalidateQueries({ queryKey });
}

// Utility function to update cache
export function updateQueryData<TData = unknown>(
  queryKey: string[],
  updater: (oldData: TData | undefined) => TData
) {
  queryClient.setQueryData(queryKey, updater);
}
