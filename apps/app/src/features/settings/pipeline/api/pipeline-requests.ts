import { z } from 'zod';

import type { HttpClient } from '@/lib/api/http-client';

import { ruleListSchema, settingListSchema } from '../types';

const savedSchema = z.object({ data: z.object({ id: z.number() }) });

/** `path` is an endpoint collection such as `lead-stages` or `lead-distribution-rules`. */
export function getSettings(http: HttpClient, path: string, signal?: AbortSignal) {
  return http.request(`/${path}`, settingListSchema, { signal });
}

export function getRules(http: HttpClient, signal?: AbortSignal) {
  return http.request('/lead-distribution-rules', ruleListSchema, { signal });
}

export function saveRecord(http: HttpClient, path: string, id: number | undefined, body: unknown) {
  return id === undefined
    ? http.request(`/${path}`, savedSchema, { method: 'POST', body })
    : http.request(`/${path}/${id}`, savedSchema, { method: 'PUT', body });
}

export function deleteRecord(http: HttpClient, path: string, id: number) {
  return http.request(`/${path}/${id}`, z.undefined(), { method: 'DELETE' });
}
