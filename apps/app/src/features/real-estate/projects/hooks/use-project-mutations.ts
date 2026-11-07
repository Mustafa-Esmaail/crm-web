'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { useHttpClient } from '@/shared/hooks/use-http-client';
import { useToastUnexpectedError } from '@/shared/hooks/use-toast-unexpected-error';

import { createProject, deleteProject, updateProject } from '../api/project-requests';
import { projectKeys } from '../constants';
import type { ProjectFormValues } from '../schemas';
import { toProjectPayload } from '../utils/mappers';

function useRefreshProjects() {
  const queryClient = useQueryClient();
  return () => void queryClient.invalidateQueries({ queryKey: projectKeys.all });
}

export function useSaveProject() {
  const http = useHttpClient();
  const refresh = useRefreshProjects();
  const t = useTranslations('projects');
  const toastUnexpected = useToastUnexpectedError();

  return useMutation({
    mutationFn: ({ id, values }: { id?: number; values: ProjectFormValues }) => {
      const body = toProjectPayload(values);
      return id === undefined ? createProject(http, body) : updateProject(http, id, body);
    },
    onSuccess: (_result, { id }) => {
      refresh();
      toast.success(id === undefined ? t('toast.created') : t('toast.updated'));
    },
    onError: toastUnexpected,
  });
}

export function useDeleteProject() {
  const http = useHttpClient();
  const refresh = useRefreshProjects();
  const t = useTranslations('projects');

  return useMutation({
    mutationFn: (id: number) => deleteProject(http, id),
    onSuccess: () => {
      refresh();
      toast.success(t('toast.deleted'));
    },
  });
}
