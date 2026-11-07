import { paginatedSchema, resourceSchema, summarySchema } from '@crm/api-client';
import { z } from 'zod';

/** Deal stages are company-configured; `color` is a CSS colour chosen by the company. */
export const dealStageSchema = z.object({
  id: z.number(),
  key: z.string(),
  name: z.string(),
  name_ar: z.string(),
  name_en: z.string(),
  position: z.number(),
  color: z.string(),
  is_won: z.boolean(),
  is_lost: z.boolean(),
  // Only the pipeline endpoint counts deals per stage. Laravel serialises decimals as strings.
  deals_count: z.number().optional(),
  deals_value: z.union([z.number(), z.string()]).optional(),
});

// Fields behind field-level permissions may be absent or null, so they are nullish.
export const dealSchema = z.object({
  id: z.number(),
  title: z.string(),
  value: z.union([z.number(), z.string()]).nullish(),
  commission_amount: z.union([z.number(), z.string()]).nullish(),
  lead_id: z.number().nullable(),
  stage: dealStageSchema.nullish(),
  owner: summarySchema.nullish(),
  expected_close_date: z.string().nullable(),
  closed_at: z.string().nullable(),
  lost_reason: z.string().nullable(),
  source_type: z.unknown().optional(),
  source_id: z.unknown().optional(),
  notes: z.string().nullable(),
  created_at: z.string(),
});

export const dealListSchema = paginatedSchema(dealSchema);
export const dealResponseSchema = resourceSchema(dealSchema);
export const dealStageListSchema = z.object({ data: z.array(dealStageSchema) });

export type Deal = z.infer<typeof dealSchema>;
export type DealStage = z.infer<typeof dealStageSchema>;
