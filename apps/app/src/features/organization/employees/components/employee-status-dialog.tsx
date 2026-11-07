'use client';

import { isApiError } from '@crm/api-client';
import { useTranslations } from 'next-intl';

import { ConfirmDialog } from '@/shared/components/feedback/confirm-dialog';

import { useSetEmployeeStatus } from '../hooks/use-employee-mutations';
import type { Employee } from '../types';

export type StatusAction = 'suspend' | 'activate';

interface EmployeeStatusDialogProps {
  employee: Employee;
  action: StatusAction;
  onClose: () => void;
}

/** Suspend or re-activate. Suspending is the cautious (destructive-toned) one; activating is not. */
export function EmployeeStatusDialog({ employee, action, onClose }: EmployeeStatusDialogProps) {
  const t = useTranslations(`employees.status.${action}`);
  const mutation = useSetEmployeeStatus();

  const refusal =
    isApiError(mutation.error) && mutation.error.status === 422 ? mutation.error.message : null;

  return (
    <ConfirmDialog
      open
      onOpenChange={(isOpen) => !isOpen && !mutation.isPending && onClose()}
      tone={action === 'suspend' ? 'destructive' : 'default'}
      title={t('title', { name: employee.name })}
      description={t('description')}
      confirmLabel={t('confirm')}
      isPending={mutation.isPending}
      errorMessage={refusal}
      onConfirm={() => mutation.mutate({ id: employee.id, action }, { onSuccess: onClose })}
    />
  );
}
