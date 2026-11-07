'use client';

import { isApiError } from '@crm/api-client';
import { Button } from '@crm/ui';
import { useMutation } from '@tanstack/react-query';
import { Download, Loader2, Upload } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';
import { toast } from 'sonner';

import { PERMISSIONS } from '@/config/permissions';
import type { QueryParams } from '@/lib/api/query-string';
import { Can } from '@/shared/components/auth/can';

import { exportLeads, saveBlob } from '../api/lead-transfer-requests';
import { ImportLeadsDialog } from './import-leads-dialog';

interface LeadTransferActionsProps {
  /** The list's current search and filters; the export covers exactly what is on screen. */
  exportParams: QueryParams;
}

export function LeadTransferActions({ exportParams }: LeadTransferActionsProps) {
  const t = useTranslations('leads');
  const locale = useLocale();
  const [importing, setImporting] = useState(false);

  const exportFile = useMutation({
    mutationFn: () => exportLeads(exportParams, { locale, fallbackMessage: t('export.failed') }),
    onSuccess: (result) => {
      if (result.kind === 'pending') {
        toast.info(t('export.pending'));
        return;
      }
      saveBlob(result.blob, 'leads.csv');
    },
    onError: (error) => toast.error(isApiError(error) ? error.message : t('export.failed')),
  });

  return (
    <>
      <Can permission={PERMISSIONS.leadsImport}>
        <Button variant="outline" onClick={() => setImporting(true)}>
          <Upload aria-hidden />
          {t('actions.import')}
        </Button>
      </Can>
      <Can permission={PERMISSIONS.leadsExport}>
        <Button
          variant="outline"
          disabled={exportFile.isPending}
          onClick={() => exportFile.mutate()}
        >
          {exportFile.isPending ? (
            <Loader2 className="animate-spin" aria-hidden />
          ) : (
            <Download aria-hidden />
          )}
          {t('actions.export')}
        </Button>
      </Can>
      {importing && <ImportLeadsDialog onClose={() => setImporting(false)} />}
    </>
  );
}
