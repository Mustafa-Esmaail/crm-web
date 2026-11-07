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
import { TextareaField } from '@/shared/components/form/textarea-field';
import { useZodForm } from '@/shared/components/form/use-zod-form';

import { useSavePackage } from '../hooks/use-agency-mutations';
import { packageFormSchema, type PackageFormValues } from '../schemas';
import type { AgencyPackage } from '../types';
import { EMPTY_PACKAGE_FORM, toPackageFormValues } from '../utils/mappers';

const FIELDS = Object.keys(EMPTY_PACKAGE_FORM);

/** Mount only while open; `pkg` null creates one. */
export function PackageFormDialog({
  pkg,
  onClose,
}: {
  pkg: AgencyPackage | null;
  onClose: () => void;
}) {
  const t = useTranslations('agency.packages');
  const tCommon = useTranslations('common');
  const [alertMessages, setAlertMessages] = useState<string[]>([]);
  const save = useSavePackage();

  const { control, handleSubmit, setError } = useZodForm(
    packageFormSchema,
    pkg ? toPackageFormValues(pkg) : EMPTY_PACKAGE_FORM,
  );

  const submit = (values: PackageFormValues) => {
    setAlertMessages([]);
    save.mutate(
      { id: pkg?.id, values },
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
          <DialogTitle>{pkg ? t('form.editTitle') : t('form.createTitle')}</DialogTitle>
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
              name="monthly_fee"
              label={t('fields.monthlyFee')}
              min={0}
            />
          </div>
          <TextareaField
            control={control}
            name="deliverables"
            label={t('fields.deliverables')}
            rows={4}
          />
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
