import { isApiError } from '@crm/api-client';
import { QueryClient } from '@tanstack/react-query';

const STALE_TIME_MS = 30_000;

// Retrying a 4xx can never succeed (and would replay 401/403/422), so only transient failures retry.
function shouldRetry(failureCount: number, error: unknown): boolean {
  if (isApiError(error) && error.status >= 400 && error.status < 500) return false;
  return failureCount < 2;
}

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { staleTime: STALE_TIME_MS, retry: shouldRetry, refetchOnWindowFocus: false },
      mutations: { retry: false },
    },
  });
}
