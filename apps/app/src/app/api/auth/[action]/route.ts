import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { LOCALE_HEADER, REQUEST_ID_HEADER } from '@/config/site';
import { callUpstream } from '@/lib/api/upstream';
import { clearSessionToken, readSessionToken, writeSessionToken } from '@/lib/auth/session';

interface RouteContext {
  params: Promise<{ action: string }>;
}

const actionSchema = z.enum(['login', 'register', 'logout']);

const tokenResponseSchema = z.object({
  token: z.string().min(1),
  user: z.unknown(),
});

function parseJson(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
}

function passthrough(upstream: Response, body: string): NextResponse {
  return new NextResponse(body || null, {
    status: upstream.status,
    headers: { 'Content-Type': upstream.headers.get('content-type') ?? 'application/json' },
  });
}

async function issueSession(request: NextRequest, path: string): Promise<NextResponse> {
  let upstream: Response;
  try {
    upstream = await callUpstream({
      path,
      method: 'POST',
      locale: request.headers.get(LOCALE_HEADER),
      requestId: request.headers.get(REQUEST_ID_HEADER),
      contentType: 'application/json',
      body: await request.arrayBuffer(),
    });
  } catch {
    return NextResponse.json({ message: 'Upstream API is unreachable.' }, { status: 502 });
  }

  const raw = await upstream.text();
  if (!upstream.ok) return passthrough(upstream, raw);

  const parsed = tokenResponseSchema.safeParse(parseJson(raw));
  if (!parsed.success) {
    return NextResponse.json({ message: 'Unexpected response from the API.' }, { status: 502 });
  }

  await writeSessionToken(parsed.data.token);
  // The token is deliberately not returned: the browser only ever sees the user.
  return NextResponse.json({ user: parsed.data.user }, { status: upstream.status });
}

async function endSession(request: NextRequest): Promise<NextResponse> {
  const token = await readSessionToken();

  if (token) {
    // Best effort: even if Laravel is down the local cookie must still go.
    await callUpstream({
      path: '/auth/logout',
      method: 'POST',
      token,
      locale: request.headers.get(LOCALE_HEADER),
    }).catch(() => undefined);
  }

  await clearSessionToken();
  return NextResponse.json({ ok: true });
}

export async function POST(request: NextRequest, context: RouteContext): Promise<NextResponse> {
  const action = actionSchema.safeParse((await context.params).action);
  if (!action.success) return NextResponse.json({ message: 'Not found.' }, { status: 404 });

  switch (action.data) {
    case 'login':
      return issueSession(request, '/auth/login');
    case 'register':
      return issueSession(request, '/auth/register');
    case 'logout':
      return endSession(request);
  }
}
