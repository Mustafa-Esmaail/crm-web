'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { useRefreshAuditLogs } from '@/features/audit';
import { useHttpClient } from '@/shared/hooks/use-http-client';
import { useToastUnexpectedError } from '@/shared/hooks/use-toast-unexpected-error';

import {
  deleteEngagement,
  deletePackage,
  saveEngagement,
  savePackage,
} from '../api/agency-requests';
import { agencyKeys } from '../constants';
import type { EngagementFormValues, PackageFormValues } from '../schemas';
import { toEngagementPayload, toPackagePayload } from '../utils/mappers';

/** Engagements change a package's active count, so any change refreshes both lists. */
function useRefreshAgency() {
  const queryClient = useQueryClient();
  const refreshAudit = useRefreshAuditLogs();
  return () => {
    void queryClient.invalidateQueries({ queryKey: agencyKeys.all });
    void refreshAudit();
  };
}

export function useSavePackage() {
  const http = useHttpClient();
  const refresh = useRefreshAgency();
  const t = useTranslations('agency.packages');
  const toastUnexpected = useToastUnexpectedError();

  return useMutation({
    mutationFn: ({ id, values }: { id?: number; values: PackageFormValues }) =>
      savePackage(http, id, toPackagePayload(values)),
    onSuccess: (_result, { id }) => {
      refresh();
      toast.success(id === undefined ? t('toast.created') : t('toast.updated'));
    },
    onError: toastUnexpected,
  });
}

export function useDeletePackage() {
  const http = useHttpClient();
  const refresh = useRefreshAgency();
  const t = useTranslations('agency.packages');

  return useMutation({
    mutationFn: (id: number) => deletePackage(http, id),
    onSuccess: () => {
      refresh();
      toast.success(t('toast.deleted'));
    },
  });
}

export function useSaveEngagement() {
  const http = useHttpClient();
  const refresh = useRefreshAgency();
  const t = useTranslations('agency.engagements');
  const toastUnexpected = useToastUnexpectedError();

  return useMutation({
    mutationFn: ({ id, values }: { id?: number; values: EngagementFormValues }) =>
      saveEngagement(http, id, toEngagementPayload(values, id === undefined)),
    onSuccess: (_result, { id }) => {
      refresh();
      toast.success(id === undefined ? t('toast.created') : t('toast.updated'));
    },
    onError: toastUnexpected,
  });
}

export function useDeleteEngagement() {
  const http = useHttpClient();
  const refresh = useRefreshAgency();
  const t = useTranslations('agency.engagements');

  return useMutation({
    mutationFn: (id: number) => deleteEngagement(http, id),
    onSuccess: () => {
      refresh();
      toast.success(t('toast.deleted'));
    },
  });
}
