'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { useHttpClient } from '@/shared/hooks/use-http-client';
import { useToastUnexpectedError } from '@/shared/hooks/use-toast-unexpected-error';

import { createBranch, deleteBranch, updateBranch } from '../api/branch-requests';
import { branchKeys } from '../constants';
import type { BranchFormValues } from '../schemas';
import { toBranchPayload } from '../utils/mappers';

interface SaveBranchInput {
  /** Present when editing; absent when creating. */
  id?: number;
  values: BranchFormValues;
}

export function useSaveBranch() {
  const http = useHttpClient();
  const queryClient = useQueryClient();
  const t = useTranslations('branches');
  const toastUnexpected = useToastUnexpectedError();

  return useMutation({
    mutationFn: ({ id, values }: SaveBranchInput) => {
      const body = toBranchPayload(values);
      return id === undefined ? createBranch(http, body) : updateBranch(http, id, body);
    },
    onSuccess: (_result, { id }) => {
      // Lists only: a branch change never affects other features' cached data here.
      void queryClient.invalidateQueries({ queryKey: branchKeys.lists() });
      toast.success(id === undefined ? t('toast.created') : t('toast.updated'));
    },
    onError: toastUnexpected,
  });
}

export function useDeleteBranch() {
  const http = useHttpClient();
  const queryClient = useQueryClient();
  const t = useTranslations('branches');
  const toastUnexpected = useToastUnexpectedError();

  return useMutation({
    mutationFn: (id: number) => deleteBranch(http, id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: branchKeys.lists() });
      toast.success(t('toast.deleted'));
    },
    onError: toastUnexpected,
  });
}
