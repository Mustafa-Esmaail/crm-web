export const AUTH_COOKIE_NAME = 'crm_session';
export const AUTH_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;
export const LOCALE_HEADER = 'X-Locale';
export const REQUEST_ID_HEADER = 'X-Request-Id';
export const PROXY_PREFIX = '/api/proxy';
export const AUTH_ROUTE_PREFIX = '/api/auth';

export const ROUTES = {
  login: '/login',
  register: '/register',
  home: '/',
} as const;

export const AUTH_PAGES: readonly string[] = [ROUTES.login, ROUTES.register];
