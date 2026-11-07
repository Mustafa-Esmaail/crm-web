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
import { nowDateTimeInput } from '@/lib/utils/dates';
import { AsyncSelectField } from '@/shared/components/form/async-select-field';
import { DateTimeField } from '@/shared/components/form/date-time-field';
import { FormAlert } from '@/shared/components/form/form-alert';
import { mapLaravelErrorsToForm } from '@/shared/components/form/map-laravel-errors';
import { SelectField } from '@/shared/components/form/select-field';
import { TextareaField } from '@/shared/components/form/textarea-field';
import { useZodForm } from '@/shared/components/form/use-zod-form';

import { useSaveTestDrive } from '../hooks/use-automotive-mutations';
import { useVehicleOptions } from '../hooks/use-automotive-queries';
import { testDriveCreateSchema, testDriveFormSchema, type TestDriveFormValues } from '../schemas';
import { TEST_DRIVE_STATUSES, type TestDrive } from '../types';
import { EMPTY_TEST_DRIVE_FORM, toTestDriveFormValues } from '../utils/mappers';

const FIELDS = Object.keys(EMPTY_TEST_DRIVE_FORM);

/** Booking picks the vehicle and customer (a lead); editing moves the time or changes the status. */
export function TestDriveFormDialog({
  testDrive,
  onClose,
}: {
  testDrive: TestDrive | null;
  onClose: () => void;
}) {
  const t = useTranslations('automotive.testDrives');
  const tCommon = useTranslations('common');
  const [alertMessages, setAlertMessages] = useState<string[]>([]);
  const save = useSaveTestDrive();
  const isEdit = testDrive !== null;

  const { control, handleSubmit, setError } = useZodForm(
    isEdit ? testDriveFormSchema : testDriveCreateSchema,
    isEdit ? toTestDriveFormValues(testDrive) : EMPTY_TEST_DRIVE_FORM,
  );

  const submit = (values: TestDriveFormValues) => {
    setAlertMessages([]);
    save.mutate(
      { original: testDrive ?? undefined, values },
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
                name="vehicle_id"
                label={t('fields.vehicle')}
                useOptions={useVehicleOptions}
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
              options={TEST_DRIVE_STATUSES.map((value) => ({
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
