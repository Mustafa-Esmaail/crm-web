import { isApiError } from '@crm/api-client';
import { http, HttpResponse } from 'msw';
import { describe, expect, it, vi } from 'vitest';
import { z } from 'zod';

import { API_ORIGIN, server } from '../../../tests/server';
import { createFetchHttpClient } from './http-client';

const schema = z.object({ id: z.number() });
const url = `${API_ORIGIN}/api/proxy/things`;

function build(overrides: Partial<Parameters<typeof createFetchHttpClient>[0]> = {}) {
  return createFetchHttpClient({
    baseUrl: `${API_ORIGIN}/api/proxy`,
    getLocale: () => 'ar',
    getFallbackMessage: (status) => `fallback-${status}`,
    onUnauthorized: vi.fn(),
    ...overrides,
  });
}

describe('createFetchHttpClient', () => {
  it('parses a successful response with the schema', async () => {
    server.use(http.get(url, () => HttpResponse.json({ id: 7 })));

    await expect(build().request('/things', schema)).resolves.toEqual({ id: 7 });
  });

  it('sends the locale and a request id so the API answers in the right language', async () => {
    let headers: Headers | undefined;
    server.use(
      http.get(url, ({ request }) => {
        headers = request.headers;
        return HttpResponse.json({ id: 1 });
      }),
    );

    await build().request('/things', schema);

    expect(headers?.get('x-locale')).toBe('ar');
    expect(headers?.get('x-request-id')).toBeTruthy();
  });

  it('turns a 422 into an ApiError that keeps the field errors', async () => {
    server.use(
      http.post(url, () =>
        HttpResponse.json(
          { message: 'Invalid', errors: { name: ['The name field is required.'] } },
          { status: 422 },
        ),
      ),
    );

    const error = await build()
      .request('/things', schema, { method: 'POST', body: {} })
      .catch((caught: unknown) => caught);

    expect(isApiError(error)).toBe(true);
    expect(error).toMatchObject({
      status: 422,
      fieldErrors: { name: ['The name field is required.'] },
    });
  });

  it('signals an expired session on 401', async () => {
    const onUnauthorized = vi.fn();
    server.use(http.get(url, () => HttpResponse.json({ message: 'No' }, { status: 401 })));

    await build({ onUnauthorized })
      .request('/things', schema)
      .catch(() => undefined);

    expect(onUnauthorized).toHaveBeenCalledOnce();
  });

  it('reports a 403 without ending the session', async () => {
    const onUnauthorized = vi.fn();
    const onForbidden = vi.fn();
    server.use(http.get(url, () => HttpResponse.json({ message: 'No' }, { status: 403 })));

    await build({ onUnauthorized, onForbidden })
      .request('/things', schema)
      .catch(() => undefined);

    expect(onForbidden).toHaveBeenCalledOnce();
    expect(onUnauthorized).not.toHaveBeenCalled();
  });

  it('uses the fallback message when the network fails', async () => {
    server.use(http.get(url, () => HttpResponse.error()));

    const error = await build()
      .request('/things', schema)
      .catch((caught: unknown) => caught);

    expect(error).toMatchObject({ status: 0, message: 'fallback-0' });
  });
});
