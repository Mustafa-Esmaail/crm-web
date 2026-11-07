'use client';

import { isApiError } from '@crm/api-client';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@crm/ui';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Download, Loader2, Upload } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useRef, useState } from 'react';
import { toast } from 'sonner';

import { useRefreshAuditLogs } from '@/features/audit';

import {
  downloadImportTemplate,
  importLeads,
  type ImportReport,
  saveBlob,
} from '../api/lead-transfer-requests';
import { leadKeys } from '../constants';

interface ImportLeadsDialogProps {
  onClose: () => void;
}

/** Two steps on purpose: "check" runs the API's dry run, "import" then creates the valid rows. */
export function ImportLeadsDialog({ onClose }: ImportLeadsDialogProps) {
  const t = useTranslations('leads.import');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const queryClient = useQueryClient();
  const refreshAudit = useRefreshAuditLogs();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [report, setReport] = useState<ImportReport | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const context = { locale, fallbackMessage: t('failed') };

  const run = useMutation({
    mutationFn: (dryRun: boolean) => importLeads({ file: file as File, dryRun }, context),
    onSuccess: (result) => {
      setMessage(null);
      setReport(result);
      if (!result.dry_run) {
        void queryClient.invalidateQueries({ queryKey: leadKeys.all });
        void refreshAudit();
        toast.success(t('done', { count: result.created }));
      }
    },
    onError: (error) => setMessage(isApiError(error) ? error.message : t('failed')),
  });

  const template = useMutation({
    mutationFn: () => downloadImportTemplate(context),
    onSuccess: (result) =>
      result.kind === 'file' && saveBlob(result.blob, 'leads-import-template.csv'),
    onError: (error) => setMessage(isApiError(error) ? error.message : t('failed')),
  });

  const imported = report !== null && !report.dry_run;
  const canImport = report?.dry_run === true && report.valid > 0;

  return (
    <Dialog open onOpenChange={(isOpen) => !isOpen && !run.isPending && onClose()}>
      <DialogContent className="max-h-dvh overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>{t('description')}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={template.isPending}
            onClick={() => template.mutate()}
          >
            <Download aria-hidden />
            {t('template')}
          </Button>

          <div className="flex items-center gap-3">
            <input
              ref={inputRef}
              type="file"
              accept=".csv,text/csv"
              className="sr-only"
              aria-label={t('file')}
              onChange={(event) => {
                setFile(event.target.files?.[0] ?? null);
                setReport(null);
                setMessage(null);
              }}
            />
            <Button type="button" variant="outline" onClick={() => inputRef.current?.click()}>
              <Upload aria-hidden />
              {t('choose')}
            </Button>
            <span className="text-small text-muted-foreground truncate">
              {file ? file.name : t('noFile')}
            </span>
          </div>

          {message && (
            <p
              role="alert"
              className="bg-destructive-soft text-destructive text-small rounded-md px-3 py-2"
            >
              {message}
            </p>
          )}

          {report && (
            <div className="space-y-3" aria-live="polite">
              <dl className="text-small grid grid-cols-2 gap-2 sm:grid-cols-4">
                {(
                  [
                    ['total', report.total],
                    ['valid', report.valid],
                    ['duplicates', report.duplicates.length],
                    ['failed', report.failed.length],
                  ] as const
                ).map(([key, value]) => (
                  <div key={key} className="bg-muted rounded-md px-3 py-2">
                    <dt className="text-caption text-muted-foreground">{t(`report.${key}`)}</dt>
                    <dd className="num text-lg font-semibold">{value}</dd>
                  </div>
                ))}
              </dl>
              {report.failed.length > 0 && (
                <ul className="text-small max-h-40 space-y-1 overflow-y-auto">
                  {report.failed.map((row) => (
                    <li key={row.row}>
                      <span className="font-medium">{t('report.row', { row: row.row })}</span>{' '}
                      <span className="text-muted-foreground">
                        {Object.values(row.errors).flat().join(' · ')}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              {report.duplicates.length > 0 && (
                <p className="text-small text-muted-foreground">
                  {t('report.duplicatesHint', {
                    rows: report.duplicates.map((row) => row.row).join(', '),
                  })}
                </p>
              )}
              {imported && (
                <p className="text-success text-small font-medium">
                  {t('done', { count: report.created })}
                </p>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={run.isPending}>
            {imported ? tCommon('close') : tCommon('cancel')}
          </Button>
          {!imported && (
            <>
              <Button
                type="button"
                variant="outline"
                disabled={!file || run.isPending}
                onClick={() => run.mutate(true)}
              >
                {run.isPending && run.variables === true && (
                  <Loader2 className="animate-spin" aria-hidden />
                )}
                {t('check')}
              </Button>
              <Button
                type="button"
                disabled={!canImport || run.isPending}
                onClick={() => run.mutate(false)}
              >
                {run.isPending && run.variables === false && (
                  <Loader2 className="animate-spin" aria-hidden />
                )}
                {t('import', { count: report?.valid ?? 0 })}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
