import { paginatedSchema, resourceSchema, summarySchema } from '@crm/api-client';
import { z } from 'zod';

/** Pipeline stages are company-configured; `color` is a CSS colour chosen by the company. */
export const leadStageSchema = z.object({
  id: z.number(),
  key: z.string(),
  name: z.string(),
  name_ar: z.string(),
  name_en: z.string(),
  position: z.number(),
  color: z.string(),
  is_won: z.boolean(),
  is_lost: z.boolean(),
  leads_count: z.number().optional(),
});

export const leadSourceSchema = z.object({
  id: z.number(),
  key: z.string(),
  name: z.string(),
  name_ar: z.string(),
  name_en: z.string(),
  is_active: z.boolean(),
});

// Fields behind field-level permissions may be absent or null, so they are nullish.
export const leadSchema = z.object({
  id: z.number(),
  name: z.string(),
  phone: z.string().nullish(),
  email: z.string().nullish(),
  // Laravel serialises decimals as strings.
  budget: z.union([z.number(), z.string()]).nullish(),
  notes: z.string().nullable(),
  source: summarySchema.nullish(),
  stage: leadStageSchema.nullish(),
  owner: summarySchema.nullish(),
  team: summarySchema.nullish(),
  created_by: summarySchema.nullish(),
  lost_reason: z.string().nullable(),
  last_activity_at: z.string().nullable(),
  created_at: z.string(),
});

export const leadActivitySchema = z.object({
  id: z.number(),
  type: z.string(),
  body: z.string().nullable(),
  properties: z.unknown(),
  user: summarySchema.nullish(),
  occurred_at: z.string().nullable(),
});

export const leadListSchema = paginatedSchema(leadSchema);
export const leadResponseSchema = resourceSchema(leadSchema);
export const leadActivityListSchema = paginatedSchema(leadActivitySchema);
export const leadActivityResponseSchema = resourceSchema(leadActivitySchema);
export const leadStageListSchema = z.object({ data: z.array(leadStageSchema) });
export const leadSourceListSchema = z.object({ data: z.array(leadSourceSchema) });

export type Lead = z.infer<typeof leadSchema>;
export type LeadStage = z.infer<typeof leadStageSchema>;
export type LeadSource = z.infer<typeof leadSourceSchema>;
export type LeadActivity = z.infer<typeof leadActivitySchema>;
