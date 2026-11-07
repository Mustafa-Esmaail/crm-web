import { z } from 'zod';

import type { HttpClient } from '@/lib/api/http-client';
import type { QueryParams } from '@/lib/api/query-string';

import { teamListSchema, teamResponseSchema } from '../types';

export function getTeams(http: HttpClient, params: QueryParams, signal?: AbortSignal) {
  return http.request('/teams', teamListSchema, { params, signal });
}

export function createTeam(http: HttpClient, body: unknown) {
  return http.request('/teams', teamResponseSchema, { method: 'POST', body });
}

export function updateTeam(http: HttpClient, id: number, body: unknown) {
  return http.request(`/teams/${id}`, teamResponseSchema, { method: 'PUT', body });
}

export function deleteTeam(http: HttpClient, id: number) {
  return http.request(`/teams/${id}`, z.undefined(), { method: 'DELETE' });
}
