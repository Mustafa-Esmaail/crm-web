import { z } from 'zod';

import type { HttpClient } from '@/lib/api/http-client';
import type { QueryParams } from '@/lib/api/query-string';

import { projectListSchema } from '../types';

const savedSchema = z.object({ data: z.object({ id: z.number() }) });

export function getProjects(http: HttpClient, params: QueryParams, signal?: AbortSignal) {
  return http.request('/real-estate/projects', projectListSchema, { params, signal });
}

export function createProject(http: HttpClient, body: unknown) {
  return http.request('/real-estate/projects', savedSchema, { method: 'POST', body });
}

export function updateProject(http: HttpClient, id: number, body: unknown) {
  return http.request(`/real-estate/projects/${id}`, savedSchema, { method: 'PUT', body });
}

export function deleteProject(http: HttpClient, id: number) {
  return http.request(`/real-estate/projects/${id}`, z.undefined(), { method: 'DELETE' });
}
