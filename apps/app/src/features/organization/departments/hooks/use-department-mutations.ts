'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { useHttpClient } from '@/shared/hooks/use-http-client';
import { useToastUnexpectedError } from '@/shared/hooks/use-toast-unexpected-error';

import { createDepartment, deleteDepartment, updateDepartment } from '../api/department-requests';
import { departmentKeys } from '../constants';
import type { DepartmentFormValues, MoveDepartmentValues } from '../schemas';
import { toDepartmentPayload, toMovePayload } from '../utils/mappers';

/** Tree and lists show the same records, so any change refreshes both. */
function useRefreshDepartments() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: departmentKeys.all });
}

interface SaveDepartmentInput {
  /** Present when editing; absent when creating. */
  id?: number;
  values: DepartmentFormValues;
}

export function useSaveDepartment() {
  const http = useHttpClient();
  const t = useTranslations('departments');
  const refresh = useRefreshDepartments();
  const toastUnexpected = useToastUnexpectedError();

  return useMutation({
    mutationFn: ({ id, values }: SaveDepartmentInput) => {
      const body = toDepartmentPayload(values);
      return id === undefined ? createDepartment(http, body) : updateDepartment(http, id, body);
    },
    onSuccess: (_result, { id }) => {
      void refresh();
      toast.success(id === undefined ? t('toast.created') : t('toast.updated'));
    },
    onError: toastUnexpected,
  });
}

export function useMoveDepartment() {
  const http = useHttpClient();
  const t = useTranslations('departments');
  const refresh = useRefreshDepartments();
  const toastUnexpected = useToastUnexpectedError();

  return useMutation({
    mutationFn: ({ id, values }: { id: number; values: MoveDepartmentValues }) =>
      updateDepartment(http, id, toMovePayload(values)),
    onSuccess: () => {
      void refresh();
      toast.success(t('toast.moved'));
    },
    onError: toastUnexpected,
  });
}

export function useDeleteDepartment() {
  const http = useHttpClient();
  const t = useTranslations('departments');
  const refresh = useRefreshDepartments();
  const toastUnexpected = useToastUnexpectedError();

  return useMutation({
    mutationFn: (id: number) => deleteDepartment(http, id),
    onSuccess: () => {
      void refresh();
      toast.success(t('toast.deleted'));
    },
    onError: toastUnexpected,
  });
}
