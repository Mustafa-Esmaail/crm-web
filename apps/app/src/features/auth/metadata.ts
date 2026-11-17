import type { Metadata } from 'next';

import { DEFAULT_LOCALE, LOCALES } from '@/lib/i18n/routing';

/**
 * Metadata for a public auth page (`path` without the locale, e.g. "/login"): its own title plus the
 * language versions, so search engines link the Arabic and English pages. The link-preview tags
 * come from the locale layout and are not repeated here (a page's `openGraph` would replace them).
 */
export function authPageMetadata(title: string, path: string): Metadata {
  return {
    title,
    alternates: {
      languages: {
        ...Object.fromEntries(LOCALES.map((locale) => [locale, `/${locale}${path}`])),
        'x-default': `/${DEFAULT_LOCALE}${path}`,
      },
    },
  };
}
