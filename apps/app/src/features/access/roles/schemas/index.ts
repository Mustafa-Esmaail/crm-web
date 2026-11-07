import { z } from 'zod';

import { ROLE_KEY_PATTERN } from '../constants';

// Mirrors RoleRequest; messages are i18n keys translated by FormField.
export const roleFormSchema = z.object({
  name_ar: z.string().trim().min(1, 'validation.required').max(150, 'validation.maxLength'),
  name_en: z.string().max(150, 'validation.maxLength'),
  key: z
    .string()
    .max(50, 'validation.maxLength')
    .refine((value) => value === '' || ROLE_KEY_PATTERN.test(value), 'validation.roleKey'),
  description: z.string().max(500, 'validation.maxLength'),
});

export type RoleFormValues = z.infer<typeof roleFormSchema>;
