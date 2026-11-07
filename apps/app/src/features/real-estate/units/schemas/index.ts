import { z } from 'zod';

import { UNIT_TYPES } from '../types';

// Mirrors UnitRequest; messages are i18n keys translated by FormField.
export const unitFormSchema = z.object({
  project_id: z.string().min(1, 'validation.required'),
  unit_number: z.string().trim().min(1, 'validation.required').max(30, 'validation.maxLength'),
  type: z.enum(UNIT_TYPES),
  floor: z.number('validation.number').int('validation.number').optional(),
  area_sqm: z.number('validation.required').min(1, 'validation.min'),
  bedrooms: z
    .number('validation.number')
    .int('validation.number')
    .min(0, 'validation.min')
    .optional(),
  bathrooms: z
    .number('validation.number')
    .int('validation.number')
    .min(0, 'validation.min')
    .optional(),
  price: z.number('validation.number').min(0, 'validation.min').optional(),
  notes: z.string().max(2000, 'validation.maxLength'),
});

export type UnitFormValues = z.infer<typeof unitFormSchema>;

export const reserveFormSchema = z.object({
  lead_id: z.string().min(1, 'validation.required'),
  hold_hours: z
    .number('validation.number')
    .int('validation.number')
    .min(1, 'validation.min')
    .optional(),
  deposit_amount: z.number('validation.number').min(0, 'validation.min').optional(),
});

export type ReserveFormValues = z.infer<typeof reserveFormSchema>;

// Mirrors PaymentPlanRequest. The date picker holds the day as "YYYY-MM-DD".
export const paymentPlanFormSchema = z.object({
  down_payment: z.number('validation.required').min(0, 'validation.min'),
  installments_count: z
    .number('validation.required')
    .int('validation.number')
    .min(1, 'validation.min')
    .max(120, 'validation.max'),
  interval_months: z
    .number('validation.required')
    .int('validation.number')
    .min(1, 'validation.min')
    .max(12, 'validation.max'),
  first_due_date: z.string().min(1, 'validation.required'),
});

export type PaymentPlanFormValues = z.infer<typeof paymentPlanFormSchema>;

// Mirrors AddUnitInterestRequest.
export const interestFormSchema = z.object({
  lead_id: z.string().min(1, 'validation.required'),
  note: z.string().max(500, 'validation.maxLength'),
});

export type InterestFormValues = z.infer<typeof interestFormSchema>;
