'use client';

import { isApiError } from '@crm/api-client';
import { useTranslations } from 'next-intl';

import { ConfirmDialog } from '@/shared/components/feedback/confirm-dialog';

import { useDeleteRecord } from '../hooks/use-pipeline';

interface DeleteRecordDialogProps {
  path: string;
  id: number;
  name: string;
  onClose: () => void;
}

export function DeleteRecordDialog({ path, id, name, onClose }: DeleteRecordDialogProps) {
  const t = useTranslations('pipelineSettings.delete');
  const remove = useDeleteRecord(path);

  // A stage still in use is refused with a 422; the reason stays in the dialog.
  const refusal =
    isApiError(remove.error) && remove.error.status === 422
      ? (Object.values(remove.error.fieldErrors)[0]?.[0] ?? remove.error.message)
      : null;

  return (
    <ConfirmDialog
      open
      onOpenChange={(isOpen) => !isOpen && !remove.isPending && onClose()}
      tone="destructive"
      title={t('title', { name })}
      description={t('description')}
      confirmLabel={t('confirm')}
      isPending={remove.isPending}
      errorMessage={refusal}
      onConfirm={() => remove.mutate(id, { onSuccess: onClose })}
    />
  );
}
