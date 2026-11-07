import { z } from 'zod';

import { PROJECT_STATUSES } from '../types';

// Mirrors ProjectRequest; messages are i18n keys translated by FormField.
export const projectFormSchema = z.object({
  name_ar: z.string().trim().min(1, 'validation.required').max(150, 'validation.maxLength'),
  name_en: z.string().max(150, 'validation.maxLength'),
  code: z.string().max(30, 'validation.maxLength'),
  city: z.string().max(100, 'validation.maxLength'),
  district: z.string().max(100, 'validation.maxLength'),
  address: z.string().max(255, 'validation.maxLength'),
  status: z.enum(PROJECT_STATUSES),
  delivery_date: z.string(),
  description: z.string().max(5000, 'validation.maxLength'),
});

export type ProjectFormValues = z.infer<typeof projectFormSchema>;
