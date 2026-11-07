'use client';

import { createContext, useContext } from 'react';

import type { HttpClient } from '@/lib/api/http-client';

export const HttpClientContext = createContext<HttpClient | null>(null);

export function useHttpClient(): HttpClient {
  const client = useContext(HttpClientContext);
  if (!client) throw new Error('useHttpClient must be used inside <HttpProvider>.');
  return client;
}
