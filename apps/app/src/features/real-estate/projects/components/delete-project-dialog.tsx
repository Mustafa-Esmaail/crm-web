'use client';

import { isApiError } from '@crm/api-client';
import { useTranslations } from 'next-intl';

import { ConfirmDialog } from '@/shared/components/feedback/confirm-dialog';

import { useDeleteProject } from '../hooks/use-project-mutations';
import type { Project } from '../types';

interface DeleteProjectDialogProps {
  project: Project;
  onClose: () => void;
}

export function DeleteProjectDialog({ project, onClose }: DeleteProjectDialogProps) {
  const t = useTranslations('projects.delete');
  const remove = useDeleteProject();

  // The API refuses (422) while units exist; its message stays in the dialog.
  const refusal =
    isApiError(remove.error) && remove.error.status === 422
      ? (Object.values(remove.error.fieldErrors)[0]?.[0] ?? remove.error.message)
      : null;

  return (
    <ConfirmDialog
      open
      onOpenChange={(isOpen) => !isOpen && !remove.isPending && onClose()}
      tone="destructive"
      title={t('title', { name: project.name })}
      description={t('description')}
      confirmLabel={t('confirm')}
      isPending={remove.isPending}
      errorMessage={refusal}
      onConfirm={() => remove.mutate(project.id, { onSuccess: onClose })}
    />
  );
}
