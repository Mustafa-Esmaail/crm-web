'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { useHttpClient } from '@/shared/hooks/use-http-client';
import { useToastUnexpectedError } from '@/shared/hooks/use-toast-unexpected-error';

import { assignTask, createTask, deleteTask, setTaskDone, updateTask } from '../api/task-requests';
import { taskKeys } from '../constants';
import type { TaskFormValues } from '../schemas';
import { type TaskRelation, toTaskPayload } from '../utils/mappers';

function useRefreshTasks() {
  const queryClient = useQueryClient();
  return () => void queryClient.invalidateQueries({ queryKey: taskKeys.all });
}

export function useSaveTask() {
  const http = useHttpClient();
  const refresh = useRefreshTasks();
  const t = useTranslations('tasks');
  const toastUnexpected = useToastUnexpectedError();

  return useMutation({
    mutationFn: ({
      id,
      values,
      related,
    }: {
      id?: number;
      values: TaskFormValues;
      related?: TaskRelation;
    }) => {
      const isCreate = id === undefined;
      const body = toTaskPayload(values, { isCreate, related });
      return isCreate ? createTask(http, body) : updateTask(http, id, body);
    },
    onSuccess: (_result, { id }) => {
      refresh();
      toast.success(id === undefined ? t('toast.created') : t('toast.updated'));
    },
    onError: toastUnexpected,
  });
}

export function useDeleteTask() {
  const http = useHttpClient();
  const refresh = useRefreshTasks();
  const t = useTranslations('tasks');
  const toastUnexpected = useToastUnexpectedError();

  return useMutation({
    mutationFn: (id: number) => deleteTask(http, id),
    onSuccess: () => {
      refresh();
      toast.success(t('toast.deleted'));
    },
    onError: toastUnexpected,
  });
}

export function useAssignTask() {
  const http = useHttpClient();
  const refresh = useRefreshTasks();
  const t = useTranslations('tasks');
  const toastUnexpected = useToastUnexpectedError();

  return useMutation({
    mutationFn: ({ id, ownerId }: { id: number; ownerId: number }) => assignTask(http, id, ownerId),
    onSuccess: () => {
      refresh();
      toast.success(t('toast.assigned'));
    },
    onError: toastUnexpected,
  });
}

export function useToggleTask() {
  const http = useHttpClient();
  const refresh = useRefreshTasks();
  const t = useTranslations('tasks');
  const toastUnexpected = useToastUnexpectedError();

  return useMutation({
    mutationFn: ({ id, done }: { id: number; done: boolean }) => setTaskDone(http, id, done),
    onSuccess: (_result, { done }) => {
      refresh();
      toast.success(done ? t('toast.completed') : t('toast.reopened'));
    },
    onError: toastUnexpected,
  });
}
