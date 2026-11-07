'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { useRefreshAuditLogs } from '@/features/audit';
import { useHttpClient } from '@/shared/hooks/use-http-client';
import { useToastUnexpectedError } from '@/shared/hooks/use-toast-unexpected-error';

import {
  deleteAppointment,
  deleteService,
  saveAppointment,
  saveService,
} from '../api/clinic-requests';
import { clinicKeys } from '../constants';
import type { AppointmentFormValues, ServiceFormValues } from '../schemas';
import type { Appointment } from '../types';
import { toAppointmentPayload, toServicePayload } from '../utils/mappers';

/** Appointments show their service's name, so any clinic change refreshes both lists. */
function useRefreshClinic() {
  const queryClient = useQueryClient();
  const refreshAudit = useRefreshAuditLogs();
  return () => {
    void queryClient.invalidateQueries({ queryKey: clinicKeys.all });
    void refreshAudit();
  };
}

export function useSaveService() {
  const http = useHttpClient();
  const refresh = useRefreshClinic();
  const t = useTranslations('clinic.services');
  const toastUnexpected = useToastUnexpectedError();

  return useMutation({
    mutationFn: ({ id, values }: { id?: number; values: ServiceFormValues }) =>
      saveService(http, id, toServicePayload(values)),
    onSuccess: (_result, { id }) => {
      refresh();
      toast.success(id === undefined ? t('toast.created') : t('toast.updated'));
    },
    onError: toastUnexpected,
  });
}

export function useDeleteService() {
  const http = useHttpClient();
  const refresh = useRefreshClinic();
  const t = useTranslations('clinic.services');

  return useMutation({
    mutationFn: (id: number) => deleteService(http, id),
    onSuccess: () => {
      refresh();
      toast.success(t('toast.deleted'));
    },
  });
}

export function useSaveAppointment() {
  const http = useHttpClient();
  const refresh = useRefreshClinic();
  const t = useTranslations('clinic.appointments');
  const toastUnexpected = useToastUnexpectedError();

  return useMutation({
    mutationFn: ({ original, values }: { original?: Appointment; values: AppointmentFormValues }) =>
      saveAppointment(http, original?.id, toAppointmentPayload(values, original)),
    onSuccess: (_result, { original }) => {
      refresh();
      toast.success(original ? t('toast.updated') : t('toast.created'));
    },
    onError: toastUnexpected,
  });
}

export function useDeleteAppointment() {
  const http = useHttpClient();
  const refresh = useRefreshClinic();
  const t = useTranslations('clinic.appointments');

  return useMutation({
    mutationFn: (id: number) => deleteAppointment(http, id),
    onSuccess: () => {
      refresh();
      toast.success(t('toast.deleted'));
    },
  });
}
