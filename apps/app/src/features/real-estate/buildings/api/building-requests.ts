import { z } from 'zod';

import type { HttpClient } from '@/lib/api/http-client';
import type { QueryParams } from '@/lib/api/query-string';

import { buildingListSchema } from '../types';

const savedSchema = z.object({ data: z.object({ id: z.number() }) });

export function getBuildings(http: HttpClient, params: QueryParams, signal?: AbortSignal) {
  return http.request('/real-estate/buildings', buildingListSchema, { params, signal });
}

export function saveBuilding(http: HttpClient, id: number | undefined, body: unknown) {
  return id === undefined
    ? http.request('/real-estate/buildings', savedSchema, { method: 'POST', body })
    : http.request(`/real-estate/buildings/${id}`, savedSchema, { method: 'PUT', body });
}

export function deleteBuilding(http: HttpClient, id: number) {
  return http.request(`/real-estate/buildings/${id}`, z.undefined(), { method: 'DELETE' });
}
