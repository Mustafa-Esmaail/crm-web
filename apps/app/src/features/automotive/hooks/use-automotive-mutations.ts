'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { useRefreshAuditLogs } from '@/features/audit';
import { useHttpClient } from '@/shared/hooks/use-http-client';
import { useToastUnexpectedError } from '@/shared/hooks/use-toast-unexpected-error';

import {
  deleteTestDrive,
  deleteVehicle,
  saveTestDrive,
  saveVehicle,
} from '../api/automotive-requests';
import { automotiveKeys } from '../constants';
import type { TestDriveFormValues, VehicleFormValues } from '../schemas';
import type { TestDrive } from '../types';
import { toTestDrivePayload, toVehiclePayload } from '../utils/mappers';

/** Test drives show their vehicle, so any change refreshes both lists. */
function useRefreshAutomotive() {
  const queryClient = useQueryClient();
  const refreshAudit = useRefreshAuditLogs();
  return () => {
    void queryClient.invalidateQueries({ queryKey: automotiveKeys.all });
    void refreshAudit();
  };
}

export function useSaveVehicle() {
  const http = useHttpClient();
  const refresh = useRefreshAutomotive();
  const t = useTranslations('automotive.vehicles');
  const toastUnexpected = useToastUnexpectedError();

  return useMutation({
    mutationFn: ({ id, values }: { id?: number; values: VehicleFormValues }) =>
      saveVehicle(http, id, toVehiclePayload(values)),
    onSuccess: (_result, { id }) => {
      refresh();
      toast.success(id === undefined ? t('toast.created') : t('toast.updated'));
    },
    onError: toastUnexpected,
  });
}

export function useDeleteVehicle() {
  const http = useHttpClient();
  const refresh = useRefreshAutomotive();
  const t = useTranslations('automotive.vehicles');

  return useMutation({
    mutationFn: (id: number) => deleteVehicle(http, id),
    onSuccess: () => {
      refresh();
      toast.success(t('toast.deleted'));
    },
  });
}

export function useSaveTestDrive() {
  const http = useHttpClient();
  const refresh = useRefreshAutomotive();
  const t = useTranslations('automotive.testDrives');
  const toastUnexpected = useToastUnexpectedError();

  return useMutation({
    mutationFn: ({ original, values }: { original?: TestDrive; values: TestDriveFormValues }) =>
      saveTestDrive(http, original?.id, toTestDrivePayload(values, original)),
    onSuccess: (_result, { original }) => {
      refresh();
      toast.success(original ? t('toast.updated') : t('toast.created'));
    },
    onError: toastUnexpected,
  });
}

export function useDeleteTestDrive() {
  const http = useHttpClient();
  const refresh = useRefreshAutomotive();
  const t = useTranslations('automotive.testDrives');

  return useMutation({
    mutationFn: (id: number) => deleteTestDrive(http, id),
    onSuccess: () => {
      refresh();
      toast.success(t('toast.deleted'));
    },
  });
}
