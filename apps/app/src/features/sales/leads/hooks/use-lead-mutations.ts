'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { useRefreshAuditLogs } from '@/features/audit';
import { useHttpClient } from '@/shared/hooks/use-http-client';
import { useToastUnexpectedError } from '@/shared/hooks/use-toast-unexpected-error';

import {
  assignLeads,
  changeLeadStage,
  createLead,
  deleteLead,
  logLeadActivity,
  updateLead,
} from '../api/lead-requests';
import { leadKeys } from '../constants';
import type { ActivityFormValues, LeadFormValues } from '../schemas';
import { toLeadPayload } from '../utils/mappers';

/** A lead appears in lists, stage counters and its own page, and every change is audited. */
function useRefreshLeads() {
  const queryClient = useQueryClient();
  const refreshAudit = useRefreshAuditLogs();

  return () => {
    void queryClient.invalidateQueries({ queryKey: leadKeys.all });
    void refreshAudit();
  };
}

/** Stage counters change when a lead disappears, but a single lead's own data must be left alone. */
function isStageQuery(query: { queryKey: readonly unknown[] }) {
  return query.queryKey[1] === 'stages';
}

interface SaveLeadInput {
  /** Present when editing; absent when creating. */
  id?: number;
  values: LeadFormValues;
}

export function useSaveLead() {
  const http = useHttpClient();
  const refresh = useRefreshLeads();
  const t = useTranslations('leads');
  const toastUnexpected = useToastUnexpectedError();

  return useMutation({
    mutationFn: ({ id, values }: SaveLeadInput) => {
      const body = toLeadPayload(values);
      return id === undefined ? createLead(http, body) : updateLead(http, id, body);
    },
    onSuccess: (_result, { id }) => {
      refresh();
      toast.success(id === undefined ? t('toast.created') : t('toast.updated'));
    },
    onError: toastUnexpected,
  });
}

export function useDeleteLead() {
  const http = useHttpClient();
  const queryClient = useQueryClient();
  const refreshAudit = useRefreshAuditLogs();
  const t = useTranslations('leads');
  const toastUnexpected = useToastUnexpectedError();

  return useMutation({
    mutationFn: (id: number) => deleteLead(http, id),
    onSuccess: (_result, id) => {
      // The deleted lead's own page is still mounted for a moment: refetching it would only 404.
      queryClient.removeQueries({ queryKey: leadKeys.detail(id) });
      queryClient.removeQueries({ queryKey: leadKeys.activities(id) });
      void queryClient.invalidateQueries({ queryKey: leadKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: leadKeys.all, predicate: isStageQuery });
      void refreshAudit();
      toast.success(t('toast.deleted'));
    },
    onError: toastUnexpected,
  });
}

interface ChangeStageInput {
  id: number;
  stageId: number;
  lostReason: string | null;
}

export function useChangeLeadStage() {
  const http = useHttpClient();
  const refresh = useRefreshLeads();
  const t = useTranslations('leads');
  const toastUnexpected = useToastUnexpectedError();

  return useMutation({
    mutationFn: ({ id, stageId, lostReason }: ChangeStageInput) =>
      changeLeadStage(http, id, { stage_id: stageId, lost_reason: lostReason }),
    onSuccess: () => {
      refresh();
      toast.success(t('toast.stageChanged'));
    },
    onError: toastUnexpected,
  });
}

interface AssignInput {
  leadIds: number[];
  ownerId: number;
}

export function useAssignLeads() {
  const http = useHttpClient();
  const refresh = useRefreshLeads();
  const t = useTranslations('leads');
  const toastUnexpected = useToastUnexpectedError();

  return useMutation({
    mutationFn: ({ leadIds, ownerId }: AssignInput) => assignLeads(http, leadIds, ownerId),
    onSuccess: () => {
      refresh();
      toast.success(t('toast.assigned'));
    },
    onError: toastUnexpected,
  });
}

export function useLogLeadActivity(leadId: number) {
  const http = useHttpClient();
  const refresh = useRefreshLeads();
  const t = useTranslations('leads');
  const toastUnexpected = useToastUnexpectedError();

  return useMutation({
    mutationFn: (values: ActivityFormValues) =>
      logLeadActivity(http, leadId, {
        type: values.type,
        body: values.body === '' ? null : values.body,
      }),
    onSuccess: () => {
      refresh();
      toast.success(t('toast.activityLogged'));
    },
    onError: toastUnexpected,
  });
}
