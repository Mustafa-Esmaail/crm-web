import { normalizeApiError } from '@crm/api-client';
import { z } from 'zod';

import { LOCALE_HEADER, PROXY_PREFIX, REQUEST_ID_HEADER } from '@/config/site';
import { buildQueryString, type QueryParams } from '@/lib/api/query-string';

// The shared HttpClient only speaks JSON; these two calls move files, so they use fetch directly
// through the same proxy (the session cookie rides along, the token never reaches the browser).

export const importReportSchema = z.object({
  data: z.object({
    dry_run: z.boolean(),
    total: z.number(),
    valid: z.number(),
    created: z.number(),
    duplicates: z.array(z.object({ row: z.number(), phone: z.string() })),
    failed: z.array(
      z.object({ row: z.number(), errors: z.record(z.string(), z.array(z.string())) }),
    ),
  }),
});

export type ImportReport = z.infer<typeof importReportSchema>['data'];

interface TransferContext {
  locale: string;
  fallbackMessage: string;
}

function headers(locale: string): Record<string, string> {
  return {
    Accept: 'application/json',
    [LOCALE_HEADER]: locale,
    [REQUEST_ID_HEADER]: crypto.randomUUID(),
  };
}

async function failure(response: Response, fallbackMessage: string) {
  const text = await response.text();
  let payload: unknown;
  try {
    payload = text ? JSON.parse(text) : undefined;
  } catch {
    payload = undefined;
  }
  return normalizeApiError(response.status, payload, fallbackMessage);
}

export async function importLeads(
  { file, dryRun, teamId }: { file: File; dryRun: boolean; teamId?: number },
  { locale, fallbackMessage }: TransferContext,
): Promise<ImportReport> {
  const body = new FormData();
  body.append('file', file);
  body.append('dry_run', dryRun ? '1' : '0');
  if (teamId !== undefined) body.append('team_id', String(teamId));

  const response = await fetch(`${PROXY_PREFIX}/leads/import`, {
    method: 'POST',
    credentials: 'same-origin',
    headers: headers(locale),
    body,
  });
  if (!response.ok) throw await failure(response, fallbackMessage);

  return importReportSchema.parse(await response.json()).data;
}

export type FileResult = { kind: 'file'; blob: Blob } | { kind: 'pending' };

async function getFile(
  path: string,
  params: QueryParams | undefined,
  { locale, fallbackMessage }: TransferContext,
): Promise<FileResult> {
  const response = await fetch(`${PROXY_PREFIX}${path}${buildQueryString(params)}`, {
    credentials: 'same-origin',
    headers: { ...headers(locale), Accept: 'text/csv, application/json' },
  });
  if (!response.ok) throw await failure(response, fallbackMessage);
  // 202: the company requires approval, so there is no file yet.
  if (response.status === 202) return { kind: 'pending' };

  return { kind: 'file', blob: await response.blob() };
}

export function downloadImportTemplate(context: TransferContext) {
  return getFile('/leads/import/template', undefined, context);
}

/** The CSV for the given filters, or `pending` when the export needs a manager's approval. */
export function exportLeads(params: QueryParams, context: TransferContext) {
  return getFile('/leads/export', params, context);
}

/** Hands a blob to the browser as a file download. */
export function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
