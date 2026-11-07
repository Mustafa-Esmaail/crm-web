import { z } from 'zod';

import type { HttpClient } from '@/lib/api/http-client';
import type { QueryParams } from '@/lib/api/query-string';

import { unitListSchema } from '../types';

const savedSchema = z.object({ data: z.object({ id: z.number() }) });

export function getUnits(http: HttpClient, params: QueryParams, signal?: AbortSignal) {
  return http.request('/real-estate/units', unitListSchema, { params, signal });
}

export function createUnit(http: HttpClient, body: unknown) {
  return http.request('/real-estate/units', savedSchema, { method: 'POST', body });
}

export function updateUnit(http: HttpClient, id: number, body: unknown) {
  return http.request(`/real-estate/units/${id}`, savedSchema, { method: 'PUT', body });
}

export function deleteUnit(http: HttpClient, id: number) {
  return http.request(`/real-estate/units/${id}`, z.undefined(), { method: 'DELETE' });
}

export function reserveUnit(http: HttpClient, id: number, body: unknown) {
  return http.request(`/real-estate/units/${id}/reserve`, savedSchema, { method: 'POST', body });
}

export function releaseUnit(http: HttpClient, id: number) {
  return http.request(`/real-estate/units/${id}/release`, savedSchema, { method: 'POST' });
}

export function sellUnit(http: HttpClient, id: number) {
  return http.request(`/real-estate/units/${id}/sell`, savedSchema, { method: 'POST' });
}
