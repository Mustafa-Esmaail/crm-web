'use client';

import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query';

import { buildListParams } from '@/lib/api/list-params';
import { useHttpClient } from '@/shared/hooks/use-http-client';

import { getAuditLogs } from '../api/audit-requests';
import { auditKeys } from '../constants';

export interface AuditLogQuery {
  userId?: string | null;
  action?: string | null;
  module?: string | null;
  auditableType?: string | null;
  auditableId?: number | null;
  from?: string | null;
  to?: string | null;
  page?: number;
  perPage?: number;
}

function toParams(query: AuditLogQuery) {
  return buildListParams({
    page: query.page,
    perPage: query.perPage,
    filters: {
      user_id: query.userId,
      action: query.action,
      module: query.module,
      auditable_type: query.auditableType,
      auditable_id: query.auditableId,
      from: query.from,
      to: query.to,
    },
  });
}

export function useAuditLogsQuery(query: AuditLogQuery, options: { enabled?: boolean } = {}) {
  const http = useHttpClient();
  const params = toParams(query);

  return useQuery({
    queryKey: auditKeys.list(params),
    queryFn: ({ signal }) => getAuditLogs(http, params, signal),
    placeholderData: keepPreviousData,
    enabled: options.enabled ?? true,
  });
}

/** Other features call this after a change so the activity trail shows it straight away. */
export function useRefreshAuditLogs() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: auditKeys.all });
}
