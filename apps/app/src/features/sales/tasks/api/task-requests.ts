import { z } from 'zod';

import type { HttpClient } from '@/lib/api/http-client';
import type { QueryParams } from '@/lib/api/query-string';

import { taskListSchema } from '../types';

const savedSchema = z.object({ data: z.object({ id: z.number() }) });

export function getTasks(http: HttpClient, params: QueryParams, signal?: AbortSignal) {
  return http.request('/tasks', taskListSchema, { params, signal });
}

export function createTask(http: HttpClient, body: unknown) {
  return http.request('/tasks', savedSchema, { method: 'POST', body });
}

export function updateTask(http: HttpClient, id: number, body: unknown) {
  return http.request(`/tasks/${id}`, savedSchema, { method: 'PUT', body });
}

export function deleteTask(http: HttpClient, id: number) {
  return http.request(`/tasks/${id}`, z.undefined(), { method: 'DELETE' });
}

/** The only way to change a task's owner; `PUT /tasks/{id}` rejects `owner_id`. */
export function assignTask(http: HttpClient, id: number, ownerId: number) {
  return http.request(`/tasks/${id}/assign`, savedSchema, {
    method: 'POST',
    body: { owner_id: ownerId },
  });
}

export function setTaskDone(http: HttpClient, id: number, done: boolean) {
  return http.request(`/tasks/${id}/${done ? 'complete' : 'reopen'}`, savedSchema, {
    method: 'POST',
  });
}
