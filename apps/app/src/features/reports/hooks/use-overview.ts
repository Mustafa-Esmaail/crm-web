'use client';

import { useQuery } from '@tanstack/react-query';
import { useLocale } from 'next-intl';

import { useHttpClient } from '@/shared/hooks/use-http-client';

import { agentPerformanceSchema, overviewSchema } from '../types';

export const PERIODS = ['7', '30', '90', 'all'] as const;
export type Period = (typeof PERIODS)[number];

function fromDate(period: Period): string | undefined {
  if (period === 'all') return undefined;
  const date = new Date();
  date.setDate(date.getDate() - Number(period));
  return date.toISOString();
}

export function useOverview(period: Period, enabled: boolean) {
  const http = useHttpClient();
  const locale = useLocale();

  return useQuery({
    queryKey: ['reports', 'overview', period, locale],
    enabled,
    queryFn: ({ signal }) => {
      const from = fromDate(period);
      return http.request('/reports/overview', overviewSchema, {
        params: from ? { from } : {},
        signal,
      });
    },
    select: (response) => response.data,
  });
}

/** Per-employee leads and deals over the same period; the API limits rows to the viewer's scope. */
export function useAgentPerformance(period: Period, enabled: boolean) {
  const http = useHttpClient();
  const locale = useLocale();

  return useQuery({
    queryKey: ['reports', 'agent-performance', period, locale],
    enabled,
    queryFn: ({ signal }) => {
      const from = fromDate(period);
      return http.request('/reports/agent-performance', agentPerformanceSchema, {
        params: from ? { from } : {},
        signal,
      });
    },
    select: (response) => response.data,
  });
}
