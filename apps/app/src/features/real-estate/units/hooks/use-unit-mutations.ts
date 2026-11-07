'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { useHttpClient } from '@/shared/hooks/use-http-client';
import { useToastUnexpectedError } from '@/shared/hooks/use-toast-unexpected-error';

import {
  createUnit,
  deleteUnit,
  releaseUnit,
  reserveUnit,
  sellUnit,
  updateUnit,
} from '../api/unit-requests';
import { unitKeys } from '../constants';
import type { ReserveFormValues, UnitFormValues } from '../schemas';
import { toReservePayload, toUnitPayload } from '../utils/mappers';

/** Units also feed the per-project counts, so refresh those lists too. */
function useRefreshUnits() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: unitKeys.all });
    void queryClient.invalidateQueries({ queryKey: ['re-projects'] });
  };
}

export function useSaveUnit() {
  const http = useHttpClient();
  const refresh = useRefreshUnits();
  const t = useTranslations('units');
  const toastUnexpected = useToastUnexpectedError();

  return useMutation({
    mutationFn: ({ id, values }: { id?: number; values: UnitFormValues }) => {
      const body = toUnitPayload(values);
      return id === undefined ? createUnit(http, body) : updateUnit(http, id, body);
    },
    onSuccess: (_result, { id }) => {
      refresh();
      toast.success(id === undefined ? t('toast.created') : t('toast.updated'));
    },
    onError: toastUnexpected,
  });
}

export function useDeleteUnit() {
  const http = useHttpClient();
  const refresh = useRefreshUnits();
  const t = useTranslations('units');

  return useMutation({
    mutationFn: (id: number) => deleteUnit(http, id),
    onSuccess: () => {
      refresh();
      toast.success(t('toast.deleted'));
    },
  });
}

export function useReserveUnit() {
  const http = useHttpClient();
  const refresh = useRefreshUnits();
  const t = useTranslations('units');
  const toastUnexpected = useToastUnexpectedError();

  return useMutation({
    mutationFn: ({ id, values }: { id: number; values: ReserveFormValues }) =>
      reserveUnit(http, id, toReservePayload(values)),
    onSuccess: () => {
      refresh();
      toast.success(t('toast.reserved'));
    },
    onError: toastUnexpected,
  });
}

/** Release and sell are one-click transitions with no form. */
export function useUnitTransition(kind: 'release' | 'sell') {
  const http = useHttpClient();
  const refresh = useRefreshUnits();
  const t = useTranslations('units');

  return useMutation({
    mutationFn: (id: number) => (kind === 'release' ? releaseUnit(http, id) : sellUnit(http, id)),
    onSuccess: () => {
      refresh();
      toast.success(kind === 'release' ? t('toast.released') : t('toast.sold'));
    },
  });
}
