import { paginatedSchema } from '@crm/api-client';
import { z } from 'zod';

export const buildingSchema = z.object({
  id: z.number(),
  project: z.object({ id: z.number(), name: z.string(), code: z.string().nullable() }),
  name: z.string(),
  name_ar: z.string(),
  name_en: z.string().nullable(),
  code: z.string().nullable(),
  floors_count: z.number().nullable(),
  units_count: z.number().optional(),
  created_at: z.string().nullable(),
});

export const buildingListSchema = paginatedSchema(buildingSchema);
export type Building = z.infer<typeof buildingSchema>;
