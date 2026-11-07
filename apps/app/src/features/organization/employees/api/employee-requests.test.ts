import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { createFetchHttpClient } from '@/lib/api/http-client';

import { API_ORIGIN, server } from '../../../../../tests/server';
import { createEmployee } from './employee-requests';

const client = createFetchHttpClient({
  baseUrl: `${API_ORIGIN}/api/proxy`,
  getLocale: () => 'en',
  getFallbackMessage: () => 'fallback',
  onUnauthorized: () => undefined,
});

describe('createEmployee', () => {
  it('accepts the API answer even though a just-created employee has no status yet', async () => {
    // Real behaviour of POST /employees: the model is not refreshed, so these come back null.
    server.use(
      http.post(`${API_ORIGIN}/api/proxy/employees`, () =>
        HttpResponse.json({ data: { id: 23, name: 'New', status: null, is_owner: null } }),
      ),
    );

    await expect(createEmployee(client, { name: 'New' })).resolves.toMatchObject({
      data: { id: 23 },
    });
  });
});
