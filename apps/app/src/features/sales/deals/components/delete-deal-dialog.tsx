'use client';

import { isApiError } from '@crm/api-client';
import { useTranslations } from 'next-intl';

import { ConfirmDialog } from '@/shared/components/feedback/confirm-dialog';

import { useDeleteDeal } from '../hooks/use-deal-mutations';
import type { Deal } from '../types';

interface DeleteDealDialogProps {
  deal: Deal;
  onClose: () => void;
  /** Runs after a successful delete, e.g. to leave a page that no longer has a deal. */
  onDeleted?: () => void;
}

export function DeleteDealDialog({ deal, onClose, onDeleted }: DeleteDealDialogProps) {
  const t = useTranslations('deals.delete');
  const remove = useDeleteDeal();

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
      title={t('title', { name: deal.title })}
      description={t('description')}
      confirmLabel={t('confirm')}
      isPending={remove.isPending}
      errorMessage={refusal}
      onConfirm={() =>
        remove.mutate(deal.id, {
          onSuccess: () => {
            onClose();
            onDeleted?.();
          },
        })
      }
    />
  );
}
