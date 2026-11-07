'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocale, useTranslations } from 'next-intl';

import { ROUTES } from '@/config/site';
import { useRouter } from '@/lib/i18n/navigation';

import { postLogin, postRegister } from '../api/session-requests';
import type { LoginValues, RegisterValues } from '../schemas';
import { toLoginPayload, toRegisterPayload } from '../utils/mappers';

function useAfterSignIn() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return () => {
    // A fresh session must never show the previous user's cached data.
    queryClient.clear();
    router.replace(ROUTES.home);
  };
}

export function useLoginMutation() {
  const locale = useLocale();
  const t = useTranslations('errors');
  const afterSignIn = useAfterSignIn();

  return useMutation({
    mutationFn: (values: LoginValues) =>
      postLogin({ locale, body: toLoginPayload(values), fallbackMessage: t('unknown') }),
    onSuccess: afterSignIn,
  });
}

export function useRegisterMutation() {
  const locale = useLocale();
  const t = useTranslations('errors');
  const afterSignIn = useAfterSignIn();

  return useMutation({
    mutationFn: (values: RegisterValues) =>
      postRegister({ locale, body: toRegisterPayload(values), fallbackMessage: t('unknown') }),
    onSuccess: afterSignIn,
  });
}
