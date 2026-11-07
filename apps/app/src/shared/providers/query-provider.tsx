'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { type ReactNode, useState } from 'react';

import { createQueryClient } from '@/lib/query/query-client';

export function QueryProvider({ children }: { children: ReactNode }) {
  // useState keeps one client per browser session without sharing it across SSR requests.
  const [client] = useState(createQueryClient);
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
