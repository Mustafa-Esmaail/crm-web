'use client';

import { isApiError } from '@crm/api-client';
import {
  Button,
  cn,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Skeleton,
} from '@crm/ui';
import { CheckCircle2, Loader2, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { PERMISSIONS } from '@/config/permissions';
import { Amount } from '@/shared/components/display/amount';
import { FormattedDate } from '@/shared/components/display/formatted-date';
import { ErrorState } from '@/shared/components/feedback/error-state';
import { DateField } from '@/shared/components/form/date-field';
import { FormAlert } from '@/shared/components/form/form-alert';
import { mapLaravelErrorsToForm } from '@/shared/components/form/map-laravel-errors';
import { NumberField } from '@/shared/components/form/number-field';
import { useZodForm } from '@/shared/components/form/use-zod-form';
import { useCan } from '@/shared/hooks/use-can';

import type { PaymentPlan } from '../api/payment-plan-requests';
import {
  useDeletePaymentPlan,
  usePayInstallment,
  usePaymentPlan,
  useSavePaymentPlan,
} from '../hooks/use-payment-plan';
import { paymentPlanFormSchema, type PaymentPlanFormValues } from '../schemas';
import type { Unit } from '../types';
import { EMPTY_PAYMENT_PLAN_FORM, toPaymentPlanFormValues } from '../utils/mappers';

const PLAN_FIELDS = Object.keys(EMPTY_PAYMENT_PLAN_FORM);

interface PaymentPlanDialogProps {
  unit: Unit;
  onClose: () => void;
}

/** Shows a unit's plan and installments; creates or replaces it while nothing has been paid. */
export function PaymentPlanDialog({ unit, onClose }: PaymentPlanDialogProps) {
  const t = useTranslations('units.plan');
  const tCommon = useTranslations('common');
  const canManage = useCan(PERMISSIONS.paymentPlansManage);
  const query = usePaymentPlan(unit.id);
  const [editing, setEditing] = useState(false);
  const plan = query.data;
  const showForm = canManage && (plan === null || editing);

  return (
    <Dialog open onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-h-dvh overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t('title', { name: unit.unit_number })}</DialogTitle>
          <DialogDescription>{t('description')}</DialogDescription>
        </DialogHeader>

        {query.error ? (
          <ErrorState error={query.error} onRetry={() => void query.refetch()} />
        ) : query.isLoading ? (
          <Skeleton className="h-40 w-full" />
        ) : showForm ? (
          <PlanForm
            unitId={unit.id}
            plan={plan ?? null}
            onDone={() => setEditing(false)}
            onCancel={plan ? () => setEditing(false) : onClose}
          />
        ) : plan ? (
          <PlanView
            unitId={unit.id}
            plan={plan}
            canManage={canManage}
            onReplace={() => setEditing(true)}
          />
        ) : (
          <p className="text-small text-muted-foreground">{t('none')}</p>
        )}

        {!showForm && (
          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              {tCommon('close')}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

function PlanForm({
  unitId,
  plan,
  onDone,
  onCancel,
}: {
  unitId: number;
  plan: PaymentPlan | null;
  onDone: () => void;
  onCancel: () => void;
}) {
  const t = useTranslations('units.plan');
  const tCommon = useTranslations('common');
  const save = useSavePaymentPlan(unitId);
  const [alertMessages, setAlertMessages] = useState<string[]>([]);
  const { control, handleSubmit, setError } = useZodForm(
    paymentPlanFormSchema,
    plan ? toPaymentPlanFormValues(plan) : EMPTY_PAYMENT_PLAN_FORM,
  );

  const submit = (values: PaymentPlanFormValues) => {
    setAlertMessages([]);
    save.mutate(values, {
      onSuccess: onDone,
      onError: (error) => {
        if (!isApiError(error)) return;
        setAlertMessages(mapLaravelErrorsToForm(error, setError, PLAN_FIELDS).unmapped);
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(submit)} noValidate className="space-y-4">
      <FormAlert messages={alertMessages} />
      <p className="text-small text-muted-foreground">{t('formHint')}</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField
          control={control}
          name="down_payment"
          label={t('fields.downPayment')}
          isRequired
        />
        <NumberField
          control={control}
          name="installments_count"
          label={t('fields.count')}
          isRequired
        />
        <NumberField
          control={control}
          name="interval_months"
          label={t('fields.interval')}
          isRequired
        />
        <DateField
          control={control}
          name="first_due_date"
          label={t('fields.firstDue')}
          isRequired
        />
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel} disabled={save.isPending}>
          {tCommon('cancel')}
        </Button>
        <Button type="submit" disabled={save.isPending}>
          {save.isPending && <Loader2 className="animate-spin" aria-hidden />}
          {tCommon('save')}
        </Button>
      </DialogFooter>
    </form>
  );
}

function PlanView({
  unitId,
  plan,
  canManage,
  onReplace,
}: {
  unitId: number;
  plan: PaymentPlan;
  canManage: boolean;
  onReplace: () => void;
}) {
  const t = useTranslations('units.plan');
  const pay = usePayInstallment(unitId);
  const remove = useDeletePaymentPlan(unitId);
  const paid = plan.paid_installments ?? 0;
  // The API only lets a plan change while nothing has been paid.
  const canReplace = canManage && paid === 0;

  return (
    <div className="space-y-4">
      <dl className="text-small grid grid-cols-2 gap-2 sm:grid-cols-4">
        {(
          [
            ['total', <Amount key="t" value={plan.total_price} />],
            ['downPayment', <Amount key="d" value={plan.down_payment} />],
            ['remaining', <Amount key="r" value={plan.remaining_amount} />],
            ['paid', `${paid} / ${plan.installments_count}`],
          ] as const
        ).map(([key, value]) => (
          <div key={key} className="bg-muted rounded-md px-3 py-2">
            <dt className="text-caption text-muted-foreground">{t(`summary.${key}`)}</dt>
            <dd className="num font-semibold">{value}</dd>
          </div>
        ))}
      </dl>

      <ul className="max-h-80 divide-y overflow-y-auto rounded-md border">
        {(plan.installments ?? []).map((installment) => (
          <li key={installment.number} className="flex items-center gap-3 px-3 py-2">
            <span className="num text-muted-foreground w-8 text-sm">#{installment.number}</span>
            <div className="min-w-0 flex-1">
              <p className="text-small font-medium">
                <Amount value={installment.amount} />
              </p>
              <p
                className={cn(
                  'text-caption text-text-faint',
                  installment.is_overdue && !installment.is_paid && 'text-destructive',
                )}
              >
                <FormattedDate value={installment.due_date} />
                {installment.is_overdue && !installment.is_paid && ` · ${t('overdue')}`}
              </p>
            </div>
            {installment.is_paid ? (
              <span className="text-success text-caption inline-flex items-center gap-1">
                <CheckCircle2 className="size-4" aria-hidden />
                {t('paidOn')} <FormattedDate value={installment.paid_at} />
              </span>
            ) : (
              canManage && (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={pay.isPending}
                  onClick={() => pay.mutate(installment.number)}
                >
                  {t('markPaid')}
                </Button>
              )
            )}
          </li>
        ))}
      </ul>

      {canReplace && (
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={onReplace}>
            {t('replace')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={remove.isPending}
            onClick={() => remove.mutate()}
          >
            <Trash2 aria-hidden />
            {t('delete')}
          </Button>
        </div>
      )}
    </div>
  );
}
