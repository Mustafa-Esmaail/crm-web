import type { MetadataRoute } from 'next';

import { SITE_URL } from '@/config/site';

// Only the public sign-in and sign-up pages may be indexed; everything else is a private workspace.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: ['/$', '/ar$', '/en$', '/ar/login', '/en/login', '/ar/register', '/en/register'],
      disallow: '/',
    },
    host: SITE_URL,
  };
}
