'use client';

import type { CurrentUser } from '@crm/api-client';
import { createContext, useContext } from 'react';

export interface AuthContextValue {
  user: CurrentUser | undefined;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

function useAuthContext(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('Auth hooks must be used inside <AuthProvider>.');
  return context;
}

export function useCurrentUser(): AuthContextValue {
  return useAuthContext();
}
