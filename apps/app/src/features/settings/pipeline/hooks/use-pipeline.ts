'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocale, useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { useHttpClient } from '@/shared/hooks/use-http-client';
import { useToastUnexpectedError } from '@/shared/hooks/use-toast-unexpected-error';

import { deleteRecord, getRules, getSettings, saveRecord } from '../api/pipeline-requests';
import type { RuleFormValues, SettingFormValues } from '../schemas';
import type { SettingKind } from '../types';
import { toRulePayload, toSettingPayload } from '../utils/mappers';

export const RULES_PATH = 'lead-distribution-rules';

const settingKeys = {
  all: ['pipeline-settings'] as const,
  list: (path: string, locale: string) => [...settingKeys.all, path, locale] as const,
};

export function useSettings(kind: SettingKind, enabled: boolean) {
  const http = useHttpClient();
  const locale = useLocale();

  return useQuery({
    queryKey: settingKeys.list(kind, locale),
    queryFn: ({ signal }) => getSettings(http, kind, signal),
    select: (response) =>
      [...response.data].sort((a, b) => (a.position ?? 0) - (b.position ?? 0) || a.id - b.id),
    enabled,
  });
}

export function useRules(enabled: boolean) {
  const http = useHttpClient();

  return useQuery({
    queryKey: settingKeys.list(RULES_PATH, 'all'),
    queryFn: ({ signal }) => getRules(http, signal),
    select: (response) => response.data,
    enabled,
  });
}

/** Stage and source names show up in the leads and deals screens, so those refresh too. */
function useRefreshPipeline() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: settingKeys.all });
    void queryClient.invalidateQueries({ queryKey: ['leads'] });
    void queryClient.invalidateQueries({ queryKey: ['deals'] });
  };
}

export function useSaveSetting(kind: SettingKind) {
  const http = useHttpClient();
  const refresh = useRefreshPipeline();
  const t = useTranslations('pipelineSettings');
  const toastUnexpected = useToastUnexpectedError();

  return useMutation({
    mutationFn: ({ id, values }: { id?: number; values: SettingFormValues }) =>
      saveRecord(http, kind, id, toSettingPayload(kind, values, id === undefined)),
    onSuccess: () => {
      refresh();
      toast.success(t('toast.saved'));
    },
    onError: toastUnexpected,
  });
}

export function useSaveRule() {
  const http = useHttpClient();
  const refresh = useRefreshPipeline();
  const t = useTranslations('pipelineSettings');
  const toastUnexpected = useToastUnexpectedError();

  return useMutation({
    mutationFn: ({ id, values }: { id?: number; values: RuleFormValues }) =>
      saveRecord(http, RULES_PATH, id, toRulePayload(values)),
    onSuccess: () => {
      refresh();
      toast.success(t('toast.saved'));
    },
    onError: toastUnexpected,
  });
}

export function useDeleteRecord(path: string) {
  const http = useHttpClient();
  const refresh = useRefreshPipeline();
  const t = useTranslations('pipelineSettings');

  return useMutation({
    mutationFn: (id: number) => deleteRecord(http, path, id),
    onSuccess: () => {
      refresh();
      toast.success(t('toast.deleted'));
    },
  });
}
