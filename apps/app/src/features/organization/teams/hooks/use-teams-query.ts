'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { buildListParams, type ListQuery } from '@/lib/api/list-params';
import { useHttpClient } from '@/shared/hooks/use-http-client';

import { getTeams } from '../api/team-requests';
import { teamKeys } from '../constants';

export function useTeamsQuery(query: ListQuery) {
  const http = useHttpClient();
  const params = buildListParams(query);

  return useQuery({
    queryKey: teamKeys.list(params),
    queryFn: ({ signal }) => getTeams(http, params, signal),
    placeholderData: keepPreviousData,
  });
}
