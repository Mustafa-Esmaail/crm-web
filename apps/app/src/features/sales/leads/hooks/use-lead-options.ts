'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { buildListParams } from '@/lib/api/list-params';
import type { AsyncOptionsResult } from '@/shared/components/form/async-select-field';
import { useHttpClient } from '@/shared/hooks/use-http-client';

import { getLead, getLeads } from '../api/lead-requests';
import { leadKeys } from '../constants';

const OPTIONS_PAGE_SIZE = 20;

/** Searchable leads for pickers (e.g. "which lead is this deal for?"); the server does the search. */
export function useLeadOptions(search: string): AsyncOptionsResult {
  const http = useHttpClient();
  const params = buildListParams({ search, perPage: OPTIONS_PAGE_SIZE });

  const query = useQuery({
    queryKey: leadKeys.list({ ...params, purpose: 'options' }),
    queryFn: ({ signal }) => getLeads(http, params, signal),
    placeholderData: keepPreviousData,
  });

  return {
    options: (query.data?.data ?? []).map((lead) => ({
      value: String(lead.id),
      label: lead.phone ? `${lead.name} · ${lead.phone}` : lead.name,
    })),
    isLoading: query.isLoading,
  };
}

/** A lead's name for an id held elsewhere (a deal's `lead_id`), or undefined while unknown. */
export function useLeadName(id: number | null | undefined): string | undefined {
  const http = useHttpClient();

  return useQuery({
    queryKey: leadKeys.detail(id ?? 0),
    queryFn: ({ signal }) => getLead(http, id ?? 0, signal),
    select: (response) => response.data.name,
    enabled: id !== null && id !== undefined,
  }).data;
}
