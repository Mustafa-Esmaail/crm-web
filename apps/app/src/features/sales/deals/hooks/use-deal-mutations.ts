'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { useRefreshAuditLogs } from '@/features/audit';
import { useHttpClient } from '@/shared/hooks/use-http-client';
import { useToastUnexpectedError } from '@/shared/hooks/use-toast-unexpected-error';

import {
  assignDeal,
  changeDealStage,
  createDeal,
  deleteDeal,
  updateDeal,
} from '../api/deal-requests';
import { dealKeys } from '../constants';
import type { DealFormValues } from '../schemas';
import { toDealPayload } from '../utils/mappers';

/** A deal shows in lists, on the board, in stage totals, and every change is audited. */
function useRefreshDeals() {
  const queryClient = useQueryClient();
  const refreshAudit = useRefreshAuditLogs();

  return () => {
    void queryClient.invalidateQueries({ queryKey: dealKeys.all });
    void refreshAudit();
  };
}

interface SaveDealInput {
  /** Present when editing; absent when creating. */
  id?: number;
  values: DealFormValues;
}

export function useSaveDeal() {
  const http = useHttpClient();
  const refresh = useRefreshDeals();
  const t = useTranslations('deals');
  const toastUnexpected = useToastUnexpectedError();

  return useMutation({
    mutationFn: ({ id, values }: SaveDealInput) => {
      const body = toDealPayload(values);
      return id === undefined ? createDeal(http, body) : updateDeal(http, id, body);
    },
    onSuccess: (_result, { id }) => {
      refresh();
      toast.success(id === undefined ? t('toast.created') : t('toast.updated'));
    },
    onError: toastUnexpected,
  });
}

export function useDeleteDeal() {
  const http = useHttpClient();
  const refresh = useRefreshDeals();
  const t = useTranslations('deals');
  const toastUnexpected = useToastUnexpectedError();

  return useMutation({
    mutationFn: (id: number) => deleteDeal(http, id),
    onSuccess: () => {
      refresh();
      toast.success(t('toast.deleted'));
    },
    onError: toastUnexpected,
  });
}

interface ChangeStageInput {
  id: number;
  stageId: number;
  lostReason: string | null;
}

export function useChangeDealStage() {
  const http = useHttpClient();
  const refresh = useRefreshDeals();
  const t = useTranslations('deals');
  const toastUnexpected = useToastUnexpectedError();

  return useMutation({
    mutationFn: ({ id, stageId, lostReason }: ChangeStageInput) =>
      changeDealStage(http, id, { stage_id: stageId, lost_reason: lostReason }),
    onSuccess: () => {
      refresh();
      toast.success(t('toast.stageChanged'));
    },
    onError: toastUnexpected,
  });
}

export function useAssignDeal() {
  const http = useHttpClient();
  const refresh = useRefreshDeals();
  const t = useTranslations('deals');
  const toastUnexpected = useToastUnexpectedError();

  return useMutation({
    mutationFn: ({ id, ownerId }: { id: number; ownerId: number }) => assignDeal(http, id, ownerId),
    onSuccess: () => {
      refresh();
      toast.success(t('toast.assigned'));
    },
    onError: toastUnexpected,
  });
}
