'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocale, useTranslations } from 'next-intl';
import { z } from 'zod';

import { ROUTES } from '@/config/site';
import { requestAuthAction } from '@/lib/auth/auth-client';
import { useRouter } from '@/lib/i18n/navigation';

export function useLogout() {
  const locale = useLocale();
  const t = useTranslations('errors');
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      requestAuthAction({
        action: 'logout',
        schema: z.object({ ok: z.boolean() }),
        locale,
        fallbackMessage: t('unknown'),
      }),
    onSuccess: () => {
      // Drop every cached response so the next user on this browser never sees this one's data.
      queryClient.clear();
      router.replace(ROUTES.login);
    },
  });
}
