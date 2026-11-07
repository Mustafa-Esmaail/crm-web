'use client';

import { isApiError } from '@crm/api-client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { useHttpClient } from '@/shared/hooks/use-http-client';
import { useToastUnexpectedError } from '@/shared/hooks/use-toast-unexpected-error';

import {
  deletePaymentPlan,
  getPaymentPlan,
  payInstallment,
  savePaymentPlan,
} from '../api/payment-plan-requests';
import type { PaymentPlanFormValues } from '../schemas';
import { toPaymentPlanPayload } from '../utils/mappers';

const planKey = (unitId: number) => ['re-units', 'payment-plan', unitId] as const;

/** `data` is null when the unit has no plan yet (the API answers 404). */
export function usePaymentPlan(unitId: number) {
  const http = useHttpClient();

  return useQuery({
    queryKey: planKey(unitId),
    queryFn: async ({ signal }) => {
      try {
        return (await getPaymentPlan(http, unitId, signal)).data;
      } catch (error) {
        if (isApiError(error) && error.status === 404) return null;
        throw error;
      }
    },
  });
}

function useRefresh(unitId: number) {
  const queryClient = useQueryClient();
  return () => void queryClient.invalidateQueries({ queryKey: planKey(unitId) });
}

export function useSavePaymentPlan(unitId: number) {
  const http = useHttpClient();
  const refresh = useRefresh(unitId);
  const t = useTranslations('units.plan');
  const toastUnexpected = useToastUnexpectedError();

  return useMutation({
    mutationFn: (values: PaymentPlanFormValues) =>
      savePaymentPlan(http, unitId, toPaymentPlanPayload(values)),
    onSuccess: () => {
      refresh();
      toast.success(t('toast.saved'));
    },
    onError: toastUnexpected,
  });
}

export function useDeletePaymentPlan(unitId: number) {
  const http = useHttpClient();
  const refresh = useRefresh(unitId);
  const t = useTranslations('units.plan');
  const toastUnexpected = useToastUnexpectedError();

  return useMutation({
    mutationFn: () => deletePaymentPlan(http, unitId),
    onSuccess: () => {
      refresh();
      toast.success(t('toast.deleted'));
    },
    onError: toastUnexpected,
  });
}

export function usePayInstallment(unitId: number) {
  const http = useHttpClient();
  const refresh = useRefresh(unitId);
  const t = useTranslations('units.plan');
  const toastUnexpected = useToastUnexpectedError();

  return useMutation({
    mutationFn: (number: number) => payInstallment(http, unitId, number),
    onSuccess: () => {
      refresh();
      toast.success(t('toast.paid'));
    },
    onError: toastUnexpected,
  });
}
