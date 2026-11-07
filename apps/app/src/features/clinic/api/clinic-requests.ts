import { z } from 'zod';

import type { HttpClient } from '@/lib/api/http-client';
import type { QueryParams } from '@/lib/api/query-string';

import { appointmentListSchema, serviceListSchema } from '../types';

const savedSchema = z.object({ data: z.object({ id: z.number() }) });

export function getServices(http: HttpClient, params: QueryParams, signal?: AbortSignal) {
  return http.request('/clinic/services', serviceListSchema, { params, signal });
}

export function saveService(http: HttpClient, id: number | undefined, body: unknown) {
  return id === undefined
    ? http.request('/clinic/services', savedSchema, { method: 'POST', body })
    : http.request(`/clinic/services/${id}`, savedSchema, { method: 'PUT', body });
}

export function deleteService(http: HttpClient, id: number) {
  return http.request(`/clinic/services/${id}`, z.undefined(), { method: 'DELETE' });
}

export function getAppointments(http: HttpClient, params: QueryParams, signal?: AbortSignal) {
  return http.request('/clinic/appointments', appointmentListSchema, { params, signal });
}

export function saveAppointment(http: HttpClient, id: number | undefined, body: unknown) {
  return id === undefined
    ? http.request('/clinic/appointments', savedSchema, { method: 'POST', body })
    : http.request(`/clinic/appointments/${id}`, savedSchema, { method: 'PUT', body });
}

export function deleteAppointment(http: HttpClient, id: number) {
  return http.request(`/clinic/appointments/${id}`, z.undefined(), { method: 'DELETE' });
}
