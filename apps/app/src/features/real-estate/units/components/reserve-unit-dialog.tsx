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
import { FormAlert } from '@/shared/components/form/form-alert';
import { mapLaravelErrorsToForm } from '@/shared/components/form/map-laravel-errors';
import { NumberField } from '@/shared/components/form/number-field';
import { useZodForm } from '@/shared/components/form/use-zod-form';

import { useReserveUnit } from '../hooks/use-unit-mutations';
import { reserveFormSchema, type ReserveFormValues } from '../schemas';
import type { Unit } from '../types';
import { EMPTY_RESERVE_FORM } from '../utils/mappers';

const RESERVE_FIELDS = Object.keys(EMPTY_RESERVE_FORM);

interface ReserveUnitDialogProps {
  unit: Unit;
  onClose: () => void;
}

export function ReserveUnitDialog({ unit, onClose }: ReserveUnitDialogProps) {
  const t = useTranslations('units.reserve');
  const tCommon = useTranslations('common');
  const [alertMessages, setAlertMessages] = useState<string[]>([]);
  const reserve = useReserveUnit();
  const { control, handleSubmit, setError } = useZodForm(reserveFormSchema, EMPTY_RESERVE_FORM);

  const submit = (values: ReserveFormValues) => {
    setAlertMessages([]);
    reserve.mutate(
      { id: unit.id, values },
      {
        onSuccess: onClose,
        onError: (error) => {
          if (!isApiError(error)) return;
          setAlertMessages(mapLaravelErrorsToForm(error, setError, RESERVE_FIELDS).unmapped);
        },
      },
    );
  };

  return (
    <Dialog open onOpenChange={(isOpen) => !isOpen && !reserve.isPending && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('title', { name: unit.unit_number })}</DialogTitle>
          <DialogDescription>{t('description')}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit)} noValidate className="space-y-4">
          <FormAlert messages={alertMessages} />
          <AsyncSelectField
            control={control}
            name="lead_id"
            label={t('lead')}
            isRequired
            useOptions={useLeadOptions}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <NumberField control={control} name="hold_hours" label={t('holdHours')} />
            <NumberField control={control} name="deposit_amount" label={t('deposit')} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={reserve.isPending}>
              {tCommon('cancel')}
            </Button>
            <Button type="submit" disabled={reserve.isPending}>
              {reserve.isPending && <Loader2 className="animate-spin" aria-hidden />}
              {t('confirm')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
