import { z } from 'zod';

// Mirrors TeamRequest: a team always belongs to a department.
export const teamFormSchema = z.object({
  department_id: z.string().min(1, 'validation.required'),
  name_ar: z.string().trim().min(1, 'validation.required').max(150, 'validation.maxLength'),
  name_en: z.string().max(150, 'validation.maxLength'),
  leader_id: z.string(),
  is_active: z.boolean(),
});

export type TeamFormValues = z.infer<typeof teamFormSchema>;
