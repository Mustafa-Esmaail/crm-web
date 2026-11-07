import type { HttpClient } from '@/lib/api/http-client';

import { orgChartResponseSchema } from '../types';

export function getOrgChart(http: HttpClient, rootId?: number, signal?: AbortSignal) {
  return http.request('/org-chart', orgChartResponseSchema, {
    params: { root_id: rootId },
    signal,
  });
}
