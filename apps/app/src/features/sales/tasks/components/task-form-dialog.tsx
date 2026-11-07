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
import { DateField } from '@/shared/components/form/date-field';
import { FormAlert } from '@/shared/components/form/form-alert';
import { mapLaravelErrorsToForm } from '@/shared/components/form/map-laravel-errors';
import { SelectField } from '@/shared/components/form/select-field';
import { TextField } from '@/shared/components/form/text-field';
import { TextareaField } from '@/shared/components/form/textarea-field';
import { useZodForm } from '@/shared/components/form/use-zod-form';

import { TASK_PRIORITIES } from '../constants';
import { useSaveTask } from '../hooks/use-task-mutations';
import { taskFormSchema, type TaskFormValues } from '../schemas';
import type { Task } from '../types';
import { EMPTY_TASK_FORM, type TaskRelation, toTaskFormValues } from '../utils/mappers';

const TASK_FIELDS = Object.keys(EMPTY_TASK_FORM);

interface TaskFormDialogProps {
  /** The task being edited, or null to create one. Mount only while open. */
  task: Task | null;
  /** Links a new task to a lead or deal. */
  related?: TaskRelation;
  onClose: () => void;
}

export function TaskFormDialog({ task, related, onClose }: TaskFormDialogProps) {
  const t = useTranslations('tasks');
  const tCommon = useTranslations('common');
  const [alertMessages, setAlertMessages] = useState<string[]>([]);
  const save = useSaveTask();

  const { control, handleSubmit, setError } = useZodForm(
    taskFormSchema,
    task ? toTaskFormValues(task) : EMPTY_TASK_FORM,
  );

  const submit = (values: TaskFormValues) => {
    setAlertMessages([]);
    save.mutate(
      { id: task?.id, values, related },
      {
        onSuccess: onClose,
        onError: (error) => {
          if (!isApiError(error)) return;
          setAlertMessages(mapLaravelErrorsToForm(error, setError, TASK_FIELDS).unmapped);
        },
      },
    );
  };

  return (
    <Dialog open onOpenChange={(isOpen) => !isOpen && !save.isPending && onClose()}>
      <DialogContent className="max-h-dvh overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{task ? t('form.editTitle') : t('form.createTitle')}</DialogTitle>
          <DialogDescription>{t('form.description')}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit)} noValidate className="space-y-4">
          <FormAlert messages={alertMessages} />
          <TextField control={control} name="title" label={t('fields.title')} isRequired />
          <div className="grid gap-4 sm:grid-cols-2">
            <SelectField
              control={control}
              name="priority"
              label={t('fields.priority')}
              options={TASK_PRIORITIES.map((value) => ({
                value,
                label: t(`filters.priorities.${value}`),
              }))}
            />
            <DateField control={control} name="due_at" label={t('fields.due')} />
          </div>
          {/* The owner is chosen on create only; afterwards the "Assign" action changes it. */}
          {!task && (
            <AsyncSelectField
              control={control}
              name="owner_id"
              label={t('fields.owner')}
              useOptions={useEmployeeOptions}
            />
          )}
          <TextareaField control={control} name="description" label={t('fields.description')} />

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={save.isPending}>
              {tCommon('cancel')}
            </Button>
            <Button type="submit" disabled={save.isPending}>
              {save.isPending && <Loader2 className="animate-spin" aria-hidden />}
              {tCommon('save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
