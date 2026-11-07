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
import { NumberField } from '@/shared/components/form/number-field';
import { SwitchField } from '@/shared/components/form/switch-field';
import { TextField } from '@/shared/components/form/text-field';
import { useZodForm } from '@/shared/components/form/use-zod-form';

import { useSaveCourse } from '../hooks/use-education-mutations';
import { courseFormSchema, type CourseFormValues } from '../schemas';
import type { Course } from '../types';
import { EMPTY_COURSE_FORM, toCourseFormValues } from '../utils/mappers';

const FIELDS = Object.keys(EMPTY_COURSE_FORM);

/** Mount only while open; `course` null creates one. */
export function CourseFormDialog({
  course,
  onClose,
}: {
  course: Course | null;
  onClose: () => void;
}) {
  const t = useTranslations('education.courses');
  const tCommon = useTranslations('common');
  const [alertMessages, setAlertMessages] = useState<string[]>([]);
  const save = useSaveCourse();

  const { control, handleSubmit, setError } = useZodForm(
    courseFormSchema,
    course ? toCourseFormValues(course) : EMPTY_COURSE_FORM,
  );

  const submit = (values: CourseFormValues) => {
    setAlertMessages([]);
    save.mutate(
      { id: course?.id, values },
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
          <DialogTitle>{course ? t('form.editTitle') : t('form.createTitle')}</DialogTitle>
          <DialogDescription>{t('form.description')}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit)} noValidate className="space-y-4">
          <FormAlert messages={alertMessages} />
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField control={control} name="name_ar" label={t('fields.nameAr')} isRequired />
            <TextField control={control} name="name_en" label={t('fields.nameEn')} />
            <TextField control={control} name="code" label={t('fields.code')} isLtr />
            <NumberField control={control} name="fee" label={t('fields.fee')} min={0} />
            <NumberField
              control={control}
              name="capacity"
              label={t('fields.capacity')}
              description={t('fields.capacityHint')}
              min={1}
            />
            <div className="hidden sm:block" aria-hidden />
            <DateField control={control} name="starts_on" label={t('fields.startsOn')} />
            <DateField control={control} name="ends_on" label={t('fields.endsOn')} />
          </div>
          <SwitchField control={control} name="is_active" label={t('fields.isActive')} />

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
