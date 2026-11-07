'use client';

import { isApiError } from '@crm/api-client';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Skeleton,
} from '@crm/ui';
import { Loader2, Plus, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { PERMISSIONS } from '@/config/permissions';
import { LeadLink, useLeadOptions } from '@/features/sales/leads';
import { FormattedDate } from '@/shared/components/display/formatted-date';
import { ErrorState } from '@/shared/components/feedback/error-state';
import { AsyncSelectField } from '@/shared/components/form/async-select-field';
import { FormAlert } from '@/shared/components/form/form-alert';
import { mapLaravelErrorsToForm } from '@/shared/components/form/map-laravel-errors';
import { TextField } from '@/shared/components/form/text-field';
import { useZodForm } from '@/shared/components/form/use-zod-form';
import { useCan } from '@/shared/hooks/use-can';

import {
  useAddUnitInterest,
  useRemoveUnitInterest,
  useUnitInterests,
} from '../hooks/use-unit-extras';
import { interestFormSchema, type InterestFormValues } from '../schemas';
import type { Unit } from '../types';

const EMPTY: InterestFormValues = { lead_id: '', note: '' };

/** Leads who asked about this unit: a shortlist for the sales team before anyone reserves it. */
export function UnitInterestsDialog({ unit, onClose }: { unit: Unit; onClose: () => void }) {
  const t = useTranslations('units.interests');
  const canEdit = useCan(PERMISSIONS.unitsReserve);
  const query = useUnitInterests(unit.id);
  const remove = useRemoveUnitInterest(unit.id);
  const interests = query.data ?? [];

  return (
    <Dialog open onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-h-dvh overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('title', { unit: unit.unit_number })}</DialogTitle>
          <DialogDescription>{t('description')}</DialogDescription>
        </DialogHeader>

        {query.error ? (
          <ErrorState error={query.error} onRetry={() => void query.refetch()} />
        ) : query.isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : interests.length === 0 ? (
          <p className="text-small text-muted-foreground">{t('empty')}</p>
        ) : (
          <ul className="divide-y rounded-md border">
            {interests.map((interest) => (
              <li key={interest.id} className="flex items-start gap-3 px-3 py-2.5">
                <div className="min-w-0 flex-1">
                  <LeadLink id={interest.lead_id} />
                  {interest.note && (
                    <p className="text-small text-muted-foreground break-words">{interest.note}</p>
                  )}
                  <p className="text-caption text-text-faint">
                    {interest.created_by?.name && `${interest.created_by.name} · `}
                    <FormattedDate value={interest.created_at} pattern="PP" />
                  </p>
                </div>
                {canEdit && (
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    disabled={remove.isPending}
                    aria-label={`${t('remove')} #${interest.lead_id}`}
                    onClick={() => remove.mutate(interest.lead_id)}
                  >
                    <X aria-hidden />
                  </Button>
                )}
              </li>
            ))}
          </ul>
        )}

        {canEdit && <AddInterestForm unitId={unit.id} />}
      </DialogContent>
    </Dialog>
  );
}

function AddInterestForm({ unitId }: { unitId: number }) {
  const t = useTranslations('units.interests');
  const [alertMessages, setAlertMessages] = useState<string[]>([]);
  const add = useAddUnitInterest(unitId);
  const { control, handleSubmit, setError, reset } = useZodForm(interestFormSchema, EMPTY);

  const submit = (values: InterestFormValues) => {
    setAlertMessages([]);
    add.mutate(values, {
      onSuccess: () => reset(EMPTY),
      onError: (error) => {
        if (!isApiError(error)) return;
        setAlertMessages(mapLaravelErrorsToForm(error, setError, Object.keys(EMPTY)).unmapped);
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(submit)} noValidate className="space-y-3 border-t pt-4">
      <h3 className="text-small font-semibold">{t('addTitle')}</h3>
      <FormAlert messages={alertMessages} />
      <AsyncSelectField
        control={control}
        name="lead_id"
        label={t('fields.lead')}
        useOptions={useLeadOptions}
        isRequired
      />
      <TextField control={control} name="note" label={t('fields.note')} />
      <div className="flex justify-end">
        <Button type="submit" disabled={add.isPending}>
          {add.isPending ? <Loader2 className="animate-spin" aria-hidden /> : <Plus aria-hidden />}
          {t('add')}
        </Button>
      </div>
    </form>
  );
}
