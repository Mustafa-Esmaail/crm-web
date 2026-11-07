'use client';

import { isApiError } from '@crm/api-client';

import { ConfirmDialog } from './confirm-dialog';

interface DeleteRecordDialogProps {
  title: string;
  description: string;
  confirmLabel: string;
  /** The delete mutation's state; a 422 refusal ("course has enrollments") stays in the dialog. */
  isPending: boolean;
  error: unknown;
  onConfirm: () => void;
  onClose: () => void;
}

export function DeleteRecordDialog({
  title,
  description,
  confirmLabel,
  isPending,
  error,
  onConfirm,
  onClose,
}: DeleteRecordDialogProps) {
  const refusal =
    isApiError(error) && error.status === 422
      ? (Object.values(error.fieldErrors)[0]?.[0] ?? error.message)
      : isApiError(error)
        ? error.message
        : null;

  return (
    <ConfirmDialog
      open
      onOpenChange={(isOpen) => !isOpen && !isPending && onClose()}
      tone="destructive"
      title={title}
      description={description}
      confirmLabel={confirmLabel}
      isPending={isPending}
      errorMessage={refusal}
      onConfirm={onConfirm}
    />
  );
}
