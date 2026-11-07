'use client';

import { isApiError } from '@crm/api-client';
import { useTranslations } from 'next-intl';

import { ConfirmDialog } from '@/shared/components/feedback/confirm-dialog';

import { useDeleteTeam } from '../hooks/use-team-mutations';
import type { Team } from '../types';

/** The API refuses a team that still has members (422 keyed `team`). */
const BLOCKED_FIELD = 'team';

interface DeleteTeamDialogProps {
  team: Team;
  onClose: () => void;
}

export function DeleteTeamDialog({ team, onClose }: DeleteTeamDialogProps) {
  const t = useTranslations('teams.delete');
  const remove = useDeleteTeam();

  const refusal =
    isApiError(remove.error) && remove.error.status === 422
      ? (remove.error.fieldErrors[BLOCKED_FIELD]?.[0] ?? remove.error.message)
      : null;

  return (
    <ConfirmDialog
      open
      onOpenChange={(isOpen) => !isOpen && !remove.isPending && onClose()}
      tone="destructive"
      title={t('title', { name: team.name })}
      description={t('description')}
      confirmLabel={t('confirm')}
      isPending={remove.isPending}
      errorMessage={refusal}
      onConfirm={() => remove.mutate(team.id, { onSuccess: onClose })}
    />
  );
}
