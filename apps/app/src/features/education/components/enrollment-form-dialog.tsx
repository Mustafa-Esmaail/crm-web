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

import { useLeadOptions } from '@/features/sales/leads';
import { AsyncSelectField } from '@/shared/components/form/async-select-field';
import { DateField } from '@/shared/components/form/date-field';
import { FormAlert } from '@/shared/components/form/form-alert';
import { mapLaravelErrorsToForm } from '@/shared/components/form/map-laravel-errors';
import { SelectField } from '@/shared/components/form/select-field';
import { TextareaField } from '@/shared/components/form/textarea-field';
import { useZodForm } from '@/shared/components/form/use-zod-form';

import { useSaveEnrollment } from '../hooks/use-education-mutations';
import { useActiveCourseOptions } from '../hooks/use-education-queries';
import {
  enrollmentCreateSchema,
  enrollmentFormSchema,
  type EnrollmentFormValues,
} from '../schemas';
import { type Enrollment, ENROLLMENT_STATUSES } from '../types';
import { EMPTY_ENROLLMENT_FORM, toEnrollmentFormValues } from '../utils/mappers';

const FIELDS = Object.keys(EMPTY_ENROLLMENT_FORM);

/** Enrolling picks the course and the student (a lead); editing changes the status, date or notes. */
export function EnrollmentFormDialog({
  enrollment,
  onClose,
}: {
  enrollment: Enrollment | null;
  onClose: () => void;
}) {
  const t = useTranslations('education.enrollments');
  const tCommon = useTranslations('common');
  const [alertMessages, setAlertMessages] = useState<string[]>([]);
  const save = useSaveEnrollment();
  const isEdit = enrollment !== null;

  const { control, handleSubmit, setError } = useZodForm(
    isEdit ? enrollmentFormSchema : enrollmentCreateSchema,
    isEdit ? toEnrollmentFormValues(enrollment) : EMPTY_ENROLLMENT_FORM,
  );

  const submit = (values: EnrollmentFormValues) => {
    setAlertMessages([]);
    save.mutate(
      { id: enrollment?.id, values },
      {
        onSuccess: onClose,
        onError: (error) => {
          if (!isApiError(error)) return;
          setAlertMessages(mapLaravelErrorsToForm(error, setError, FIELDS).unmapped);
        },
      },
    );
  };

  return (
    <Dialog open onOpenChange={(isOpen) => !isOpen && !save.isPending && onClose()}>
      <DialogContent className="max-h-dvh overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? t('form.editTitle') : t('form.createTitle')}</DialogTitle>
          <DialogDescription>
            {isEdit ? t('form.editDescription') : t('form.createDescription')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit)} noValidate className="space-y-4">
          <FormAlert messages={alertMessages} />
          {!isEdit && (
            <>
              <AsyncSelectField
                control={control}
                name="course_id"
                label={t('fields.course')}
                useOptions={useActiveCourseOptions}
                isRequired
              />
              <AsyncSelectField
                control={control}
                name="lead_id"
                label={t('fields.lead')}
                useOptions={useLeadOptions}
                isRequired
              />
            </>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <DateField control={control} name="enrolled_on" label={t('fields.enrolledOn')} />
            {isEdit && (
              <SelectField
                control={control}
                name="status"
                label={t('fields.status')}
                options={ENROLLMENT_STATUSES.map((value) => ({
                  value,
                  label: t(`statuses.${value}`),
                }))}
              />
            )}
          </div>
          <TextareaField control={control} name="notes" label={t('fields.notes')} />

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
