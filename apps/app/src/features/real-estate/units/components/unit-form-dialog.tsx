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

import { useProjectOptions } from '@/features/real-estate/projects';
import { AsyncSelectField } from '@/shared/components/form/async-select-field';
import { FormAlert } from '@/shared/components/form/form-alert';
import { mapLaravelErrorsToForm } from '@/shared/components/form/map-laravel-errors';
import { NumberField } from '@/shared/components/form/number-field';
import { SelectField } from '@/shared/components/form/select-field';
import { TextField } from '@/shared/components/form/text-field';
import { TextareaField } from '@/shared/components/form/textarea-field';
import { useZodForm } from '@/shared/components/form/use-zod-form';

import { useSaveUnit } from '../hooks/use-unit-mutations';
import { unitFormSchema, type UnitFormValues } from '../schemas';
import { type Unit, UNIT_TYPES } from '../types';
import { EMPTY_UNIT_FORM, toUnitFormValues } from '../utils/mappers';

const UNIT_FIELDS = Object.keys(EMPTY_UNIT_FORM);

interface UnitFormDialogProps {
  /** The unit being edited, or null to create one. Mount only while open. */
  unit: Unit | null;
  onClose: () => void;
}

export function UnitFormDialog({ unit, onClose }: UnitFormDialogProps) {
  const t = useTranslations('units');
  const tCommon = useTranslations('common');
  const [alertMessages, setAlertMessages] = useState<string[]>([]);
  const save = useSaveUnit();

  const { control, handleSubmit, setError } = useZodForm(
    unitFormSchema,
    unit ? toUnitFormValues(unit) : EMPTY_UNIT_FORM,
  );

  const submit = (values: UnitFormValues) => {
    setAlertMessages([]);
    save.mutate(
      { id: unit?.id, values },
      {
        onSuccess: onClose,
        onError: (error) => {
          if (!isApiError(error)) return;
          setAlertMessages(mapLaravelErrorsToForm(error, setError, UNIT_FIELDS).unmapped);
        },
      },
    );
  };

  return (
    <Dialog open onOpenChange={(isOpen) => !isOpen && !save.isPending && onClose()}>
      <DialogContent className="max-h-dvh overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{unit ? t('form.editTitle') : t('form.createTitle')}</DialogTitle>
          <DialogDescription>{t('form.description')}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit)} noValidate className="space-y-4">
          <FormAlert messages={alertMessages} />
          <div className="grid gap-4 sm:grid-cols-2">
            <AsyncSelectField
              control={control}
              name="project_id"
              label={t('fields.project')}
              isRequired
              useOptions={useProjectOptions}
              initialOption={
                unit ? { value: String(unit.project.id), label: unit.project.name } : null
              }
            />
            <TextField
              control={control}
              name="unit_number"
              label={t('fields.unitNumber')}
              isRequired
            />
            <SelectField
              control={control}
              name="type"
              label={t('fields.type')}
              options={UNIT_TYPES.map((value) => ({ value, label: t(`types.${value}`) }))}
            />
            <NumberField control={control} name="area_sqm" label={t('fields.area')} isRequired />
            <NumberField control={control} name="floor" label={t('fields.floor')} />
            <NumberField control={control} name="price" label={t('fields.price')} />
            <NumberField control={control} name="bedrooms" label={t('fields.bedrooms')} />
            <NumberField control={control} name="bathrooms" label={t('fields.bathrooms')} />
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
