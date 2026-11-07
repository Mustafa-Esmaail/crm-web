import { z } from 'zod';

const required = 'validation.required';

// Mirrors DealRequest; messages are i18n keys translated by FormField.
export const dealFormSchema = z.object({
  title: z.string().trim().min(1, required).max(200, 'validation.maxLength'),
  // NumberField leaves an empty box as undefined, never 0.
  value: z.number('validation.number').min(0, 'validation.min').optional(),
  lead_id: z.string(),
  owner_id: z.string(),
  expected_close_date: z.string(),
  notes: z.string().max(5000, 'validation.maxLength'),
});

export type DealFormValues = z.infer<typeof dealFormSchema>;

export const dealStageChangeSchema = z.object({
  stage_id: z.string().min(1, required),
  lost_reason: z.string().max(500, 'validation.maxLength'),
});

export type DealStageChangeValues = z.infer<typeof dealStageChangeSchema>;

export const dealAssignSchema = z.object({ owner_id: z.string().min(1, required) });
export type DealAssignValues = z.infer<typeof dealAssignSchema>;
