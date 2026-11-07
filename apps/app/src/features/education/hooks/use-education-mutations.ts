'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { useRefreshAuditLogs } from '@/features/audit';
import { useHttpClient } from '@/shared/hooks/use-http-client';
import { useToastUnexpectedError } from '@/shared/hooks/use-toast-unexpected-error';

import {
  deleteCourse,
  deleteEnrollment,
  saveCourse,
  saveEnrollment,
} from '../api/education-requests';
import { educationKeys } from '../constants';
import type { CourseFormValues, EnrollmentFormValues } from '../schemas';
import { toCoursePayload, toEnrollmentPayload } from '../utils/mappers';

/** Enrollments change a course's seat count, so any change refreshes both lists. */
function useRefreshEducation() {
  const queryClient = useQueryClient();
  const refreshAudit = useRefreshAuditLogs();
  return () => {
    void queryClient.invalidateQueries({ queryKey: educationKeys.all });
    void refreshAudit();
  };
}

export function useSaveCourse() {
  const http = useHttpClient();
  const refresh = useRefreshEducation();
  const t = useTranslations('education.courses');
  const toastUnexpected = useToastUnexpectedError();

  return useMutation({
    mutationFn: ({ id, values }: { id?: number; values: CourseFormValues }) =>
      saveCourse(http, id, toCoursePayload(values)),
    onSuccess: (_result, { id }) => {
      refresh();
      toast.success(id === undefined ? t('toast.created') : t('toast.updated'));
    },
    onError: toastUnexpected,
  });
}

export function useDeleteCourse() {
  const http = useHttpClient();
  const refresh = useRefreshEducation();
  const t = useTranslations('education.courses');

  return useMutation({
    mutationFn: (id: number) => deleteCourse(http, id),
    onSuccess: () => {
      refresh();
      toast.success(t('toast.deleted'));
    },
  });
}

export function useSaveEnrollment() {
  const http = useHttpClient();
  const refresh = useRefreshEducation();
  const t = useTranslations('education.enrollments');
  const toastUnexpected = useToastUnexpectedError();

  return useMutation({
    mutationFn: ({ id, values }: { id?: number; values: EnrollmentFormValues }) =>
      saveEnrollment(http, id, toEnrollmentPayload(values, id === undefined)),
    onSuccess: (_result, { id }) => {
      refresh();
      toast.success(id === undefined ? t('toast.created') : t('toast.updated'));
    },
    onError: toastUnexpected,
  });
}

export function useDeleteEnrollment() {
  const http = useHttpClient();
  const refresh = useRefreshEducation();
  const t = useTranslations('education.enrollments');

  return useMutation({
    mutationFn: (id: number) => deleteEnrollment(http, id),
    onSuccess: () => {
      refresh();
      toast.success(t('toast.deleted'));
    },
  });
}
