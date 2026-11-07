import { type ApiError, normalizeApiError } from '@crm/api-client';
import type { z } from 'zod';

import { LOCALE_HEADER, REQUEST_ID_HEADER } from '@/config/site';

import { buildQueryString, type QueryParams } from './query-string';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface RequestOptions {
  method?: HttpMethod;
  params?: QueryParams;
  body?: unknown;
  signal?: AbortSignal;
}

/** The only transport abstraction features see; tests swap in MSW or a fake. */
export interface HttpClient {
  request<TSchema extends z.ZodType>(
    path: string,
    schema: TSchema,
    options?: RequestOptions,
  ): Promise<z.infer<TSchema>>;
}

export interface FetchHttpClientConfig {
  baseUrl: string;
  getLocale: () => string;
  getFallbackMessage: (status: number) => string;
  onUnauthorized: () => void;
  onForbidden?: (error: ApiError) => void;
}

async function readJson(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return undefined;
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

export function createFetchHttpClient(config: FetchHttpClientConfig): HttpClient {
  return {
    async request(path, schema, options = {}) {
      const { method = 'GET', params, body, signal } = options;

      let response: Response;
      try {
        response = await fetch(`${config.baseUrl}${path}${buildQueryString(params)}`, {
          method,
          signal,
          credentials: 'same-origin',
          headers: {
            Accept: 'application/json',
            ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
            [LOCALE_HEADER]: config.getLocale(),
            [REQUEST_ID_HEADER]: crypto.randomUUID(),
          },
          body: body === undefined ? undefined : JSON.stringify(body),
        });
      } catch (cause) {
        if (cause instanceof DOMException && cause.name === 'AbortError') throw cause;
        throw normalizeApiError(0, undefined, config.getFallbackMessage(0));
      }

      const payload = await readJson(response);

      if (!response.ok) {
        const error = normalizeApiError(
          response.status,
          payload,
          config.getFallbackMessage(response.status),
        );
        if (response.status === 401) config.onUnauthorized();
        if (response.status === 403) config.onForbidden?.(error);
        throw error;
      }

      return schema.parse(payload);
    },
  };
}
