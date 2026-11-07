import { z } from 'zod';

import { ENGAGEMENT_STATUSES } from '../types';

// Mirrors PackageRequest; messages are i18n keys translated by FormField.
export const packageFormSchema = z.object({
  name_ar: z.string().trim().min(1, 'validation.required').max(150, 'validation.maxLength'),
  name_en: z.string().max(150, 'validation.maxLength'),
  code: z.string().max(30, 'validation.maxLength'),
  monthly_fee: z.number('validation.number').min(0, 'validation.min').optional(),
  deliverables: z.string().max(5000, 'validation.maxLength'),
  is_active: z.boolean(),
});

export type PackageFormValues = z.infer<typeof packageFormSchema>;

// Mirrors EngagementRequest. The package and the client are fixed once signed.
const engagementFields = z.object({
  package_id: z.string(),
  lead_id: z.string(),
  status: z.enum(ENGAGEMENT_STATUSES),
  monthly_fee: z.number('validation.number').min(0, 'validation.min').optional(),
  starts_on: z.string(),
  ends_on: z.string(),
  notes: z.string().max(5000, 'validation.maxLength'),
});

type EngagementFields = z.infer<typeof engagementFields>;

const endsAfterStart = (values: EngagementFields) =>
  !values.starts_on || !values.ends_on || values.ends_on >= values.starts_on;
const endsAfterStartIssue = { path: ['ends_on'], message: 'validation.endBeforeStart' };

export const engagementFormSchema = engagementFields.refine(endsAfterStart, endsAfterStartIssue);

export const engagementCreateSchema = engagementFields
  .extend({
    package_id: z.string().min(1, 'validation.required'),
    lead_id: z.string().min(1, 'validation.required'),
  })
  .refine(endsAfterStart, endsAfterStartIssue);

export type EngagementFormValues = EngagementFields;
