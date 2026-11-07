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
import { AsyncSelectField } from '@/shared/components/form/async-select-field';
import { FormAlert } from '@/shared/components/form/form-alert';
import { mapLaravelErrorsToForm } from '@/shared/components/form/map-laravel-errors';
import { useZodForm } from '@/shared/components/form/use-zod-form';

import { useAssignLeads } from '../hooks/use-lead-mutations';
import { assignSchema, type AssignValues } from '../schemas';

interface AssignLeadsDialogProps {
  /** Who is being handed over: one lead or a whole selection. */
  leadIds: number[];
  /** Name shown in the title when exactly one lead is being assigned. */
  leadName?: string;
  onClose: () => void;
  /** Runs after a successful assignment, e.g. to clear the table selection. */
  onAssigned?: () => void;
}

export function AssignLeadsDialog({
  leadIds,
  leadName,
  onClose,
  onAssigned,
}: AssignLeadsDialogProps) {
  const t = useTranslations('leads.assign');
  const tCommon = useTranslations('common');
  const [alertMessages, setAlertMessages] = useState<string[]>([]);
  const assign = useAssignLeads();

  const { control, handleSubmit, setError } = useZodForm(assignSchema, { owner_id: '' });

  const submit = (values: AssignValues) => {
    setAlertMessages([]);
    assign.mutate(
      { leadIds, ownerId: Number(values.owner_id) },
      {
        onSuccess: () => {
          onClose();
          onAssigned?.();
        },
        onError: (error) => {
          if (!isApiError(error)) return;
          setAlertMessages(mapLaravelErrorsToForm(error, setError, ['owner_id']).unmapped);
        },
      },
    );
  };

  return (
    <Dialog open onOpenChange={(isOpen) => !isOpen && !assign.isPending && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {leadIds.length === 1 && leadName
              ? t('titleOne', { name: leadName })
              : t('titleMany', { count: leadIds.length })}
          </DialogTitle>
          <DialogDescription>{t('description')}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit)} noValidate className="space-y-4">
          <FormAlert messages={alertMessages} />
          <AsyncSelectField
            control={control}
            name="owner_id"
            label={t('owner')}
            useOptions={useEmployeeOptions}
            isRequired
          />

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={assign.isPending}>
              {tCommon('cancel')}
            </Button>
            <Button type="submit" disabled={assign.isPending}>
              {assign.isPending && <Loader2 className="animate-spin" aria-hidden />}
              {t('confirm')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
