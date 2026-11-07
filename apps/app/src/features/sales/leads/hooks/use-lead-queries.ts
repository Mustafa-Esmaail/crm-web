'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useLocale } from 'next-intl';

import { buildListParams } from '@/lib/api/list-params';
import { useHttpClient } from '@/shared/hooks/use-http-client';

import {
  getLead,
  getLeadActivities,
  getLeads,
  getLeadSources,
  getLeadStages,
} from '../api/lead-requests';
import { leadKeys } from '../constants';

export interface LeadListQuery {
  search: string;
  page: number;
  perPage: number;
  stageId?: string | null;
  sourceId?: string | null;
  ownerId?: string | null;
  teamId?: string | null;
  unassigned?: string | null;
}

export function useLeadsQuery(query: LeadListQuery) {
  const http = useHttpClient();
  const params = buildListParams({
    search: query.search,
    page: query.page,
    perPage: query.perPage,
    filters: {
      stage_id: query.stageId,
      source_id: query.sourceId,
      owner_id: query.ownerId,
      team_id: query.teamId,
      unassigned: query.unassigned,
    },
  });

  return useQuery({
    queryKey: leadKeys.list(params),
    queryFn: ({ signal }) => getLeads(http, params, signal),
    // Keep the old page on screen while the next one loads, so paging never flashes empty.
    placeholderData: keepPreviousData,
  });
}

export function useLeadQuery(id: number) {
  const http = useHttpClient();

  return useQuery({
    queryKey: leadKeys.detail(id),
    queryFn: ({ signal }) => getLead(http, id, signal),
    select: (response) => response.data,
  });
}

export function useLeadActivitiesQuery(id: number) {
  const http = useHttpClient();

  return useQuery({
    queryKey: leadKeys.activities(id),
    queryFn: ({ signal }) => getLeadActivities(http, id, signal),
    select: (response) => response.data,
  });
}

/** Pipeline stages in order; the first page of pickers and filters on every leads screen. */
export function useLeadStages() {
  const http = useHttpClient();
  const locale = useLocale();

  return useQuery({
    queryKey: leadKeys.stages(locale),
    queryFn: ({ signal }) => getLeadStages(http, signal),
    select: (response) => [...response.data].sort((a, b) => a.position - b.position),
    staleTime: 5 * 60_000,
  });
}

export function useLeadSources() {
  const http = useHttpClient();
  const locale = useLocale();

  return useQuery({
    queryKey: leadKeys.sources(locale),
    queryFn: ({ signal }) => getLeadSources(http, signal),
    select: (response) => response.data.filter((source) => source.is_active),
    staleTime: 5 * 60_000,
  });
}
