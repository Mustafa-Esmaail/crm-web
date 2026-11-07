'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useLocale } from 'next-intl';

import { buildListParams } from '@/lib/api/list-params';
import { useHttpClient } from '@/shared/hooks/use-http-client';

import { getUnits } from '../api/unit-requests';
import { unitKeys } from '../constants';

export interface UnitListQuery {
  search: string;
  page: number;
  perPage: number;
  projectId?: string | null;
  type?: string | null;
  status?: string | null;
}

export function useUnitsQuery(query: UnitListQuery) {
  const http = useHttpClient();
  const locale = useLocale();
  const params = buildListParams({
    search: query.search,
    page: query.page,
    perPage: query.perPage,
    filters: { project_id: query.projectId, type: query.type, status: query.status },
  });

  return useQuery({
    queryKey: unitKeys.list({ ...params, locale }),
    queryFn: ({ signal }) => getUnits(http, params, signal),
    placeholderData: keepPreviousData,
  });
}
