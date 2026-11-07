import { z } from 'zod';

const maxLength = (max: number) => z.string().max(max, 'validation.maxLength');

// Mirrors BranchRequest; messages are i18n keys translated by FormField.
export const branchFormSchema = z.object({
  name_ar: z.string().trim().min(1, 'validation.required').max(150, 'validation.maxLength'),
  name_en: maxLength(150),
  code: maxLength(30),
  city: maxLength(100),
  address: maxLength(255),
  phone: maxLength(30),
  manager_id: z.string(),
  is_active: z.boolean(),
});

export type BranchFormValues = z.infer<typeof branchFormSchema>;
