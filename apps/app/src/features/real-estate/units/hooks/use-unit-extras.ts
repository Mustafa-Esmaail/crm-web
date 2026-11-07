'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocale, useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { useRefreshAuditLogs } from '@/features/audit';
import { emptyToNull } from '@/lib/utils/strings';
import { useHttpClient } from '@/shared/hooks/use-http-client';
import { useToastUnexpectedError } from '@/shared/hooks/use-toast-unexpected-error';

import {
  addUnitInterest,
  deleteUnitMedia,
  getUnitInterests,
  getUnitMedia,
  removeUnitInterest,
  uploadUnitMedia,
} from '../api/unit-extras-requests';
import { unitKeys } from '../constants';
import type { InterestFormValues } from '../schemas';
import type { MediaKind } from '../types';

export function useUnitInterests(unitId: number) {
  const http = useHttpClient();
  return useQuery({
    queryKey: unitKeys.interests(unitId),
    queryFn: ({ signal }) => getUnitInterests(http, unitId, signal),
    select: (response) => response.data,
  });
}

/** Interests show on the lead's timeline too, and every change is audited. */
function useRefreshInterests(unitId: number) {
  const queryClient = useQueryClient();
  const refreshAudit = useRefreshAuditLogs();
  return () => {
    void queryClient.invalidateQueries({ queryKey: unitKeys.interests(unitId) });
    void refreshAudit();
  };
}

export function useAddUnitInterest(unitId: number) {
  const http = useHttpClient();
  const refresh = useRefreshInterests(unitId);
  const t = useTranslations('units.interests');
  const toastUnexpected = useToastUnexpectedError();

  return useMutation({
    mutationFn: (values: InterestFormValues) =>
      addUnitInterest(http, unitId, {
        lead_id: Number(values.lead_id),
        note: emptyToNull(values.note),
      }),
    onSuccess: () => {
      refresh();
      toast.success(t('toast.added'));
    },
    onError: toastUnexpected,
  });
}

export function useRemoveUnitInterest(unitId: number) {
  const http = useHttpClient();
  const refresh = useRefreshInterests(unitId);
  const t = useTranslations('units.interests');
  const toastUnexpected = useToastUnexpectedError();

  return useMutation({
    mutationFn: (leadId: number) => removeUnitInterest(http, unitId, leadId),
    onSuccess: () => {
      refresh();
      toast.success(t('toast.removed'));
    },
    onError: toastUnexpected,
  });
}

export function useUnitMedia(unitId: number) {
  const http = useHttpClient();
  return useQuery({
    queryKey: unitKeys.media(unitId),
    queryFn: ({ signal }) => getUnitMedia(http, unitId, signal),
    select: (response) => response.data,
  });
}

/** Errors stay with the caller, which shows a refusal (wrong type, limit reached) next to the picker. */
export function useUploadUnitMedia(unitId: number) {
  const queryClient = useQueryClient();
  const refreshAudit = useRefreshAuditLogs();
  const locale = useLocale();
  const t = useTranslations('units.media');

  return useMutation({
    mutationFn: (input: { kind: MediaKind; file: File }) =>
      uploadUnitMedia(unitId, input, { locale, fallbackMessage: t('uploadFailed') }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: unitKeys.media(unitId) });
      void refreshAudit();
      toast.success(t('toast.uploaded'));
    },
  });
}

export function useDeleteUnitMedia(unitId: number) {
  const http = useHttpClient();
  const queryClient = useQueryClient();
  const refreshAudit = useRefreshAuditLogs();
  const t = useTranslations('units.media');
  const toastUnexpected = useToastUnexpectedError();

  return useMutation({
    mutationFn: (mediaId: number) => deleteUnitMedia(http, unitId, mediaId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: unitKeys.media(unitId) });
      void refreshAudit();
      toast.success(t('toast.deleted'));
    },
    onError: toastUnexpected,
  });
}
