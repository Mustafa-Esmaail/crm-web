'use client';

import { isApiError } from '@crm/api-client';
import { useTranslations } from 'next-intl';

import { ConfirmDialog } from '@/shared/components/feedback/confirm-dialog';

import { useDeleteBranch } from '../hooks/use-branch-mutations';
import type { Branch } from '../types';

/** The API refuses a non-empty branch with a 422 keyed `branch`; that message stays in the dialog. */
const BLOCKED_FIELD = 'branch';

interface DeleteBranchDialogProps {
  branch: Branch;
  onClose: () => void;
}

export function DeleteBranchDialog({ branch, onClose }: DeleteBranchDialogProps) {
  const t = useTranslations('branches.delete');
  const remove = useDeleteBranch();

  const refusal =
    isApiError(remove.error) && remove.error.status === 422
      ? (remove.error.fieldErrors[BLOCKED_FIELD]?.[0] ?? remove.error.message)
      : null;

  return (
    <ConfirmDialog
      open
      onOpenChange={(isOpen) => !isOpen && !remove.isPending && onClose()}
      tone="destructive"
      title={t('title', { name: branch.name })}
      description={t('description')}
      confirmLabel={t('confirm')}
      isPending={remove.isPending}
      errorMessage={refusal}
      onConfirm={() => remove.mutate(branch.id, { onSuccess: onClose })}
    />
  );
}
