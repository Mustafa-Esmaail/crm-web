'use client';

import { useQuery } from '@tanstack/react-query';

import { buildListParams } from '@/lib/api/list-params';
import { useHttpClient } from '@/shared/hooks/use-http-client';

import { getBranches } from '../api/branch-requests';
import { branchKeys } from '../constants';

/** Total number of branches, for dashboard-style counters. */
export function useBranchesCount(): { total: number | undefined; isLoading: boolean } {
  const http = useHttpClient();
  const params = buildListParams({ perPage: 1 });

  const query = useQuery({
    queryKey: branchKeys.list({ ...params, purpose: 'count' }),
    queryFn: ({ signal }) => getBranches(http, params, signal),
    select: (response) => response.meta.total,
  });

  return { total: query.data, isLoading: query.isLoading };
}
