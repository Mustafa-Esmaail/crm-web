'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { type ReactNode, useMemo } from 'react';

import { PROXY_PREFIX, ROUTES } from '@/config/site';
import { createFetchHttpClient } from '@/lib/api/http-client';
import { HttpClientContext } from '@/shared/hooks/use-http-client';

export function HttpProvider({ children }: { children: ReactNode }) {
  const locale = useLocale();
  const t = useTranslations('errors');
  const queryClient = useQueryClient();
  const router = useRouter();

  const client = useMemo(
    () =>
      createFetchHttpClient({
        baseUrl: PROXY_PREFIX,
        getLocale: () => locale,
        getFallbackMessage: (status) => {
          if (status === 0) return t('network');
          if (status === 403) return t('forbidden');
          if (status === 404) return t('notFound');
          return t('unknown');
        },
        onUnauthorized: () => {
          // The proxy already dropped the cookie; clear cached data and send the user to sign in.
          queryClient.clear();
          router.replace(`/${locale}${ROUTES.login}`);
        },
      }),
    [locale, t, queryClient, router],
  );

  return <HttpClientContext.Provider value={client}>{children}</HttpClientContext.Provider>;
}
