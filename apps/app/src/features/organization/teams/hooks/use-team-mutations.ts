'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { useHttpClient } from '@/shared/hooks/use-http-client';
import { useToastUnexpectedError } from '@/shared/hooks/use-toast-unexpected-error';

import { createTeam, deleteTeam, updateTeam } from '../api/team-requests';
import { teamKeys } from '../constants';
import type { TeamFormValues } from '../schemas';
import { toTeamPayload } from '../utils/mappers';

interface SaveTeamInput {
  /** Present when editing; absent when creating. */
  id?: number;
  values: TeamFormValues;
}

export function useSaveTeam() {
  const http = useHttpClient();
  const queryClient = useQueryClient();
  const t = useTranslations('teams');
  const toastUnexpected = useToastUnexpectedError();

  return useMutation({
    mutationFn: ({ id, values }: SaveTeamInput) => {
      const body = toTeamPayload(values);
      return id === undefined ? createTeam(http, body) : updateTeam(http, id, body);
    },
    onSuccess: (_result, { id }) => {
      void queryClient.invalidateQueries({ queryKey: teamKeys.lists() });
      toast.success(id === undefined ? t('toast.created') : t('toast.updated'));
    },
    onError: toastUnexpected,
  });
}

export function useDeleteTeam() {
  const http = useHttpClient();
  const queryClient = useQueryClient();
  const t = useTranslations('teams');
  const toastUnexpected = useToastUnexpectedError();

  return useMutation({
    mutationFn: (id: number) => deleteTeam(http, id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: teamKeys.lists() });
      toast.success(t('toast.deleted'));
    },
    onError: toastUnexpected,
  });
}
