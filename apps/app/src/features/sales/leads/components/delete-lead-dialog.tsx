'use client';

import { isApiError } from '@crm/api-client';
import { useTranslations } from 'next-intl';

import { ConfirmDialog } from '@/shared/components/feedback/confirm-dialog';

import { useDeleteLead } from '../hooks/use-lead-mutations';
import type { Lead } from '../types';

interface DeleteLeadDialogProps {
  lead: Lead;
  onClose: () => void;
  /** Runs after a successful delete, e.g. to leave the lead's own page. */
  onDeleted?: () => void;
}

export function DeleteLeadDialog({ lead, onClose, onDeleted }: DeleteLeadDialogProps) {
  const t = useTranslations('leads.delete');
  const remove = useDeleteLead();

  // The API may refuse (a 422); its message stays in the dialog instead of a toast.
  const refusal =
    isApiError(remove.error) && remove.error.status === 422
      ? (Object.values(remove.error.fieldErrors)[0]?.[0] ?? remove.error.message)
      : null;

  return (
    <ConfirmDialog
      open
      onOpenChange={(isOpen) => !isOpen && !remove.isPending && onClose()}
      tone="destructive"
      title={t('title', { name: lead.name })}
      description={t('description')}
      confirmLabel={t('confirm')}
      isPending={remove.isPending}
      errorMessage={refusal}
      onConfirm={() =>
        remove.mutate(lead.id, {
          onSuccess: () => {
            onClose();
            onDeleted?.();
          },
        })
      }
    />
  );
}
