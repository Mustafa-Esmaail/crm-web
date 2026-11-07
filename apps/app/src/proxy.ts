import { type NextRequest, NextResponse } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';

import { AUTH_COOKIE_NAME, AUTH_PAGES, ROUTES } from '@/config/site';
import { isLocale, routing } from '@/lib/i18n/routing';

// Next 16 renamed middleware.ts to proxy.ts; this is the route guard.
const handleIntl = createIntlMiddleware(routing);

function splitLocale(pathname: string): { locale: string | undefined; path: string } {
  const [, first, ...rest] = pathname.split('/');
  if (!isLocale(first)) return { locale: undefined, path: pathname };
  return { locale: first, path: `/${rest.join('/')}`.replace(/\/$/, '') || '/' };
}

export default function proxy(request: NextRequest): NextResponse {
  const intlResponse = handleIntl(request);
  const { locale, path } = splitLocale(request.nextUrl.pathname);

  // No locale yet: next-intl is redirecting to the prefixed URL, and we guard on the next hop.
  if (!locale) return intlResponse;

  // Presence only; the API stays the authority and a 401 clears a stale cookie.
  const hasSession = request.cookies.has(AUTH_COOKIE_NAME);
  const isAuthPage = AUTH_PAGES.includes(path);

  if (!hasSession && !isAuthPage) {
    return NextResponse.redirect(new URL(`/${locale}${ROUTES.login}`, request.url));
  }
  if (hasSession && isAuthPage) {
    return NextResponse.redirect(new URL(`/${locale}`, request.url));
  }

  return intlResponse;
}

export const config = {
  matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)',
};
