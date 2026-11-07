'use client';

import { isApiError } from '@crm/api-client';
import { Card, Skeleton } from '@crm/ui';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { ErrorState } from '@/shared/components/feedback/error-state';

import { useSaveFields } from '../hooks/use-role-mutations';
import { usePermissionCatalog, useRoleFieldsQuery } from '../hooks/use-role-queries';
import type { FieldRow } from '../types';
import { fieldsToDraft, sameDraft } from '../utils/drafts';
import { OptionSelect } from './option-select';
import { SaveBar } from './save-bar';

interface FieldsTabProps {
  roleId: number;
  canEdit: boolean;
}

export function FieldsTab({ roleId, canEdit }: FieldsTabProps) {
  const rows = useRoleFieldsQuery(roleId);
  const catalog = usePermissionCatalog();

  if (rows.isError) return <ErrorState error={rows.error} onRetry={() => void rows.refetch()} />;
  if (catalog.isError)
    return <ErrorState error={catalog.error} onRetry={() => void catalog.refetch()} />;
  if (rows.isPending || catalog.isPending) return <Skeleton className="h-96 w-full rounded-lg" />;

  return (
    <FieldsEditor
      key={rows.dataUpdatedAt}
      roleId={roleId}
      rows={rows.data}
      options={catalog.data.field_access}
      moduleLabels={Object.fromEntries(catalog.data.modules.map((m) => [m.module, m.label]))}
      canEdit={canEdit}
    />
  );
}

interface FieldsEditorProps extends FieldsTabProps {
  rows: FieldRow[];
  options: Array<{ value: string; label: string }>;
  moduleLabels: Record<string, string>;
}

function FieldsEditor({ roleId, rows, options, moduleLabels, canEdit }: FieldsEditorProps) {
  const t = useTranslations('roles.fieldAccess');
  const saved = fieldsToDraft(rows);
  const [draft, setDraft] = useState(saved);
  const save = useSaveFields(roleId);

  const errors = isApiError(save.error) ? [save.error.message] : [];
  const modules = [...new Set(rows.map((row) => row.module))];

  return (
    <>
      <p className="text-small text-muted-foreground mb-4">{t('intro')}</p>
      <div className="space-y-4">
        {modules.map((module) => (
          <Card key={module} className="gap-0 py-0">
            <h3 className="text-card-title text-foreground border-b px-5 py-3 font-semibold">
              {moduleLabels[module] ?? module}
            </h3>
            <div className="divide-y">
              {rows
                .filter((row) => row.module === module)
                .map((row) => (
                  <div
                    key={row.field}
                    className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <p className="text-small text-foreground">{row.label}</p>
                    <OptionSelect
                      value={draft[module]?.[row.field] ?? row.access}
                      options={options}
                      label={`${moduleLabels[module] ?? module}: ${row.label}`}
                      disabled={!canEdit}
                      onChange={(access) =>
                        setDraft({ ...draft, [module]: { ...draft[module], [row.field]: access } })
                      }
                    />
                  </div>
                ))}
            </div>
          </Card>
        ))}
      </div>

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
