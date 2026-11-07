import { z } from 'zod';

import type { HttpClient } from '@/lib/api/http-client';
import type { QueryParams } from '@/lib/api/query-string';

import { testDriveListSchema, vehicleListSchema } from '../types';

const savedSchema = z.object({ data: z.object({ id: z.number() }) });

export function getVehicles(http: HttpClient, params: QueryParams, signal?: AbortSignal) {
  return http.request('/automotive/vehicles', vehicleListSchema, { params, signal });
}

export function saveVehicle(http: HttpClient, id: number | undefined, body: unknown) {
  return id === undefined
    ? http.request('/automotive/vehicles', savedSchema, { method: 'POST', body })
    : http.request(`/automotive/vehicles/${id}`, savedSchema, { method: 'PUT', body });
}

export function deleteVehicle(http: HttpClient, id: number) {
  return http.request(`/automotive/vehicles/${id}`, z.undefined(), { method: 'DELETE' });
}

export function getTestDrives(http: HttpClient, params: QueryParams, signal?: AbortSignal) {
  return http.request('/automotive/test-drives', testDriveListSchema, { params, signal });
}

export function saveTestDrive(http: HttpClient, id: number | undefined, body: unknown) {
  return id === undefined
    ? http.request('/automotive/test-drives', savedSchema, { method: 'POST', body })
    : http.request(`/automotive/test-drives/${id}`, savedSchema, { method: 'PUT', body });
}

export function deleteTestDrive(http: HttpClient, id: number) {
  return http.request(`/automotive/test-drives/${id}`, z.undefined(), { method: 'DELETE' });
}
