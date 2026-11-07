'use client';

import { isApiError } from '@crm/api-client';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocale, useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { useRefreshAuditLogs } from '@/features/audit';
import { buildListParams } from '@/lib/api/list-params';
import { useHttpClient } from '@/shared/hooks/use-http-client';
import { useToastUnexpectedError } from '@/shared/hooks/use-toast-unexpected-error';

import {
  decideExportRequest,
  downloadExport,
  getExportRequests,
} from '../api/export-request-requests';

const exportKeys = { all: ['export-requests'] as const };

export function useExportRequestsQuery(query: {
  page: number;
  perPage: number;
  status?: string | null;
}) {
  const http = useHttpClient();
  const params = buildListParams({
    page: query.page,
    perPage: query.perPage,
    filters: { status: query.status },
  });

  return useQuery({
    queryKey: [...exportKeys.all, params],
    queryFn: ({ signal }) => getExportRequests(http, params, signal),
    placeholderData: keepPreviousData,
  });
}

export function useDecideExport() {
  const http = useHttpClient();
  const queryClient = useQueryClient();
  const refreshAudit = useRefreshAuditLogs();
  const t = useTranslations('exportRequests');
  const toastUnexpected = useToastUnexpectedError();

  return useMutation({
    mutationFn: (input: { id: number; decision: 'approve' | 'reject'; note: string | null }) =>
      decideExportRequest(http, input.id, input.decision, input.note),
    onSuccess: (_result, { decision }) => {
      void queryClient.invalidateQueries({ queryKey: exportKeys.all });
      void refreshAudit();
      toast.success(decision === 'approve' ? t('toast.approved') : t('toast.rejected'));
    },
    onError: toastUnexpected,
  });
}

export function useDownloadExport() {
  const locale = useLocale();
  const t = useTranslations('exportRequests');

  return useMutation({
    mutationFn: (id: number) => downloadExport(id, locale, t('downloadFailed')),
    onError: (error) => toast.error(isApiError(error) ? error.message : t('downloadFailed')),
  });
}
