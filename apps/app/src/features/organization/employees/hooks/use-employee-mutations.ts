'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { useRefreshAuditLogs } from '@/features/audit';
import { useHttpClient } from '@/shared/hooks/use-http-client';
import { useToastUnexpectedError } from '@/shared/hooks/use-toast-unexpected-error';

import {
  activateEmployee,
  createEmployee,
  offboardEmployee,
  suspendEmployee,
  updateEmployee,
} from '../api/employee-requests';
import { employeeKeys } from '../constants';
import type { EmployeeFormValues, OffboardValues } from '../schemas';
import { toEmployeePayload, toOffboardPayload } from '../utils/mappers';

/**
 * Employees appear in lists, counters, detail pages and as managers elsewhere, so any change
 * refreshes the whole employees family. The audit trail changes too.
 */
function useRefreshEmployees() {
  const queryClient = useQueryClient();
  const refreshAudit = useRefreshAuditLogs();

  return () => {
    void queryClient.invalidateQueries({ queryKey: employeeKeys.all });
    void refreshAudit();
  };
}

interface SaveEmployeeInput {
  /** Present when editing; absent when creating. */
  id?: number;
  values: EmployeeFormValues;
}

export function useSaveEmployee() {
  const http = useHttpClient();
  const t = useTranslations('employees');
  const refresh = useRefreshEmployees();
  const toastUnexpected = useToastUnexpectedError();

  return useMutation({
    mutationFn: ({ id, values }: SaveEmployeeInput) => {
      const body = toEmployeePayload(values);
      return id === undefined ? createEmployee(http, body) : updateEmployee(http, id, body);
    },
    onSuccess: (_result, { id }) => {
      void refresh();
      toast.success(id === undefined ? t('toast.created') : t('toast.updated'));
    },
    onError: toastUnexpected,
  });
}

export function useSetEmployeeStatus() {
  const http = useHttpClient();
  const t = useTranslations('employees');
  const refresh = useRefreshEmployees();
  const toastUnexpected = useToastUnexpectedError();

  return useMutation({
    mutationFn: ({ id, action }: { id: number; action: 'suspend' | 'activate' }) =>
      action === 'suspend' ? suspendEmployee(http, id) : activateEmployee(http, id),
    onSuccess: (_result, { action }) => {
      void refresh();
      toast.success(action === 'suspend' ? t('toast.suspended') : t('toast.activated'));
    },
    onError: toastUnexpected,
  });
}

export function useOffboardEmployee() {
  const http = useHttpClient();
  const t = useTranslations('employees');
  const refresh = useRefreshEmployees();
  const toastUnexpected = useToastUnexpectedError();

  return useMutation({
    mutationFn: ({ id, values }: { id: number; values: OffboardValues }) =>
      offboardEmployee(http, id, toOffboardPayload(values)),
    onSuccess: () => {
      void refresh();
      toast.success(t('toast.offboarded'));
    },
    onError: toastUnexpected,
  });
}
