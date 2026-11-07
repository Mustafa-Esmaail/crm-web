import { z } from 'zod';

import type { HttpClient } from '@/lib/api/http-client';
import type { QueryParams } from '@/lib/api/query-string';

import { departmentListSchema, departmentResponseSchema, departmentTreeSchema } from '../types';

export function getDepartments(http: HttpClient, params: QueryParams, signal?: AbortSignal) {
  return http.request('/departments', departmentListSchema, { params, signal });
}

export function getDepartmentTree(http: HttpClient, signal?: AbortSignal) {
  return http.request('/departments/tree', departmentTreeSchema, { signal });
}

export function createDepartment(http: HttpClient, body: unknown) {
  return http.request('/departments', departmentResponseSchema, { method: 'POST', body });
}

/** Also used to move a department: the API treats the body as a partial update. */
export function updateDepartment(http: HttpClient, id: number, body: unknown) {
  return http.request(`/departments/${id}`, departmentResponseSchema, { method: 'PUT', body });
}

export function deleteDepartment(http: HttpClient, id: number) {
  return http.request(`/departments/${id}`, z.undefined(), { method: 'DELETE' });
}
