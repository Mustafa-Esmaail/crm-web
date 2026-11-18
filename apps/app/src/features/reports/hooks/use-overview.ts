'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useLocale } from 'next-intl';
import type { z } from 'zod';

import type { QueryParams } from '@/lib/api/query-string';
import { useHttpClient } from '@/shared/hooks/use-http-client';

import {
  activitiesSchema,
  agentPerformanceSchema,
  overviewSchema,
  salesSchema,
  scorecardSchema,
  teamsSchema,
} from '../types';

export const PERIODS = ['7', '30', '90', '365', 'all', 'custom'] as const;
export type Period = (typeof PERIODS)[number];

/** What every report is narrowed to. The API applies the viewer's data scope on top. */
export interface ReportFilters {
  period: Period;
  /** yyyy-mm-dd, used when period is "custom". */
  from?: string;
  to?: string;
  employeeId?: string | null;
  teamId?: string | null;
}

function toDateString(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

/** Query params for the API; preset periods end today and start N days back (today included). */
export function toReportParams(filters: ReportFilters): QueryParams {
  const params: QueryParams = {};

  if (filters.period === 'custom') {
    if (filters.from) params.from = filters.from;
    if (filters.to) params.to = filters.to;
  } else if (filters.period !== 'all') {
    const from = new Date();
    from.setDate(from.getDate() - Number(filters.period) + 1);
    params.from = toDateString(from);
    params.to = toDateString(new Date());
  }

  if (filters.employeeId) params.employee_id = filters.employeeId;
  if (filters.teamId) params.team_id = filters.teamId;

  return params;
}

function useReport<TSchema extends z.ZodType<{ data: unknown }>>(
  name: string,
  path: string,
  schema: TSchema,
  filters: ReportFilters,
  enabled: boolean,
) {
  const http = useHttpClient();
  const locale = useLocale();
  const params = toReportParams(filters);

  return useQuery({
    queryKey: ['reports', name, path, params, locale],
    enabled,
    placeholderData: keepPreviousData,
    queryFn: ({ signal }) => http.request(path, schema, { params, signal }),
    select: (response) => response.data as z.infer<TSchema>['data'],
  });
}

export function useOverview(filters: ReportFilters, enabled: boolean) {
  return useReport('overview', '/reports/overview', overviewSchema, filters, enabled);
}

export function useSales(filters: ReportFilters, enabled: boolean) {
  return useReport('sales', '/reports/sales', salesSchema, filters, enabled);
}

export function useActivities(filters: ReportFilters, enabled: boolean) {
  return useReport('activities', '/reports/activities', activitiesSchema, filters, enabled);
}

/** Per-employee sales, activity, response speed, pipeline health and tasks. */
export function useAgentPerformance(filters: ReportFilters, enabled: boolean) {
  return useReport(
    'agent-performance',
    '/reports/agent-performance',
    agentPerformanceSchema,
    filters,
    enabled,
  );
}

export function useTeamsReport(filters: ReportFilters, enabled: boolean) {
  return useReport('teams', '/reports/teams', teamsSchema, filters, enabled);
}

/** One employee's scorecard; without an id, the signed-in user's own (needs no permission). */
export function useScorecard(employeeId: number | null, filters: ReportFilters) {
  const path = employeeId === null ? '/reports/me' : `/reports/employees/${employeeId}`;
  return useReport('scorecard', path, scorecardSchema, { ...filters, employeeId: null }, true);
}
