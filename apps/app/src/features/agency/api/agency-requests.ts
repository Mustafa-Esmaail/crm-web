import { z } from 'zod';

import type { HttpClient } from '@/lib/api/http-client';
import type { QueryParams } from '@/lib/api/query-string';

import { engagementListSchema, packageListSchema } from '../types';

const savedSchema = z.object({ data: z.object({ id: z.number() }) });

export function getPackages(http: HttpClient, params: QueryParams, signal?: AbortSignal) {
  return http.request('/agency/packages', packageListSchema, { params, signal });
}

export function savePackage(http: HttpClient, id: number | undefined, body: unknown) {
  return id === undefined
    ? http.request('/agency/packages', savedSchema, { method: 'POST', body })
    : http.request(`/agency/packages/${id}`, savedSchema, { method: 'PUT', body });
}

export function deletePackage(http: HttpClient, id: number) {
  return http.request(`/agency/packages/${id}`, z.undefined(), { method: 'DELETE' });
}

export function getEngagements(http: HttpClient, params: QueryParams, signal?: AbortSignal) {
  return http.request('/agency/engagements', engagementListSchema, { params, signal });
}

export function saveEngagement(http: HttpClient, id: number | undefined, body: unknown) {
  return id === undefined
    ? http.request('/agency/engagements', savedSchema, { method: 'POST', body })
    : http.request(`/agency/engagements/${id}`, savedSchema, { method: 'PUT', body });
}

export function deleteEngagement(http: HttpClient, id: number) {
  return http.request(`/agency/engagements/${id}`, z.undefined(), { method: 'DELETE' });
}
