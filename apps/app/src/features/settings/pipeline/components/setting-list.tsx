'use client';

import { Button, Card, Skeleton } from '@crm/ui';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { ErrorState } from '@/shared/components/feedback/error-state';

import { useSettings } from '../hooks/use-pipeline';
import { type Setting, type SettingKind, STAGE_KINDS } from '../types';
import { DeleteRecordDialog } from './delete-record-dialog';
import { SettingFormDialog } from './setting-form-dialog';

type FormTarget = { setting: Setting | null } | null;

export function SettingList({ kind }: { kind: SettingKind }) {
  const t = useTranslations('pipelineSettings');
  const query = useSettings(kind, true);
  const [formTarget, setFormTarget] = useState<FormTarget>(null);
  const [deleteTarget, setDeleteTarget] = useState<Setting | null>(null);
  const isStage = STAGE_KINDS.includes(kind);

  return (
    <Card className="gap-0 p-0">
      <div className="flex items-center justify-between gap-3 border-b px-5 py-4">
        <div>
          <h2 className="font-semibold">{t(`kinds.${kind}.title`)}</h2>
          <p className="text-small text-muted-foreground">{t(`kinds.${kind}.description`)}</p>
        </div>
        <Button onClick={() => setFormTarget({ setting: null })}>
          <Plus aria-hidden />
          {t(`kinds.${kind}.create`)}
        </Button>
      </div>

      {query.error ? (
        <ErrorState error={query.error} onRetry={() => void query.refetch()} />
      ) : query.isLoading ? (
        <div className="space-y-2 p-5">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : (query.data ?? []).length === 0 ? (
        <p className="text-small text-muted-foreground p-5">{t('empty')}</p>
      ) : (
        <ul className="divide-y">
          {(query.data ?? []).map((setting) => (
            <li key={setting.id} className="flex items-center gap-3 px-5 py-3">
              {isStage && (
                <span
                  className="size-3 shrink-0 rounded-full border"
                  style={setting.color ? { backgroundColor: setting.color } : undefined}
                  aria-hidden
                />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{setting.name}</p>
                <p className="text-caption text-text-faint" dir="ltr">
                  {setting.key}
                </p>
              </div>
              {setting.is_won && (
                <span className="bg-success-soft text-success text-caption rounded-full px-2.5 py-0.5">
                  {t('flags.won')}
                </span>
              )}
              {setting.is_lost && (
                <span className="bg-destructive-soft text-destructive text-caption rounded-full px-2.5 py-0.5">
                  {t('flags.lost')}
                </span>
              )}
              {setting.is_active === false && (
                <span className="bg-muted text-muted-foreground text-caption rounded-full border px-2.5 py-0.5">
                  {t('flags.inactive')}
                </span>
              )}
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={`${t('edit')}: ${setting.name}`}
                onClick={() => setFormTarget({ setting })}
              >
                <Pencil aria-hidden />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={`${t('delete.confirm')}: ${setting.name}`}
                onClick={() => setDeleteTarget(setting)}
              >
                <Trash2 aria-hidden />
              </Button>
            </li>
          ))}
        </ul>
      )}

      {formTarget && (
        <SettingFormDialog
          key={formTarget.setting?.id ?? 'new'}
          kind={kind}
          setting={formTarget.setting}
          onClose={() => setFormTarget(null)}
        />
      )}
      {deleteTarget && (
        <DeleteRecordDialog
          path={kind}
          id={deleteTarget.id}
          name={deleteTarget.name}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </Card>
  );
}
