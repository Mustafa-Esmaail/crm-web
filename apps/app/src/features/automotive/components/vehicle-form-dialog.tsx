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

import { FormAlert } from '@/shared/components/form/form-alert';
import { mapLaravelErrorsToForm } from '@/shared/components/form/map-laravel-errors';
import { NumberField } from '@/shared/components/form/number-field';
import { SelectField } from '@/shared/components/form/select-field';
import { TextField } from '@/shared/components/form/text-field';
import { useZodForm } from '@/shared/components/form/use-zod-form';

import { useSaveVehicle } from '../hooks/use-automotive-mutations';
import { MAX_MODEL_YEAR, vehicleFormSchema, type VehicleFormValues } from '../schemas';
import { type Vehicle, VEHICLE_STATUSES } from '../types';
import { EMPTY_VEHICLE_FORM, toVehicleFormValues } from '../utils/mappers';

const FIELDS = Object.keys(EMPTY_VEHICLE_FORM);

/** Mount only while open; `vehicle` null adds one to the stock. */
export function VehicleFormDialog({
  vehicle,
  onClose,
}: {
  vehicle: Vehicle | null;
  onClose: () => void;
}) {
  const t = useTranslations('automotive.vehicles');
  const tCommon = useTranslations('common');
  const [alertMessages, setAlertMessages] = useState<string[]>([]);
  const save = useSaveVehicle();

  const { control, handleSubmit, setError } = useZodForm(
    vehicleFormSchema,
    vehicle ? toVehicleFormValues(vehicle) : EMPTY_VEHICLE_FORM,
  );

  const submit = (values: VehicleFormValues) => {
    setAlertMessages([]);
    save.mutate(
      { id: vehicle?.id, values },
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
          <DialogTitle>{vehicle ? t('form.editTitle') : t('form.createTitle')}</DialogTitle>
          <DialogDescription>{t('form.description')}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit)} noValidate className="space-y-4">
          <FormAlert messages={alertMessages} />
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField control={control} name="make" label={t('fields.make')} isRequired />
            <TextField control={control} name="model" label={t('fields.model')} isRequired />
            <NumberField
              control={control}
              name="year"
              label={t('fields.year')}
              min={1980}
              max={MAX_MODEL_YEAR}
              isRequired
            />
            <TextField control={control} name="color" label={t('fields.color')} />
            <TextField control={control} name="vin" label={t('fields.vin')} isLtr />
            <NumberField control={control} name="price" label={t('fields.price')} min={0} />
          </div>
          <SelectField
            control={control}
            name="status"
            label={t('fields.status')}
            options={VEHICLE_STATUSES.map((value) => ({ value, label: t(`statuses.${value}`) }))}
          />

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
