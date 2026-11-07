import { z } from 'zod';

import type { HttpClient } from '@/lib/api/http-client';
import type { QueryParams } from '@/lib/api/query-string';

import {
  leadActivityListSchema,
  leadActivityResponseSchema,
  leadListSchema,
  leadResponseSchema,
  leadSourceListSchema,
  leadStageListSchema,
} from '../types';

export function getLeads(http: HttpClient, params: QueryParams, signal?: AbortSignal) {
  return http.request('/leads', leadListSchema, { params, signal });
}

export function getLead(http: HttpClient, id: number, signal?: AbortSignal) {
  return http.request(`/leads/${id}`, leadResponseSchema, { signal });
}

// Writes only need to know they worked; the lists and detail refetch the real record.
const savedSchema = z.object({ data: z.object({ id: z.number() }) });

export function createLead(http: HttpClient, body: unknown) {
  return http.request('/leads', savedSchema, { method: 'POST', body });
}

export function updateLead(http: HttpClient, id: number, body: unknown) {
  return http.request(`/leads/${id}`, savedSchema, { method: 'PUT', body });
}

export function deleteLead(http: HttpClient, id: number) {
  return http.request(`/leads/${id}`, z.undefined(), { method: 'DELETE' });
}

export function changeLeadStage(
  http: HttpClient,
  id: number,
  body: { stage_id: number; lost_reason: string | null },
) {
  return http.request(`/leads/${id}/stage`, savedSchema, { method: 'POST', body });
}

/** One route for one or many: the API wants the ids in the body either way. */
export function assignLeads(http: HttpClient, leadIds: number[], ownerId: number) {
  return http.request('/leads/assign', z.unknown(), {
    method: 'POST',
    body: { lead_ids: leadIds, owner_id: ownerId },
  });
}

export function getLeadActivities(http: HttpClient, id: number, signal?: AbortSignal) {
  return http.request(`/leads/${id}/activities`, leadActivityListSchema, { signal });
}

export function logLeadActivity(http: HttpClient, id: number, body: unknown) {
  return http.request(`/leads/${id}/activities`, leadActivityResponseSchema, {
    method: 'POST',
    body,
  });
}

export function getLeadStages(http: HttpClient, signal?: AbortSignal) {
  return http.request('/lead-stages', leadStageListSchema, { signal });
}

export function getLeadSources(http: HttpClient, signal?: AbortSignal) {
  return http.request('/lead-sources', leadSourceListSchema, { signal });
}
