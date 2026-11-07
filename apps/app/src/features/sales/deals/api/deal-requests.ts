import { z } from 'zod';

import type { HttpClient } from '@/lib/api/http-client';
import type { QueryParams } from '@/lib/api/query-string';

import { dealListSchema, dealResponseSchema, dealStageListSchema } from '../types';

export function getDeals(http: HttpClient, params: QueryParams, signal?: AbortSignal) {
  return http.request('/deals', dealListSchema, { params, signal });
}

export function getDeal(http: HttpClient, id: number, signal?: AbortSignal) {
  return http.request(`/deals/${id}`, dealResponseSchema, { signal });
}

/** Every stage in order, with how many deals sit in it and what they add up to. */
export function getDealPipeline(http: HttpClient, signal?: AbortSignal) {
  return http.request('/deals/pipeline', dealStageListSchema, { signal });
}

// Writes only need to know they worked; the lists refetch the real records.
const savedSchema = z.object({ data: z.object({ id: z.number() }) });

export function createDeal(http: HttpClient, body: unknown) {
  return http.request('/deals', savedSchema, { method: 'POST', body });
}

export function updateDeal(http: HttpClient, id: number, body: unknown) {
  return http.request(`/deals/${id}`, savedSchema, { method: 'PUT', body });
}

export function deleteDeal(http: HttpClient, id: number) {
  return http.request(`/deals/${id}`, z.undefined(), { method: 'DELETE' });
}

export function changeDealStage(
  http: HttpClient,
  id: number,
  body: { stage_id: number; lost_reason: string | null },
) {
  return http.request(`/deals/${id}/stage`, savedSchema, { method: 'POST', body });
}

export function assignDeal(http: HttpClient, id: number, ownerId: number) {
  return http.request(`/deals/${id}/assign`, savedSchema, {
    method: 'POST',
    body: { owner_id: ownerId },
  });
}
