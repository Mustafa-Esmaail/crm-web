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
import { TextField } from '@/shared/components/form/text-field';
import { useZodForm } from '@/shared/components/form/use-zod-form';

import { useSaveBuilding } from '../hooks/use-buildings';
import { buildingFormSchema, type BuildingFormValues } from '../schemas';
import type { Building } from '../types';
import { EMPTY_BUILDING_FORM, toBuildingFormValues } from '../utils/mappers';

const BUILDING_FIELDS = Object.keys(EMPTY_BUILDING_FORM);

interface BuildingFormDialogProps {
  building: Building | null;
  onClose: () => void;
}

export function BuildingFormDialog({ building, onClose }: BuildingFormDialogProps) {
  const t = useTranslations('buildings');
  const tCommon = useTranslations('common');
  const [alertMessages, setAlertMessages] = useState<string[]>([]);
  const save = useSaveBuilding();

  const { control, handleSubmit, setError } = useZodForm(
    buildingFormSchema,
    building ? toBuildingFormValues(building) : EMPTY_BUILDING_FORM,
  );

  const submit = (values: BuildingFormValues) => {
    setAlertMessages([]);
    save.mutate(
      { id: building?.id, values },
      {
        onSuccess: onClose,
        onError: (error) => {
          if (!isApiError(error)) return;
          setAlertMessages(mapLaravelErrorsToForm(error, setError, BUILDING_FIELDS).unmapped);
        },
      },
    );
  };

  return (
    <Dialog open onOpenChange={(isOpen) => !isOpen && !save.isPending && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{building ? t('form.editTitle') : t('form.createTitle')}</DialogTitle>
          <DialogDescription>{t('form.description')}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit)} noValidate className="space-y-4">
          <FormAlert messages={alertMessages} />
          <AsyncSelectField
            control={control}
            name="project_id"
            label={t('fields.project')}
            isRequired
            useOptions={useProjectOptions}
            initialOption={
              building ? { value: String(building.project.id), label: building.project.name } : null
            }
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField control={control} name="name_ar" label={t('fields.nameAr')} isRequired />
            <TextField control={control} name="name_en" label={t('fields.nameEn')} />
            <TextField control={control} name="code" label={t('fields.code')} isLtr />
            <NumberField control={control} name="floors_count" label={t('fields.floors')} />
          </div>

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
