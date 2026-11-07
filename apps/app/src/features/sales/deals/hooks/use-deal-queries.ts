'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useLocale } from 'next-intl';

import { buildListParams } from '@/lib/api/list-params';
import { useHttpClient } from '@/shared/hooks/use-http-client';

import { getDeal, getDealPipeline, getDeals } from '../api/deal-requests';
import { dealKeys } from '../constants';

export interface DealListQuery {
  search: string;
  page: number;
  perPage: number;
  stageId?: string | null;
  status?: string | null;
  ownerId?: string | null;
}

export function useDealsQuery(query: DealListQuery) {
  const http = useHttpClient();
  const params = buildListParams({
    search: query.search,
    page: query.page,
    perPage: query.perPage,
    filters: { stage_id: query.stageId, status: query.status, owner_id: query.ownerId },
  });

  return useQuery({
    queryKey: dealKeys.list(params),
    queryFn: ({ signal }) => getDeals(http, params, signal),
    // Keep the old page on screen while the next one loads, so paging never flashes empty.
    placeholderData: keepPreviousData,
  });
}

/** Stages in order with their deal counts and totals: the board's columns and the stage pickers. */
export function useDealPipeline() {
  const http = useHttpClient();
  const locale = useLocale();

  return useQuery({
    queryKey: dealKeys.pipeline(locale),
    queryFn: ({ signal }) => getDealPipeline(http, signal),
    select: (response) => [...response.data].sort((a, b) => a.position - b.position),
  });
}

export function useDealQuery(id: number) {
  const http = useHttpClient();
  const locale = useLocale();

  return useQuery({
    queryKey: [...dealKeys.detail(id), locale],
    queryFn: ({ signal }) => getDeal(http, id, signal),
    select: (response) => response.data,
  });
}
