import { paginatedSchema } from '@crm/api-client';
import { z } from 'zod';

const money = z.union([z.string(), z.number()]).nullable();

// PackageResource; active_engagements is sent with lists.
export const packageSchema = z.object({
  id: z.number(),
  name: z.string(),
  name_ar: z.string(),
  name_en: z.string().nullable(),
  code: z.string().nullable(),
  monthly_fee: money,
  deliverables: z.string().nullable(),
  is_active: z.boolean(),
  active_engagements: z.number().optional(),
  created_at: z.string().nullable(),
});

export const ENGAGEMENT_STATUSES = ['proposed', 'active', 'paused', 'ended'] as const;

// EngagementResource: the client is a lead, sent by id only.
export const engagementSchema = z.object({
  id: z.number(),
  package: z.object({ id: z.number(), name: z.string(), code: z.string().nullable() }).optional(),
  lead_id: z.number(),
  status: z.enum(ENGAGEMENT_STATUSES),
  monthly_fee: money,
  starts_on: z.string().nullable(),
  ends_on: z.string().nullable(),
  notes: z.string().nullable(),
  created_at: z.string().nullable(),
});

export const packageListSchema = paginatedSchema(packageSchema);
export const engagementListSchema = paginatedSchema(engagementSchema);

export type AgencyPackage = z.infer<typeof packageSchema>;
export type Engagement = z.infer<typeof engagementSchema>;
export type EngagementStatus = Engagement['status'];
