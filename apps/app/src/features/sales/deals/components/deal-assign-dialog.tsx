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

import { useAssignDeal } from '../hooks/use-deal-mutations';
import { dealAssignSchema, type DealAssignValues } from '../schemas';
import type { Deal } from '../types';

interface DealAssignDialogProps {
  deal: Deal;
  onClose: () => void;
}

export function DealAssignDialog({ deal, onClose }: DealAssignDialogProps) {
  const t = useTranslations('deals.assign');
  const tCommon = useTranslations('common');
  const [alertMessages, setAlertMessages] = useState<string[]>([]);
  const assign = useAssignDeal();

  const { control, handleSubmit, setError } = useZodForm(dealAssignSchema, { owner_id: '' });

  const submit = (values: DealAssignValues) => {
    setAlertMessages([]);
    assign.mutate(
      { id: deal.id, ownerId: Number(values.owner_id) },
      {
        onSuccess: onClose,
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
          <DialogTitle>{t('title', { name: deal.title })}</DialogTitle>
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
