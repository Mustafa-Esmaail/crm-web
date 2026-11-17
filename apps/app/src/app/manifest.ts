import type { MetadataRoute } from 'next';

import { BRAND_COLOR, SITE_NAME } from '@/config/site';
import { DEFAULT_LOCALE } from '@/lib/i18n/routing';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: SITE_NAME,
    description: 'Clients, team and deals in one place.',
    start_url: `/${DEFAULT_LOCALE}`,
    display: 'standalone',
    background_color: '#0b1615',
    theme_color: BRAND_COLOR,
    icons: [
      { src: '/icon.svg', type: 'image/svg+xml', sizes: 'any' },
      { src: '/icon-192.png', type: 'image/png', sizes: '192x192' },
      { src: '/icon-512.png', type: 'image/png', sizes: '512x512' },
      { src: '/icon-512.png', type: 'image/png', sizes: '512x512', purpose: 'maskable' },
    ],
  };
}
