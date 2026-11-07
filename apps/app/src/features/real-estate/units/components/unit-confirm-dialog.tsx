'use client';

import { isApiError } from '@crm/api-client';
import { useTranslations } from 'next-intl';

import { ConfirmDialog } from '@/shared/components/feedback/confirm-dialog';

import { useDeleteUnit, useUnitTransition } from '../hooks/use-unit-mutations';
import type { Unit } from '../types';

export type UnitConfirmKind = 'delete' | 'release' | 'sell';

interface UnitConfirmDialogProps {
  unit: Unit;
  kind: UnitConfirmKind;
  onClose: () => void;
}

/** Delete, release and sell share one confirm shape; the API's refusal (422) stays in the dialog. */
export function UnitConfirmDialog({ unit, kind, onClose }: UnitConfirmDialogProps) {
  const t = useTranslations(`units.${kind}`);
  const remove = useDeleteUnit();
  const release = useUnitTransition('release');
  const sell = useUnitTransition('sell');
  const mutation = kind === 'delete' ? remove : kind === 'release' ? release : sell;

  const refusal =
    isApiError(mutation.error) && mutation.error.status === 422
      ? (Object.values(mutation.error.fieldErrors)[0]?.[0] ?? mutation.error.message)
      : null;

  return (
    <ConfirmDialog
      open
      onOpenChange={(isOpen) => !isOpen && !mutation.isPending && onClose()}
      tone={kind === 'delete' ? 'destructive' : 'default'}
      title={t('title', { name: unit.unit_number })}
      description={t('description')}
      confirmLabel={t('confirm')}
      isPending={mutation.isPending}
      errorMessage={refusal}
      onConfirm={() => mutation.mutate(unit.id, { onSuccess: onClose })}
    />
  );
}
