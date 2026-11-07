'use client';

import { isApiError } from '@crm/api-client';
import { useTranslations } from 'next-intl';

import { ConfirmDialog } from '@/shared/components/feedback/confirm-dialog';

import { useDeleteRole } from '../hooks/use-role-mutations';
import type { Role } from '../types';

interface DeleteRoleDialogProps {
  role: Role;
  onClose: () => void;
}

export function DeleteRoleDialog({ role, onClose }: DeleteRoleDialogProps) {
  const t = useTranslations('roles.delete');
  const remove = useDeleteRole();

  // A role still given to people is refused with a 422; its message stays in the dialog.
  const refusal =
    isApiError(remove.error) && remove.error.status === 422
      ? (Object.values(remove.error.fieldErrors)[0]?.[0] ?? remove.error.message)
      : null;

  return (
    <ConfirmDialog
      open
      onOpenChange={(isOpen) => !isOpen && !remove.isPending && onClose()}
      tone="destructive"
      title={t('title', { name: role.name })}
      description={t('description')}
      confirmLabel={t('confirm')}
      isPending={remove.isPending}
      errorMessage={refusal}
      onConfirm={() => remove.mutate(role.id, { onSuccess: onClose })}
    />
  );
}
