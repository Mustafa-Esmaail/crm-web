import { z } from 'zod';

import type { HttpClient } from '@/lib/api/http-client';

import {
  catalogSchema,
  fieldRowsSchema,
  permissionMatrixSchema,
  roleListSchema,
  roleResponseSchema,
  scopeRowsSchema,
} from '../types';

export function getRoles(http: HttpClient, signal?: AbortSignal) {
  return http.request('/roles', roleListSchema, { signal });
}

export function getRole(http: HttpClient, id: number, signal?: AbortSignal) {
  return http.request(`/roles/${id}`, roleResponseSchema, { signal });
}

export function createRole(http: HttpClient, body: unknown) {
  return http.request('/roles', roleResponseSchema, { method: 'POST', body });
}

export function updateRole(http: HttpClient, id: number, body: unknown) {
  return http.request(`/roles/${id}`, roleResponseSchema, { method: 'PUT', body });
}

export function deleteRole(http: HttpClient, id: number) {
  return http.request(`/roles/${id}`, z.undefined(), { method: 'DELETE' });
}

export function getEmployeeRoles(http: HttpClient, employeeId: number, signal?: AbortSignal) {
  return http.request(`/employees/${employeeId}/roles`, roleListSchema, { signal });
}

/** Replaces the employee's roles with exactly these; the API answers with the new list. */
export function syncEmployeeRoles(http: HttpClient, employeeId: number, roleIds: number[]) {
  return http.request(`/employees/${employeeId}/roles`, roleListSchema, {
    method: 'PUT',
    body: { role_ids: roleIds },
  });
}

export function getCatalog(http: HttpClient, signal?: AbortSignal) {
  return http.request('/permissions', catalogSchema, { signal });
}

export function getRoleMatrix(http: HttpClient, id: number, signal?: AbortSignal) {
  return http.request(`/roles/${id}/permissions`, permissionMatrixSchema, { signal });
}

export function getRoleScopes(http: HttpClient, id: number, signal?: AbortSignal) {
  return http.request(`/roles/${id}/scopes`, scopeRowsSchema, { signal });
}

export function getRoleFields(http: HttpClient, id: number, signal?: AbortSignal) {
  return http.request(`/roles/${id}/field-permissions`, fieldRowsSchema, { signal });
}

// Each save answers with the whole updated state, so the caller can put it straight in the cache.
export function saveRolePermissions(http: HttpClient, id: number, permissions: string[]) {
  return http.request(`/roles/${id}/permissions`, permissionMatrixSchema, {
    method: 'PUT',
    body: { permissions },
  });
}

export function saveRoleScopes(http: HttpClient, id: number, scopes: Record<string, string>) {
  return http.request(`/roles/${id}/scopes`, scopeRowsSchema, { method: 'PUT', body: { scopes } });
}

export function saveRoleFields(
  http: HttpClient,
  id: number,
  fields: Record<string, Record<string, string>>,
) {
  return http.request(`/roles/${id}/field-permissions`, fieldRowsSchema, {
    method: 'PUT',
    body: { fields },
  });
}
