'use client';

import { currentUserResponseSchema } from '@crm/api-client';
import { useQuery } from '@tanstack/react-query';
import { type ReactNode, useMemo } from 'react';

import { AuthContext } from '@/shared/hooks/use-current-user';
import { useHttpClient } from '@/shared/hooks/use-http-client';

export const CURRENT_USER_QUERY_KEY = ['auth', 'me'] as const;

export function AuthProvider({ children }: { children: ReactNode }) {
  const http = useHttpClient();

  const { data, isLoading } = useQuery({
    queryKey: CURRENT_USER_QUERY_KEY,
    queryFn: ({ signal }) => http.request('/auth/me', currentUserResponseSchema, { signal }),
  });

  const value = useMemo(() => ({ user: data?.data, isLoading }), [data, isLoading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
