import { z } from 'zod';

import type { HttpClient } from '@/lib/api/http-client';

const money = z.union([z.string(), z.number()]);

export const installmentSchema = z.object({
  number: z.number(),
  due_date: z.string(),
  amount: money,
  is_paid: z.boolean(),
  paid_at: z.string().nullable(),
  is_overdue: z.boolean(),
});

export const paymentPlanSchema = z.object({
  id: z.number(),
  unit_id: z.number(),
  total_price: money,
  down_payment: money,
  installments_count: z.number(),
  interval_months: z.number(),
  first_due_date: z.string(),
  paid_installments: z.number().optional(),
  remaining_amount: money.optional(),
  installments: z.array(installmentSchema).optional(),
});

export type PaymentPlan = z.infer<typeof paymentPlanSchema>;
export type Installment = z.infer<typeof installmentSchema>;

const planResponse = z.object({ data: paymentPlanSchema });
const installmentResponse = z.object({ data: installmentSchema });

const base = (unitId: number) => `/real-estate/units/${unitId}/payment-plan`;

export function getPaymentPlan(http: HttpClient, unitId: number, signal?: AbortSignal) {
  return http.request(base(unitId), planResponse, { signal });
}

export function savePaymentPlan(http: HttpClient, unitId: number, body: unknown) {
  return http.request(base(unitId), planResponse, { method: 'PUT', body });
}

export function deletePaymentPlan(http: HttpClient, unitId: number) {
  return http.request(base(unitId), z.undefined(), { method: 'DELETE' });
}

export function payInstallment(http: HttpClient, unitId: number, number: number) {
  return http.request(`${base(unitId)}/installments/${number}/pay`, installmentResponse, {
    method: 'POST',
  });
}
