import { normalizeApiError } from '@crm/api-client';
import type { z } from 'zod';

import { AUTH_ROUTE_PREFIX, LOCALE_HEADER, REQUEST_ID_HEADER } from '@/config/site';

export type AuthAction = 'login' | 'register' | 'logout';

interface AuthRequest<TSchema extends z.ZodType> {
  action: AuthAction;
  schema: TSchema;
  locale: string;
  body?: unknown;
  fallbackMessage: string;
}

/** Browser-side entry to the BFF auth handlers; the token never passes through here. */
export async function requestAuthAction<TSchema extends z.ZodType>(
  request: AuthRequest<TSchema>,
): Promise<z.infer<TSchema>> {
  let response: Response;
  try {
    response = await fetch(`${AUTH_ROUTE_PREFIX}/${request.action}`, {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        [LOCALE_HEADER]: request.locale,
        [REQUEST_ID_HEADER]: crypto.randomUUID(),
      },
      body: JSON.stringify(request.body ?? {}),
    });
  } catch {
    throw normalizeApiError(0, undefined, request.fallbackMessage);
  }

  const text = await response.text();
  let payload: unknown;
  try {
    payload = text ? JSON.parse(text) : undefined;
  } catch {
    payload = undefined;
  }

  if (!response.ok) {
    throw normalizeApiError(response.status, payload, request.fallbackMessage);
  }
  return request.schema.parse(payload);
}
