import { paginatedSchema, resourceSchema, summarySchema } from '@crm/api-client';
import { z } from 'zod';

export const teamSchema = z.object({
  id: z.number(),
  name: z.string(),
  name_ar: z.string(),
  name_en: z.string().nullish(),
  is_active: z.boolean(),
  department: summarySchema.nullish(),
  leader: summarySchema.nullish(),
  members_count: z.number().optional(),
  created_at: z.string().nullish(),
});

export const teamListSchema = paginatedSchema(teamSchema);
export const teamResponseSchema = resourceSchema(teamSchema);

export type Team = z.infer<typeof teamSchema>;
