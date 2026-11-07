import { z } from 'zod';

import { DISTRIBUTION_STRATEGIES } from '../types';

// One superset form for stages and sources; the payload mapper keeps only what each kind accepts.
export const settingFormSchema = z
  .object({
    name_ar: z.string().trim().min(1, 'validation.required').max(150, 'validation.maxLength'),
    name_en: z.string().max(150, 'validation.maxLength'),
    key: z
      .string()
      .regex(/^([a-z][a-z0-9_]*)?$/, 'validation.key')
      .max(50, 'validation.maxLength'),
    position: z
      .number('validation.number')
      .int('validation.number')
      .min(0, 'validation.min')
      .optional(),
    color: z.string().regex(/^(#[0-9A-Fa-f]{6})?$/, 'validation.color'),
    is_won: z.boolean(),
    is_lost: z.boolean(),
    is_active: z.boolean(),
  })
  .refine((values) => !(values.is_won && values.is_lost), {
    path: ['is_lost'],
    message: 'validation.wonAndLost',
  });

export type SettingFormValues = z.infer<typeof settingFormSchema>;

export const ruleFormSchema = z.object({
  team_id: z.string().min(1, 'validation.required'),
  strategy: z.enum(DISTRIBUTION_STRATEGIES),
  is_active: z.boolean(),
});

export type RuleFormValues = z.infer<typeof ruleFormSchema>;
