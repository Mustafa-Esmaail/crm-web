import { z } from 'zod';

import { ACTIVITY_TYPES, PHONE_PATTERN } from '../constants';

const required = 'validation.required';

// Mirrors LeadRequest; messages are i18n keys translated by FormField.
export const leadFormSchema = z.object({
  name: z.string().trim().min(1, required).max(150, 'validation.maxLength'),
  phone: z
    .string()
    .trim()
    .refine((value) => value === '' || PHONE_PATTERN.test(value), 'validation.phone'),
  email: z
    .string()
    .trim()
    .max(255, 'validation.maxLength')
    .refine((value) => value === '' || z.email().safeParse(value).success, 'validation.email'),
  source_id: z.string(),
  // NumberField leaves an empty box as undefined, never 0.
  budget: z.number('validation.number').min(0, 'validation.min').optional(),
  notes: z.string().max(5000, 'validation.maxLength'),
  owner_id: z.string(),
  team_id: z.string(),
});

export type LeadFormValues = z.infer<typeof leadFormSchema>;

export const changeStageSchema = z.object({
  stage_id: z.string().min(1, required),
  lost_reason: z.string().max(500, 'validation.maxLength'),
});

export type ChangeStageValues = z.infer<typeof changeStageSchema>;

export const assignSchema = z.object({ owner_id: z.string().min(1, required) });
export type AssignValues = z.infer<typeof assignSchema>;

export const activityFormSchema = z.object({
  type: z.enum(ACTIVITY_TYPES),
  body: z.string().trim().max(5000, 'validation.maxLength'),
});

export type ActivityFormValues = z.infer<typeof activityFormSchema>;
