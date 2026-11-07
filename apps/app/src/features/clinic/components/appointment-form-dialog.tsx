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
import { useLeadOptions } from '@/features/sales/leads';
import { nowDateTimeInput } from '@/lib/utils/dates';
import { AsyncSelectField } from '@/shared/components/form/async-select-field';
import { DateTimeField } from '@/shared/components/form/date-time-field';
import { FormAlert } from '@/shared/components/form/form-alert';
import { mapLaravelErrorsToForm } from '@/shared/components/form/map-laravel-errors';
import { SelectField } from '@/shared/components/form/select-field';
import { TextareaField } from '@/shared/components/form/textarea-field';
import { useZodForm } from '@/shared/components/form/use-zod-form';

import { useSaveAppointment } from '../hooks/use-clinic-mutations';
import { useActiveServiceOptions } from '../hooks/use-clinic-queries';
import {
  appointmentCreateSchema,
  appointmentFormSchema,
  type AppointmentFormValues,
} from '../schemas';
import { type Appointment, APPOINTMENT_STATUSES } from '../types';
import { EMPTY_APPOINTMENT_FORM, toAppointmentFormValues } from '../utils/mappers';

const FIELDS = Object.keys(EMPTY_APPOINTMENT_FORM);

/**
 * Booking picks the service, patient (a lead) and doctor; those stay fixed afterwards, so editing
 * only moves the time, changes the status or updates the notes.
 */
export function AppointmentFormDialog({
  appointment,
  onClose,
}: {
  appointment: Appointment | null;
  onClose: () => void;
}) {
  const t = useTranslations('clinic.appointments');
  const tCommon = useTranslations('common');
  const [alertMessages, setAlertMessages] = useState<string[]>([]);
  const save = useSaveAppointment();
  const isEdit = appointment !== null;

  const { control, handleSubmit, setError } = useZodForm(
    isEdit ? appointmentFormSchema : appointmentCreateSchema,
    isEdit ? toAppointmentFormValues(appointment) : EMPTY_APPOINTMENT_FORM,
  );

  const submit = (values: AppointmentFormValues) => {
    setAlertMessages([]);
    save.mutate(
      { original: appointment ?? undefined, values },
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
                name="service_id"
                label={t('fields.service')}
                useOptions={useActiveServiceOptions}
                isRequired
              />
              <AsyncSelectField
                control={control}
                name="lead_id"
                label={t('fields.lead')}
                useOptions={useLeadOptions}
                isRequired
              />
              <AsyncSelectField
                control={control}
                name="doctor_id"
                label={t('fields.doctor')}
                useOptions={useEmployeeOptions}
                isRequired
              />
            </>
          )}
          <DateTimeField
            control={control}
            name="starts_at"
            label={t('fields.startsAt')}
            description={t('fields.startsAtHint')}
            min={nowDateTimeInput()}
            isRequired
          />
          {isEdit && (
            <SelectField
              control={control}
              name="status"
              label={t('fields.status')}
              options={APPOINTMENT_STATUSES.map((value) => ({
                value,
                label: t(`statuses.${value}`),
              }))}
            />
          )}
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
