import { z } from 'zod';

import type { HttpClient } from '@/lib/api/http-client';
import type { QueryParams } from '@/lib/api/query-string';

import { branchListSchema, branchResponseSchema } from '../types';

export function getBranches(http: HttpClient, params: QueryParams, signal?: AbortSignal) {
  return http.request('/branches', branchListSchema, { params, signal });
}

export function createBranch(http: HttpClient, body: unknown) {
  return http.request('/branches', branchResponseSchema, { method: 'POST', body });
}

export function updateBranch(http: HttpClient, id: number, body: unknown) {
  return http.request(`/branches/${id}`, branchResponseSchema, { method: 'PUT', body });
}

export function deleteBranch(http: HttpClient, id: number) {
  // 204 No Content: there is no body to validate.
  return http.request(`/branches/${id}`, z.undefined(), { method: 'DELETE' });
}
