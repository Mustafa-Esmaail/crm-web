import { paginatedSchema, resourceSchema, summarySchema } from '@crm/api-client';
import { z } from 'zod';

export const branchSchema = z.object({
  id: z.number(),
  name: z.string(),
  name_ar: z.string(),
  name_en: z.string().nullish(),
  code: z.string().nullish(),
  city: z.string().nullish(),
  address: z.string().nullish(),
  phone: z.string().nullish(),
  is_active: z.boolean(),
  manager: summarySchema.nullish(),
  employees_count: z.number().optional(),
  created_at: z.string().nullish(),
});

export const branchListSchema = paginatedSchema(branchSchema);
export const branchResponseSchema = resourceSchema(branchSchema);

export type Branch = z.infer<typeof branchSchema>;
