import { normalizeApiError } from '@crm/api-client';
import { z } from 'zod';

import { LOCALE_HEADER, PROXY_PREFIX, REQUEST_ID_HEADER } from '@/config/site';
import type { HttpClient } from '@/lib/api/http-client';
import type { QueryParams } from '@/lib/api/query-string';

import { exportRequestListSchema } from '../types';

const decidedSchema = z.object({ data: z.object({ id: z.number() }) });

export function getExportRequests(http: HttpClient, params: QueryParams, signal?: AbortSignal) {
  return http.request('/export-requests', exportRequestListSchema, { params, signal });
}

export function decideExportRequest(
  http: HttpClient,
  id: number,
  decision: 'approve' | 'reject',
  note: string | null,
) {
  return http.request(`/export-requests/${id}/${decision}`, decidedSchema, {
    method: 'POST',
    body: { note },
  });
}

/** The approved CSV; fetched directly because the shared client only reads JSON. */
export async function downloadExport(id: number, locale: string, fallbackMessage: string) {
  const response = await fetch(`${PROXY_PREFIX}/export-requests/${id}/download`, {
    credentials: 'same-origin',
    headers: {
      Accept: 'text/csv, application/json',
      [LOCALE_HEADER]: locale,
      [REQUEST_ID_HEADER]: crypto.randomUUID(),
    },
  });

  if (!response.ok) {
    const text = await response.text();
    let payload: unknown;
    try {
      payload = text ? JSON.parse(text) : undefined;
    } catch {
      payload = undefined;
    }
    throw normalizeApiError(response.status, payload, fallbackMessage);
  }

  const url = URL.createObjectURL(await response.blob());
  const link = document.createElement('a');
  link.href = url;
  link.download = `leads-export-${id}.csv`;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
