import { z } from 'zod';

import type { HttpClient } from '@/lib/api/http-client';
import type { QueryParams } from '@/lib/api/query-string';

import { courseListSchema, enrollmentListSchema } from '../types';

const savedSchema = z.object({ data: z.object({ id: z.number() }) });

export function getCourses(http: HttpClient, params: QueryParams, signal?: AbortSignal) {
  return http.request('/education/courses', courseListSchema, { params, signal });
}

export function saveCourse(http: HttpClient, id: number | undefined, body: unknown) {
  return id === undefined
    ? http.request('/education/courses', savedSchema, { method: 'POST', body })
    : http.request(`/education/courses/${id}`, savedSchema, { method: 'PUT', body });
}

export function deleteCourse(http: HttpClient, id: number) {
  return http.request(`/education/courses/${id}`, z.undefined(), { method: 'DELETE' });
}

export function getEnrollments(http: HttpClient, params: QueryParams, signal?: AbortSignal) {
  return http.request('/education/enrollments', enrollmentListSchema, { params, signal });
}

export function saveEnrollment(http: HttpClient, id: number | undefined, body: unknown) {
  return id === undefined
    ? http.request('/education/enrollments', savedSchema, { method: 'POST', body })
    : http.request(`/education/enrollments/${id}`, savedSchema, { method: 'PUT', body });
}

export function deleteEnrollment(http: HttpClient, id: number) {
  return http.request(`/education/enrollments/${id}`, z.undefined(), { method: 'DELETE' });
}
