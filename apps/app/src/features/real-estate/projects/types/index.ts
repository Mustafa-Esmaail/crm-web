import { paginatedSchema } from '@crm/api-client';
import { z } from 'zod';

export const PROJECT_STATUSES = ['planning', 'selling', 'completed'] as const;

export const projectSchema = z.object({
  id: z.number(),
  name: z.string(),
  name_ar: z.string(),
  name_en: z.string().nullable(),
  code: z.string().nullable(),
  city: z.string().nullable(),
  district: z.string().nullable(),
  address: z.string().nullable(),
  status: z.enum(PROJECT_STATUSES),
  delivery_date: z.string().nullable(),
  description: z.string().nullable(),
  units_count: z.number().optional(),
  available_units_count: z.number().optional(),
  created_at: z.string().nullable(),
});

export const projectListSchema = paginatedSchema(projectSchema);

export type Project = z.infer<typeof projectSchema>;
export type ProjectStatus = Project['status'];
