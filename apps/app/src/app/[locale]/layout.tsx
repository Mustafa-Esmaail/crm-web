import '../globals.css';

import { Toaster, TooltipProvider } from '@crm/ui';
import { IBM_Plex_Sans_Arabic, Inter } from 'next/font/google';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import type { ReactNode } from 'react';

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
