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
import { useTeamLookup } from '@/features/organization/teams';
import { AsyncSelectField } from '@/shared/components/form/async-select-field';
import { FormAlert } from '@/shared/components/form/form-alert';
import { mapLaravelErrorsToForm } from '@/shared/components/form/map-laravel-errors';
import { NumberField } from '@/shared/components/form/number-field';
import { SelectField } from '@/shared/components/form/select-field';
import { TextField } from '@/shared/components/form/text-field';
import { TextareaField } from '@/shared/components/form/textarea-field';
import { useZodForm } from '@/shared/components/form/use-zod-form';

import { useSaveLead } from '../hooks/use-lead-mutations';
import { useLeadSources } from '../hooks/use-lead-queries';
import { leadFormSchema, type LeadFormValues } from '../schemas';
import type { Lead } from '../types';
import { EMPTY_LEAD_FORM, toLeadFormValues } from '../utils/mappers';

const LEAD_FIELDS = Object.keys(EMPTY_LEAD_FORM);

interface LeadFormDialogProps {
  /** The lead being edited, or null to create a new one. */
  lead: Lead | null;
  onClose: () => void;
}

/** Mount it only while open (key it by lead): a fresh mount is a fresh form, no reset effects. */
export function LeadFormDialog({ lead, onClose }: LeadFormDialogProps) {
  const t = useTranslations('leads');
  const tCommon = useTranslations('common');
  const [alertMessages, setAlertMessages] = useState<string[]>([]);
  const save = useSaveLead();
  const sources = useLeadSources();
  const teams = useTeamLookup();

  const { control, handleSubmit, setError } = useZodForm(
    leadFormSchema,
    lead ? toLeadFormValues(lead) : EMPTY_LEAD_FORM,
  );

  const submit = (values: LeadFormValues) => {
    setAlertMessages([]);
    save.mutate(
      { id: lead?.id, values },
      {
        onSuccess: onClose,
        onError: (error) => {
          if (!isApiError(error)) return;
          setAlertMessages(mapLaravelErrorsToForm(error, setError, LEAD_FIELDS).unmapped);
        },
      },
    );
  };

  return (
    <Dialog open onOpenChange={(isOpen) => !isOpen && !save.isPending && onClose()}>
      <DialogContent className="max-h-dvh overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{lead ? t('form.editTitle') : t('form.createTitle')}</DialogTitle>
          <DialogDescription>{t('form.description')}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit)} noValidate className="space-y-4">
          <FormAlert messages={alertMessages} />
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField control={control} name="name" label={t('fields.name')} isRequired />
            <TextField control={control} name="phone" label={t('fields.phone')} type="tel" isLtr />
            <TextField
              control={control}
              name="email"
              label={t('fields.email')}
              type="email"
              isLtr
            />
            <NumberField control={control} name="budget" label={t('fields.budget')} />
            <SelectField
              control={control}
              name="source_id"
              label={t('fields.source')}
              options={(sources.data ?? []).map((source) => ({
                value: String(source.id),
                label: source.name,
              }))}
              noneLabel={t('fields.none')}
            />
            <SelectField
              control={control}
              name="team_id"
              label={t('fields.team')}
              options={teams.options}
              noneLabel={t('fields.none')}
            />
            <AsyncSelectField
              control={control}
              name="owner_id"
              label={t('fields.owner')}
              useOptions={useEmployeeOptions}
              initialOption={
                lead?.owner ? { value: String(lead.owner.id), label: lead.owner.name } : null
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
