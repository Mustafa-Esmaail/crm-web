'use client';

import { Button, Card, Skeleton } from '@crm/ui';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { useTeamLookup } from '@/features/organization/teams';
import { ErrorState } from '@/shared/components/feedback/error-state';

import { RULES_PATH, useRules } from '../hooks/use-pipeline';
import type { DistributionRule } from '../types';
import { DeleteRecordDialog } from './delete-record-dialog';
import { RuleFormDialog } from './rule-form-dialog';

type FormTarget = { rule: DistributionRule | null } | null;

export function RuleList() {
  const t = useTranslations('pipelineSettings');
  const query = useRules(true);
  const teams = useTeamLookup();
  const [formTarget, setFormTarget] = useState<FormTarget>(null);
  const [deleteTarget, setDeleteTarget] = useState<DistributionRule | null>(null);

  const teamName = (id: number) =>
    teams.options.find((option) => option.value === String(id))?.label ?? `#${id}`;

  return (
    <Card className="gap-0 p-0">
      <div className="flex items-center justify-between gap-3 border-b px-5 py-4">
        <div>
          <h2 className="font-semibold">{t('kinds.rules.title')}</h2>
          <p className="text-small text-muted-foreground">{t('kinds.rules.description')}</p>
        </div>
        <Button onClick={() => setFormTarget({ rule: null })}>
          <Plus aria-hidden />
          {t('kinds.rules.create')}
        </Button>
      </div>

      {query.error ? (
        <ErrorState error={query.error} onRetry={() => void query.refetch()} />
      ) : query.isLoading ? (
        <div className="p-5">
          <Skeleton className="h-10 w-full" />
        </div>
      ) : (query.data ?? []).length === 0 ? (
        <p className="text-small text-muted-foreground p-5">{t('empty')}</p>
      ) : (
        <ul className="divide-y">
          {(query.data ?? []).map((rule) => (
            <li key={rule.id} className="flex items-center gap-3 px-5 py-3">
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{teamName(rule.team_id)}</p>
                <p className="text-caption text-text-faint">{t(`strategies.${rule.strategy}`)}</p>
              </div>
              {!rule.is_active && (
                <span className="bg-muted text-muted-foreground text-caption rounded-full border px-2.5 py-0.5">
                  {t('flags.inactive')}
                </span>
              )}
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={`${t('edit')}: ${teamName(rule.team_id)}`}
                onClick={() => setFormTarget({ rule })}
              >
                <Pencil aria-hidden />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={`${t('delete.confirm')}: ${teamName(rule.team_id)}`}
                onClick={() => setDeleteTarget(rule)}
              >
                <Trash2 aria-hidden />
              </Button>
            </li>
          ))}
        </ul>
      )}

      {formTarget && (
        <RuleFormDialog
          key={formTarget.rule?.id ?? 'new'}
          rule={formTarget.rule}
          onClose={() => setFormTarget(null)}
        />
      )}
      {deleteTarget && (
        <DeleteRecordDialog
          path={RULES_PATH}
          id={deleteTarget.id}
          name={teamName(deleteTarget.team_id)}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </Card>
  );
}
