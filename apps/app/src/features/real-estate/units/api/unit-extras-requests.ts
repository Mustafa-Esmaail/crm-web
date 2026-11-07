import { normalizeApiError } from '@crm/api-client';
import { z } from 'zod';

import { LOCALE_HEADER, PROXY_PREFIX, REQUEST_ID_HEADER } from '@/config/site';
import type { HttpClient } from '@/lib/api/http-client';

import {
  type MediaKind,
  unitInterestListSchema,
  unitMediaListSchema,
  unitMediaSchema,
} from '../types';

const savedSchema = z.object({ data: z.object({ id: z.number() }) });
const base = (unitId: number) => `/real-estate/units/${unitId}`;

export function getUnitInterests(http: HttpClient, unitId: number, signal?: AbortSignal) {
  return http.request(`${base(unitId)}/interests`, unitInterestListSchema, { signal });
}

export function addUnitInterest(http: HttpClient, unitId: number, body: unknown) {
  return http.request(`${base(unitId)}/interests`, savedSchema, { method: 'POST', body });
}

/** Interests are removed by lead, not by their own id. */
export function removeUnitInterest(http: HttpClient, unitId: number, leadId: number) {
  return http.request(`${base(unitId)}/interests/${leadId}`, z.undefined(), { method: 'DELETE' });
}

export function getUnitMedia(http: HttpClient, unitId: number, signal?: AbortSignal) {
  return http.request(`${base(unitId)}/media`, unitMediaListSchema, { signal });
}

export function deleteUnitMedia(http: HttpClient, unitId: number, mediaId: number) {
  return http.request(`${base(unitId)}/media/${mediaId}`, z.undefined(), { method: 'DELETE' });
}

/**
 * Where the browser loads a file: through the app's proxy, which adds the session's token.
 * The resource's own download_url points at the API, which the browser cannot authenticate to.
 */
export function unitMediaUrl(unitId: number, mediaId: number): string {
  return `${PROXY_PREFIX}${base(unitId)}/media/${mediaId}`;
}

/**
 * Multipart upload. The shared HttpClient only sends JSON, so this uses fetch through the same
 * proxy (the session cookie rides along; the token never reaches the browser).
 */
export async function uploadUnitMedia(
  unitId: number,
  { kind, file }: { kind: MediaKind; file: File },
  { locale, fallbackMessage }: { locale: string; fallbackMessage: string },
) {
  const body = new FormData();
  body.append('kind', kind);
  body.append('file', file);

  const response = await fetch(`${PROXY_PREFIX}${base(unitId)}/media`, {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      Accept: 'application/json',
      [LOCALE_HEADER]: locale,
      [REQUEST_ID_HEADER]: crypto.randomUUID(),
    },
    body,
  });

  const text = await response.text();
  let payload: unknown;
  try {
    payload = text ? JSON.parse(text) : undefined;
  } catch {
    payload = undefined;
  }
  if (!response.ok) throw normalizeApiError(response.status, payload, fallbackMessage);

  return z.object({ data: unitMediaSchema }).parse(payload).data;
}
