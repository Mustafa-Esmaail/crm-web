'use client';

import { useTranslations } from 'next-intl';

import { ConfirmDialog } from '@/shared/components/feedback/confirm-dialog';

import { useDeleteTask } from '../hooks/use-task-mutations';
import type { Task } from '../types';

interface DeleteTaskDialogProps {
  task: Task;
  onClose: () => void;
}

export function DeleteTaskDialog({ task, onClose }: DeleteTaskDialogProps) {
  const t = useTranslations('tasks.delete');
  const remove = useDeleteTask();

  return (
    <ConfirmDialog
      open
      onOpenChange={(isOpen) => !isOpen && !remove.isPending && onClose()}
      tone="destructive"
      title={t('title', { name: task.title })}
      description={t('description')}
      confirmLabel={t('confirm')}
      isPending={remove.isPending}
      onConfirm={() => remove.mutate(task.id, { onSuccess: onClose })}
    />
  );
}
