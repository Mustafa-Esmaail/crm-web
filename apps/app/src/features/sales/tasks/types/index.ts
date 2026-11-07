import { paginatedSchema, summarySchema } from '@crm/api-client';
import { z } from 'zod';

export const taskSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string().nullable(),
  priority: z.enum(['low', 'normal', 'high']),
  status: z.enum(['open', 'done']),
  is_overdue: z.boolean(),
  due_at: z.string().nullable(),
  completed_at: z.string().nullable(),
  related_type: z.string().nullable(),
  related_id: z.number().nullable(),
  owner: summarySchema.nullish(),
  created_at: z.string().nullable(),
});

export const taskListSchema = paginatedSchema(taskSchema);

export type Task = z.infer<typeof taskSchema>;
export type TaskPriority = Task['priority'];
