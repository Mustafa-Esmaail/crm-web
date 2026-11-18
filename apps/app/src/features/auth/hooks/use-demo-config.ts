'use client';

import { useQuery } from '@tanstack/react-query';

import { useHttpClient } from '@/shared/hooks/use-http-client';

import { getDemoConfig } from '../api/demo-requests';

export const demoConfigKey = ['auth', 'demo'] as const;

/** Whether the API offers the demo; while it loads, or if it fails, the login page simply shows none. */
export function useDemoConfig() {
  const http = useHttpClient();

  return useQuery({
    queryKey: demoConfigKey,
    queryFn: ({ signal }) => getDemoConfig(http, signal),
    select: (response) => response.data,
    staleTime: 5 * 60_000,
    retry: false,
  });
}
