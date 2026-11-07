import { z } from 'zod';

// Mirrors TaskRequest; messages are i18n keys translated by FormField.
export const taskFormSchema = z.object({
  title: z.string().trim().min(1, 'validation.required').max(200, 'validation.maxLength'),
  description: z.string().max(5000, 'validation.maxLength'),
  priority: z.enum(['low', 'normal', 'high']),
  due_at: z.string(),
  owner_id: z.string(),
});

export type TaskFormValues = z.infer<typeof taskFormSchema>;

export const taskAssignSchema = z.object({ owner_id: z.string().min(1, 'validation.required') });
export type TaskAssignValues = z.infer<typeof taskAssignSchema>;
