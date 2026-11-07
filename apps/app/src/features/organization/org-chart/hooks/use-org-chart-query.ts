'use client';

import { useQuery } from '@tanstack/react-query';

import { useHttpClient } from '@/shared/hooks/use-http-client';

import { getOrgChart } from '../api/org-chart-requests';
import { orgChartKeys } from '../constants';

/** The reporting-line tree of active employees, optionally limited to one manager's branch. */
export function useOrgChartQuery(rootId?: number) {
  const http = useHttpClient();

  return useQuery({
    queryKey: orgChartKeys.tree(rootId),
    queryFn: ({ signal }) => getOrgChart(http, rootId, signal),
    select: (response) => response.data,
  });
}
