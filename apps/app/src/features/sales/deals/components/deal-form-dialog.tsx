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
import { useLeadName, useLeadOptions } from '@/features/sales/leads';
import { AsyncSelectField } from '@/shared/components/form/async-select-field';
import { DateField } from '@/shared/components/form/date-field';
import { FormAlert } from '@/shared/components/form/form-alert';
import { mapLaravelErrorsToForm } from '@/shared/components/form/map-laravel-errors';
import { NumberField } from '@/shared/components/form/number-field';
import { TextField } from '@/shared/components/form/text-field';
import { TextareaField } from '@/shared/components/form/textarea-field';
import { useZodForm } from '@/shared/components/form/use-zod-form';

import { useSaveDeal } from '../hooks/use-deal-mutations';
import { dealFormSchema, type DealFormValues } from '../schemas';
import type { Deal } from '../types';
import { EMPTY_DEAL_FORM, toDealFormValues } from '../utils/mappers';

const DEAL_FIELDS = Object.keys(EMPTY_DEAL_FORM);

interface DealFormDialogProps {
  /** The deal being edited, or null to create a new one. */
  deal: Deal | null;
  onClose: () => void;
}

/** Mount it only while open (key it by deal): a fresh mount is a fresh form, no reset effects. */
export function DealFormDialog({ deal, onClose }: DealFormDialogProps) {
  const t = useTranslations('deals');
  const tCommon = useTranslations('common');
  const [alertMessages, setAlertMessages] = useState<string[]>([]);
  const save = useSaveDeal();
  const leadName = useLeadName(deal?.lead_id);

  const { control, handleSubmit, setError } = useZodForm(
    dealFormSchema,
    deal ? toDealFormValues(deal) : EMPTY_DEAL_FORM,
  );

  const submit = (values: DealFormValues) => {
    setAlertMessages([]);
    save.mutate(
      { id: deal?.id, values },
      {
        onSuccess: onClose,
        onError: (error) => {
          if (!isApiError(error)) return;
          setAlertMessages(mapLaravelErrorsToForm(error, setError, DEAL_FIELDS).unmapped);
        },
      },
    );
  };

  return (
    <Dialog open onOpenChange={(isOpen) => !isOpen && !save.isPending && onClose()}>
      <DialogContent className="max-h-dvh overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{deal ? t('form.editTitle') : t('form.createTitle')}</DialogTitle>
          <DialogDescription>{t('form.description')}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit)} noValidate className="space-y-4">
          <FormAlert messages={alertMessages} />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <TextField control={control} name="title" label={t('fields.title')} isRequired />
            </div>
            <NumberField control={control} name="value" label={t('fields.value')} />
            <DateField
              control={control}
              name="expected_close_date"
              label={t('fields.expectedClose')}
            />
            <AsyncSelectField
              control={control}
              name="lead_id"
              label={t('fields.lead')}
              useOptions={useLeadOptions}
              initialOption={
                deal?.lead_id && leadName ? { value: String(deal.lead_id), label: leadName } : null
              }
            />
            <AsyncSelectField
              control={control}
              name="owner_id"
              label={t('fields.owner')}
              useOptions={useEmployeeOptions}
              initialOption={
                deal?.owner ? { value: String(deal.owner.id), label: deal.owner.name } : null
              }
            />
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
