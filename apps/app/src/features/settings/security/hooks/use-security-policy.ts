'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { useRefreshAuditLogs } from '@/features/audit';
import { useHttpClient } from '@/shared/hooks/use-http-client';

import { getSecurityPolicy, updateSecurityPolicy } from '../api/security-policy-requests';
import type { SecurityFormValues } from '../schemas';
import { toSecurityPayload } from '../utils/mappers';

const securityKeys = { policy: ['security-policy'] as const };

export function useSecurityPolicyQuery(enabled: boolean) {
  const http = useHttpClient();

  return useQuery({
    queryKey: securityKeys.policy,
    enabled,
    queryFn: ({ signal }) => getSecurityPolicy(http, signal),
    select: (response) => response.data,
  });
}

/** Errors are left to the caller, which maps 422s onto the form and toasts the rest. */
export function useSaveSecurityPolicy() {
  const http = useHttpClient();
  const queryClient = useQueryClient();
  const refreshAudit = useRefreshAuditLogs();
  const t = useTranslations('securityPolicy');

  return useMutation({
    mutationFn: (values: SecurityFormValues) =>
      updateSecurityPolicy(http, toSecurityPayload(values)),
    onSuccess: (response) => {
      queryClient.setQueryData(securityKeys.policy, response);
      void refreshAudit();
      toast.success(t('toast.saved'));
    },
  });
}
