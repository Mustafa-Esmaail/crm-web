import { z } from 'zod';

const maxLength = (max: number) => z.string().max(max, 'validation.maxLength');

// Mirrors DepartmentRequest; messages are i18n keys translated by FormField.
export const departmentFormSchema = z.object({
  name_ar: z.string().trim().min(1, 'validation.required').max(150, 'validation.maxLength'),
  name_en: maxLength(150),
  code: maxLength(30),
  parent_id: z.string(),
  branch_id: z.string(),
  manager_id: z.string(),
  is_active: z.boolean(),
});

export const moveDepartmentSchema = z.object({ parent_id: z.string() });

export type DepartmentFormValues = z.infer<typeof departmentFormSchema>;
export type MoveDepartmentValues = z.infer<typeof moveDepartmentSchema>;
