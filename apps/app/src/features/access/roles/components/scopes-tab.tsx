'use client';

import { isApiError } from '@crm/api-client';
import { Card, Skeleton } from '@crm/ui';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { ErrorState } from '@/shared/components/feedback/error-state';

import { useSaveScopes } from '../hooks/use-role-mutations';
import { usePermissionCatalog, useRoleScopesQuery } from '../hooks/use-role-queries';
import type { ScopeRow } from '../types';
import { sameDraft, scopesToDraft } from '../utils/drafts';
import { OptionSelect } from './option-select';
import { SaveBar } from './save-bar';

interface ScopesTabProps {
  roleId: number;
  canEdit: boolean;
}

export function ScopesTab({ roleId, canEdit }: ScopesTabProps) {
  const rows = useRoleScopesQuery(roleId);
  const catalog = usePermissionCatalog();

  if (rows.isError) return <ErrorState error={rows.error} onRetry={() => void rows.refetch()} />;
  if (catalog.isError)
    return <ErrorState error={catalog.error} onRetry={() => void catalog.refetch()} />;
  if (rows.isPending || catalog.isPending) return <Skeleton className="h-96 w-full rounded-lg" />;

  return (
    <ScopesEditor
      key={rows.dataUpdatedAt}
      roleId={roleId}
      rows={rows.data}
      options={catalog.data.scopes}
      canEdit={canEdit}
    />
  );
}

interface ScopesEditorProps extends ScopesTabProps {
  rows: ScopeRow[];
  options: Array<{ value: string; label: string }>;
}

function ScopesEditor({ roleId, rows, options, canEdit }: ScopesEditorProps) {
  const t = useTranslations('roles.scopes');
  const saved = scopesToDraft(rows);
  const [draft, setDraft] = useState(saved);
  const save = useSaveScopes(roleId);

  const errors = isApiError(save.error) ? [save.error.message] : [];

  return (
    <>
      <p className="text-small text-muted-foreground mb-4">{t('intro')}</p>
      <Card className="gap-0 divide-y py-0">
        {rows.map((row) => (
          <div
            key={row.module}
            className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <p className="text-small text-foreground font-semibold">{row.label}</p>
            <OptionSelect
              value={draft[row.module] ?? row.scope}
              options={options}
              label={row.label}
              disabled={!canEdit}
              onChange={(scope) => setDraft({ ...draft, [row.module]: scope })}
            />
          </div>
        ))}
      </Card>

      {canEdit && (
        <SaveBar
          isDirty={!sameDraft(draft, saved)}
          isSaving={save.isPending}
          errors={errors}
          onSave={() => save.mutate(draft)}
          onDiscard={() => setDraft(saved)}
        />
      )}
    </>
  );
}
