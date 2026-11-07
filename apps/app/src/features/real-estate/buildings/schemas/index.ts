import { z } from 'zod';

// Mirrors BuildingRequest; messages are i18n keys translated by FormField.
export const buildingFormSchema = z.object({
  project_id: z.string().min(1, 'validation.required'),
  name_ar: z.string().trim().min(1, 'validation.required').max(150, 'validation.maxLength'),
  name_en: z.string().max(150, 'validation.maxLength'),
  code: z.string().max(30, 'validation.maxLength'),
  floors_count: z
    .number('validation.number')
    .int('validation.number')
    .min(1, 'validation.min')
    .max(200, 'validation.max')
    .optional(),
});

export type BuildingFormValues = z.infer<typeof buildingFormSchema>;
