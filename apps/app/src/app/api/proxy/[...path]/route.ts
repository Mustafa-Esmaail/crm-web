import { type NextRequest, NextResponse } from 'next/server';

import { AUTH_COOKIE_NAME, LOCALE_HEADER, REQUEST_ID_HEADER } from '@/config/site';
import { callUpstream } from '@/lib/api/upstream';
import { readSessionToken } from '@/lib/auth/session';

interface RouteContext {
  params: Promise<{ path: string[] }>;
}

const BODYLESS_METHODS = new Set(['GET', 'HEAD']);
/** File responses keep their name (downloads) and their caching rules. */
const PASSED_HEADERS = ['content-disposition', 'cache-control'] as const;

async function forward(request: NextRequest, context: RouteContext): Promise<NextResponse> {
  const { path } = await context.params;
  const token = await readSessionToken();

  let upstream: Response;
  try {
    upstream = await callUpstream({
      path: `/${path.join('/')}`,
      search: request.nextUrl.search,
      method: request.method,
      token,
      locale: request.headers.get(LOCALE_HEADER),
      requestId: request.headers.get(REQUEST_ID_HEADER),
      contentType: request.headers.get('content-type'),
      body: BODYLESS_METHODS.has(request.method) ? undefined : await request.arrayBuffer(),
    });
  } catch {
    return NextResponse.json({ message: 'Upstream API is unreachable.' }, { status: 502 });
  }

  // Raw bytes, not text: the API also streams files (unit photos, PDFs), which text decoding corrupts.
  const headers = new Headers({
    'Content-Type': upstream.headers.get('content-type') ?? 'application/json',
  });
  for (const name of PASSED_HEADERS) {
    const value = upstream.headers.get(name);
    if (value) headers.set(name, value);
  }
  const response = new NextResponse(upstream.status === 204 ? null : await upstream.arrayBuffer(), {
    status: upstream.status,
    headers,
  });

  // A rejected token means the session is dead; drop the cookie so the next navigation re-authenticates.
  if (upstream.status === 401) response.cookies.delete(AUTH_COOKIE_NAME);

  return response;
}

export { forward as DELETE, forward as GET, forward as PATCH, forward as POST, forward as PUT };
