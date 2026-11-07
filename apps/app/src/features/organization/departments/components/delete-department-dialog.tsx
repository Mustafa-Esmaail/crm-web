'use client';

import { isApiError } from '@crm/api-client';
import { useTranslations } from 'next-intl';

import { ConfirmDialog } from '@/shared/components/feedback/confirm-dialog';

import { useDeleteDepartment } from '../hooks/use-department-mutations';
import type { Department } from '../types';

/** The API refuses a department that still has sub-departments, teams or people (422 keyed `department`). */
const BLOCKED_FIELD = 'department';

interface DeleteDepartmentDialogProps {
  department: Department;
  onClose: () => void;
}

export function DeleteDepartmentDialog({ department, onClose }: DeleteDepartmentDialogProps) {
  const t = useTranslations('departments.delete');
  const remove = useDeleteDepartment();

  const refusal =
    isApiError(remove.error) && remove.error.status === 422
      ? (remove.error.fieldErrors[BLOCKED_FIELD]?.[0] ?? remove.error.message)
      : null;

  return (
    <ConfirmDialog
      open
      onOpenChange={(isOpen) => !isOpen && !remove.isPending && onClose()}
      tone="destructive"
      title={t('title', { name: department.name })}
      description={t('description')}
      confirmLabel={t('confirm')}
      isPending={remove.isPending}
      errorMessage={refusal}
      onConfirm={() => remove.mutate(department.id, { onSuccess: onClose })}
    />
  );
}
