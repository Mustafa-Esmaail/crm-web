'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useLocale } from 'next-intl';

import { buildListParams, type ListQuery } from '@/lib/api/list-params';
import type { AsyncOptionsResult } from '@/shared/components/form/async-select-field';
import { useHttpClient } from '@/shared/hooks/use-http-client';

import { getEngagements, getPackages } from '../api/agency-requests';
import { agencyKeys } from '../constants';

export function usePackagesQuery(query: ListQuery, enabled: boolean) {
  const http = useHttpClient();
  const locale = useLocale();
  const params = buildListParams(query);

  return useQuery({
    queryKey: agencyKeys.packages({ ...params, locale }),
    queryFn: ({ signal }) => getPackages(http, params, signal),
    placeholderData: keepPreviousData,
    enabled,
  });
}

/** Searchable packages for pickers and filters; `activeOnly` for signing (the API refuses inactive). */
export function usePackageOptions(search: string, activeOnly = false): AsyncOptionsResult {
  const http = useHttpClient();
  const locale = useLocale();
  const params = buildListParams({
    search,
    perPage: 20,
    filters: activeOnly ? { is_active: 1 } : {},
  });

  const query = useQuery({
    queryKey: agencyKeys.packages({ ...params, locale, purpose: 'options' }),
    queryFn: ({ signal }) => getPackages(http, params, signal),
    placeholderData: keepPreviousData,
  });

  return {
    options: (query.data?.data ?? []).map((pkg) => ({
      value: String(pkg.id),
      label: pkg.code ? `${pkg.name} · ${pkg.code}` : pkg.name,
    })),
    isLoading: query.isLoading,
  };
}

export const useActivePackageOptions = (search: string) => usePackageOptions(search, true);

export function useEngagementsQuery(query: ListQuery, enabled: boolean) {
  const http = useHttpClient();
  const locale = useLocale();
  const params = buildListParams(query);

  return useQuery({
    queryKey: agencyKeys.engagements({ ...params, locale }),
    queryFn: ({ signal }) => getEngagements(http, params, signal),
    placeholderData: keepPreviousData,
    enabled,
  });
}
