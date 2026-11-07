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
import { SwitchField } from '@/shared/components/form/switch-field';
import { TextField } from '@/shared/components/form/text-field';
import { useZodForm } from '@/shared/components/form/use-zod-form';

import { useSaveService } from '../hooks/use-clinic-mutations';
import { serviceFormSchema, type ServiceFormValues } from '../schemas';
import type { Service } from '../types';
import { EMPTY_SERVICE_FORM, toServiceFormValues } from '../utils/mappers';

const FIELDS = Object.keys(EMPTY_SERVICE_FORM);

/** Mount only while open; `service` null creates one. */
export function ServiceFormDialog({
  service,
  onClose,
}: {
  service: Service | null;
  onClose: () => void;
}) {
  const t = useTranslations('clinic.services');
  const tCommon = useTranslations('common');
  const [alertMessages, setAlertMessages] = useState<string[]>([]);
  const save = useSaveService();

  const { control, handleSubmit, setError } = useZodForm(
    serviceFormSchema,
    service ? toServiceFormValues(service) : EMPTY_SERVICE_FORM,
  );

  const submit = (values: ServiceFormValues) => {
    setAlertMessages([]);
    save.mutate(
      { id: service?.id, values },
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
          <DialogTitle>{service ? t('form.editTitle') : t('form.createTitle')}</DialogTitle>
          <DialogDescription>{t('form.description')}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit)} noValidate className="space-y-4">
          <FormAlert messages={alertMessages} />
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField control={control} name="name_ar" label={t('fields.nameAr')} isRequired />
            <TextField control={control} name="name_en" label={t('fields.nameEn')} />
            <TextField control={control} name="code" label={t('fields.code')} isLtr />
            <NumberField
              control={control}
              name="duration_minutes"
              label={t('fields.duration')}
              min={5}
              max={480}
              step={5}
              isRequired
            />
            <NumberField control={control} name="price" label={t('fields.price')} min={0} />
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
