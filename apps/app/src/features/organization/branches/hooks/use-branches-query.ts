'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { buildListParams, type ListQuery } from '@/lib/api/list-params';
import { useHttpClient } from '@/shared/hooks/use-http-client';

import { getBranches } from '../api/branch-requests';
import { branchKeys } from '../constants';

export function useBranchesQuery(query: ListQuery) {
  const http = useHttpClient();
  const params = buildListParams(query);

  return useQuery({
    queryKey: branchKeys.list(params),
    queryFn: ({ signal }) => getBranches(http, params, signal),
    // Keep the old page on screen while the next one loads, so paging never flashes empty.
    placeholderData: keepPreviousData,
  });
}
