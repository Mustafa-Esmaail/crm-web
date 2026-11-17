import '../globals.css';

import { Toaster, TooltipProvider } from '@crm/ui';
import type { Metadata, Viewport } from 'next';
import { IBM_Plex_Sans_Arabic, Inter } from 'next/font/google';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import type { ReactNode } from 'react';

import { BRAND_COLOR, SITE_NAME, SITE_URL } from '@/config/site';
import { getDirection, isLocale, routing } from '@/lib/i18n/routing';
import { HttpProvider } from '@/shared/providers/http-provider';
import { QueryProvider } from '@/shared/providers/query-provider';
import { ThemeProvider } from '@/shared/providers/theme-provider';

const plexArabic = IBM_Plex_Sans_Arabic({
  subsets: ['arabic', 'latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-plex-arabic',
  display: 'swap',
});

// Inter also renders every number, so Arabic UIs keep Latin digits and tabular alignment.
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });

interface LocaleLayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

const OG_LOCALES = { ar: 'ar_EG', en: 'en_US' } as const;

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: BRAND_COLOR },
    { media: '(prefers-color-scheme: dark)', color: '#0a0f0e' },
  ],
};

// Title, description and link-preview tags (Open Graph, Twitter) for every page of this locale.
// Pages only set their own `title`; the template adds the app name.
export async function generateMetadata({ params }: LocaleLayoutProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};

  const t = await getTranslations({ locale, namespace: 'meta' });
  const title = t('title');
  const description = t('description');
  const image = { url: '/og-image.png', width: 1200, height: 630, alt: t('ogAlt') };

  return {
    metadataBase: new URL(SITE_URL),
    applicationName: SITE_NAME,
    title: { default: title, template: `%s | ${SITE_NAME}` },
    description,
    openGraph: {
      type: 'website',
      siteName: SITE_NAME,
      title,
      description,
      locale: OG_LOCALES[locale],
      alternateLocale: Object.values(OG_LOCALES).filter((l) => l !== OG_LOCALES[locale]),
      images: [image],
    },
    twitter: { card: 'summary_large_image', title, description, images: [image] },
    // The browser icon and apple-icon come from src/app/icon.svg and src/app/apple-icon.png.
    manifest: '/manifest.webmanifest',
    appleWebApp: { title: SITE_NAME, capable: true, statusBarStyle: 'default' },
    formatDetection: { telephone: false },
  };
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      dir={getDirection(locale)}
      className={`${plexArabic.variable} ${inter.variable}`}
      suppressHydrationWarning
    >
      <body>
        <ThemeProvider>
          <NextIntlClientProvider locale={locale} messages={messages}>
            <NuqsAdapter>
              <QueryProvider>
                <HttpProvider>
                  <TooltipProvider>{children}</TooltipProvider>
                  <Toaster
                    position={getDirection(locale) === 'rtl' ? 'bottom-left' : 'bottom-right'}
                  />
                </HttpProvider>
              </QueryProvider>
            </NuqsAdapter>
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
