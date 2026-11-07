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

import { DateField } from '@/shared/components/form/date-field';
import { FormAlert } from '@/shared/components/form/form-alert';
import { mapLaravelErrorsToForm } from '@/shared/components/form/map-laravel-errors';
import { SelectField } from '@/shared/components/form/select-field';
import { TextField } from '@/shared/components/form/text-field';
import { TextareaField } from '@/shared/components/form/textarea-field';
import { useZodForm } from '@/shared/components/form/use-zod-form';

import { useSaveProject } from '../hooks/use-project-mutations';
import { projectFormSchema, type ProjectFormValues } from '../schemas';
import { type Project, PROJECT_STATUSES } from '../types';
import { EMPTY_PROJECT_FORM, toProjectFormValues } from '../utils/mappers';

const PROJECT_FIELDS = Object.keys(EMPTY_PROJECT_FORM);

interface ProjectFormDialogProps {
  /** The project being edited, or null to create one. Mount only while open. */
  project: Project | null;
  onClose: () => void;
}

export function ProjectFormDialog({ project, onClose }: ProjectFormDialogProps) {
  const t = useTranslations('projects');
  const tCommon = useTranslations('common');
  const [alertMessages, setAlertMessages] = useState<string[]>([]);
  const save = useSaveProject();

  const { control, handleSubmit, setError } = useZodForm(
    projectFormSchema,
    project ? toProjectFormValues(project) : EMPTY_PROJECT_FORM,
  );

  const submit = (values: ProjectFormValues) => {
    setAlertMessages([]);
    save.mutate(
      { id: project?.id, values },
      {
        onSuccess: onClose,
        onError: (error) => {
          if (!isApiError(error)) return;
          setAlertMessages(mapLaravelErrorsToForm(error, setError, PROJECT_FIELDS).unmapped);
        },
      },
    );
  };

  return (
    <Dialog open onOpenChange={(isOpen) => !isOpen && !save.isPending && onClose()}>
      <DialogContent className="max-h-dvh overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{project ? t('form.editTitle') : t('form.createTitle')}</DialogTitle>
          <DialogDescription>{t('form.description')}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit)} noValidate className="space-y-4">
          <FormAlert messages={alertMessages} />
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField control={control} name="name_ar" label={t('fields.nameAr')} isRequired />
            <TextField control={control} name="name_en" label={t('fields.nameEn')} />
            <TextField control={control} name="code" label={t('fields.code')} />
            <SelectField
              control={control}
              name="status"
              label={t('fields.status')}
              options={PROJECT_STATUSES.map((value) => ({
                value,
                label: t(`statuses.${value}`),
              }))}
            />
            <TextField control={control} name="city" label={t('fields.city')} />
            <TextField control={control} name="district" label={t('fields.district')} />
            <div className="sm:col-span-2">
              <TextField control={control} name="address" label={t('fields.address')} />
            </div>
            <DateField control={control} name="delivery_date" label={t('fields.delivery')} />
          </div>
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
