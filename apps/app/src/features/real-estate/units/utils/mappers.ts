import { toNumber } from '@/lib/utils/number';
import { emptyToNull } from '@/lib/utils/strings';

import type { PaymentPlan } from '../api/payment-plan-requests';
import type { PaymentPlanFormValues, ReserveFormValues, UnitFormValues } from '../schemas';
import type { Unit } from '../types';

export const EMPTY_UNIT_FORM: UnitFormValues = {
  project_id: '',
  unit_number: '',
  type: 'apartment',
  floor: undefined,
  area_sqm: undefined as unknown as number,
  bedrooms: undefined,
  bathrooms: undefined,
  price: undefined,
  notes: '',
};

export const EMPTY_RESERVE_FORM: ReserveFormValues = {
  lead_id: '',
  hold_hours: undefined,
  deposit_amount: undefined,
};

export function toUnitFormValues(unit: Unit): UnitFormValues {
  return {
    project_id: String(unit.project.id),
    unit_number: unit.unit_number,
    type: unit.type,
    floor: unit.floor ?? undefined,
    area_sqm: toNumber(unit.area_sqm) ?? (undefined as unknown as number),
    bedrooms: unit.bedrooms ?? undefined,
    bathrooms: unit.bathrooms ?? undefined,
    price: toNumber(unit.price) ?? undefined,
    notes: unit.notes ?? '',
  };
}

export function toUnitPayload(values: UnitFormValues) {
  return {
    project_id: Number(values.project_id),
    unit_number: values.unit_number.trim(),
    type: values.type,
    floor: values.floor ?? null,
    area_sqm: values.area_sqm,
    bedrooms: values.bedrooms ?? null,
    bathrooms: values.bathrooms ?? null,
    price: values.price ?? null,
    notes: emptyToNull(values.notes),
  };
}

export function toReservePayload(values: ReserveFormValues) {
  return {
    lead_id: Number(values.lead_id),
    hold_hours: values.hold_hours ?? null,
    deposit_amount: values.deposit_amount ?? null,
  };
}

export const EMPTY_PAYMENT_PLAN_FORM: PaymentPlanFormValues = {
  down_payment: undefined as unknown as number,
  installments_count: 12,
  interval_months: 1,
  first_due_date: '',
};

export function toPaymentPlanFormValues(plan: PaymentPlan): PaymentPlanFormValues {
  return {
    down_payment: toNumber(plan.down_payment) ?? 0,
    installments_count: plan.installments_count,
    interval_months: plan.interval_months,
    first_due_date: plan.first_due_date.slice(0, 10),
  };
}

/** PaymentPlanRequest takes the day as a plain date; the API derives every installment from it. */
export function toPaymentPlanPayload(values: PaymentPlanFormValues) {
  return {
    down_payment: values.down_payment,
    installments_count: values.installments_count,
    interval_months: values.interval_months,
    first_due_date: values.first_due_date,
  };
}
