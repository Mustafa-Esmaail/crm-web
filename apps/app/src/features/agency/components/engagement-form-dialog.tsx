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
import { DateField } from '@/shared/components/form/date-field';
import { FormAlert } from '@/shared/components/form/form-alert';
import { mapLaravelErrorsToForm } from '@/shared/components/form/map-laravel-errors';
import { NumberField } from '@/shared/components/form/number-field';
import { SelectField } from '@/shared/components/form/select-field';
import { TextareaField } from '@/shared/components/form/textarea-field';
import { useZodForm } from '@/shared/components/form/use-zod-form';

import { useSaveEngagement } from '../hooks/use-agency-mutations';
import { useActivePackageOptions } from '../hooks/use-agency-queries';
import {
  engagementCreateSchema,
  engagementFormSchema,
  type EngagementFormValues,
} from '../schemas';
import type { Engagement } from '../types';
import {
  allowedEngagementStatuses,
  EMPTY_ENGAGEMENT_FORM,
  toEngagementFormValues,
} from '../utils/mappers';

const FIELDS = Object.keys(EMPTY_ENGAGEMENT_FORM);

/** Signing picks the package and client (a lead); editing changes status, fee, dates or notes. */
export function EngagementFormDialog({
  engagement,
  onClose,
}: {
  engagement: Engagement | null;
  onClose: () => void;
}) {
  const t = useTranslations('agency.engagements');
  const tCommon = useTranslations('common');
  const [alertMessages, setAlertMessages] = useState<string[]>([]);
  const save = useSaveEngagement();
  const isEdit = engagement !== null;

  const { control, handleSubmit, setError } = useZodForm(
    isEdit ? engagementFormSchema : engagementCreateSchema,
    isEdit ? toEngagementFormValues(engagement) : EMPTY_ENGAGEMENT_FORM,
  );

  const submit = (values: EngagementFormValues) => {
    setAlertMessages([]);
    save.mutate(
      { id: engagement?.id, values },
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
                name="package_id"
                label={t('fields.package')}
                useOptions={useActivePackageOptions}
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
          <div className="grid gap-4 sm:grid-cols-2">
            {isEdit && (
              <SelectField
                control={control}
                name="status"
                label={t('fields.status')}
                options={allowedEngagementStatuses(engagement.status).map((value) => ({
                  value,
                  label: t(`statuses.${value}`),
                }))}
              />
            )}
            <NumberField
              control={control}
              name="monthly_fee"
              label={t('fields.monthlyFee')}
              description={isEdit ? undefined : t('fields.monthlyFeeHint')}
              min={0}
            />
            <DateField control={control} name="starts_on" label={t('fields.startsOn')} />
            <DateField control={control} name="ends_on" label={t('fields.endsOn')} />
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
