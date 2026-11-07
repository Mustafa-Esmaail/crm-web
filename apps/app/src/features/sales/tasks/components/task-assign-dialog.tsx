'use client';

import { isApiError } from '@crm/api-client';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@crm/ui';
import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { useEmployeeOptions } from '@/features/organization/employees';
import { AsyncSelectField } from '@/shared/components/form/async-select-field';
import { FormAlert } from '@/shared/components/form/form-alert';
import { mapLaravelErrorsToForm } from '@/shared/components/form/map-laravel-errors';
import { useZodForm } from '@/shared/components/form/use-zod-form';

import { useAssignTask } from '../hooks/use-task-mutations';
import { taskAssignSchema, type TaskAssignValues } from '../schemas';
import type { Task } from '../types';

interface TaskAssignDialogProps {
  task: Task;
  onClose: () => void;
}

export function TaskAssignDialog({ task, onClose }: TaskAssignDialogProps) {
  const t = useTranslations('tasks.assign');
  const tCommon = useTranslations('common');
  const [alertMessages, setAlertMessages] = useState<string[]>([]);
  const assign = useAssignTask();

  const { control, handleSubmit, setError } = useZodForm(taskAssignSchema, { owner_id: '' });

  const submit = (values: TaskAssignValues) => {
    setAlertMessages([]);
    assign.mutate(
      { id: task.id, ownerId: Number(values.owner_id) },
      {
        onSuccess: onClose,
        onError: (error) => {
          if (!isApiError(error)) return;
          setAlertMessages(mapLaravelErrorsToForm(error, setError, ['owner_id']).unmapped);
        },
      },
    );
  };

  return (
    <Dialog open onOpenChange={(isOpen) => !isOpen && !assign.isPending && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('title', { name: task.title })}</DialogTitle>
          <DialogDescription>
            {task.owner ? t('current', { name: task.owner.name }) : t('unassigned')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit)} noValidate className="space-y-4">
          <FormAlert messages={alertMessages} />
          <AsyncSelectField
            control={control}
            name="owner_id"
            label={t('owner')}
            useOptions={useEmployeeOptions}
            isRequired
          />

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={assign.isPending}>
              {tCommon('cancel')}
            </Button>
            <Button type="submit" disabled={assign.isPending}>
              {assign.isPending && <Loader2 className="animate-spin" aria-hidden />}
              {t('confirm')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
