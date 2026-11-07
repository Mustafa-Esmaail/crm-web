import { z } from 'zod';

import type { HttpClient } from '@/lib/api/http-client';
import type { QueryParams } from '@/lib/api/query-string';

import {
  employeeListSchema,
  employeeResponseSchema,
  employeeSavedSchema,
  employeeSchema,
} from '../types';

const subordinatesSchema = z.object({ data: z.array(employeeSchema) });

export function getEmployees(http: HttpClient, params: QueryParams, signal?: AbortSignal) {
  return http.request('/employees', employeeListSchema, { params, signal });
}

export function getEmployee(http: HttpClient, id: number, signal?: AbortSignal) {
  return http.request(`/employees/${id}`, employeeResponseSchema, { signal });
}

export function createEmployee(http: HttpClient, body: unknown) {
  return http.request('/employees', employeeSavedSchema, { method: 'POST', body });
}

export function updateEmployee(http: HttpClient, id: number, body: unknown) {
  return http.request(`/employees/${id}`, employeeSavedSchema, { method: 'PUT', body });
}

/** Everyone below the employee in the reporting line, direct and indirect. */
export function getSubordinates(http: HttpClient, id: number, signal?: AbortSignal) {
  return http.request(`/employees/${id}/subordinates`, subordinatesSchema, { signal });
}

export function suspendEmployee(http: HttpClient, id: number) {
  return http.request(`/employees/${id}/suspend`, employeeResponseSchema, { method: 'POST' });
}

export function activateEmployee(http: HttpClient, id: number) {
  return http.request(`/employees/${id}/activate`, employeeResponseSchema, { method: 'POST' });
}

export function offboardEmployee(http: HttpClient, id: number, body: unknown) {
  return http.request(`/employees/${id}/offboard`, employeeResponseSchema, {
    method: 'POST',
    body,
  });
}
