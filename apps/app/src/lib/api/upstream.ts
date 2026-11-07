import 'server-only';

import { env } from '@/config/env';
import { LOCALE_HEADER, REQUEST_ID_HEADER } from '@/config/site';
import { DEFAULT_LOCALE } from '@/lib/i18n/routing';

interface UpstreamRequest {
  path: string;
  search?: string;
  method: string;
  token?: string;
  locale?: string | null;
  requestId?: string | null;
  contentType?: string | null;
  body?: ArrayBuffer;
}

/** Server-side call to Laravel; the only place the bearer token is attached. */
export function callUpstream(request: UpstreamRequest): Promise<Response> {
  const headers = new Headers({
    Accept: 'application/json',
    [LOCALE_HEADER]: request.locale ?? DEFAULT_LOCALE,
    [REQUEST_ID_HEADER]: request.requestId ?? crypto.randomUUID(),
  });
  if (request.token) headers.set('Authorization', `Bearer ${request.token}`);
  if (request.contentType) headers.set('Content-Type', request.contentType);

  return fetch(`${env.API_BASE_URL}${request.path}${request.search ?? ''}`, {
    method: request.method,
    headers,
    body: request.body,
    cache: 'no-store',
  });
}
