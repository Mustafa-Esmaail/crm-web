import { z } from 'zod';

/** The three catalogues that share one shape: lead stages, deal stages and lead sources. */
export const SETTING_KINDS = ['lead-stages', 'deal-stages', 'lead-sources'] as const;
export type SettingKind = (typeof SETTING_KINDS)[number];

export const STAGE_KINDS: readonly SettingKind[] = ['lead-stages', 'deal-stages'];

export const settingSchema = z.object({
  id: z.number(),
  key: z.string(),
  name: z.string(),
  name_ar: z.string(),
  name_en: z.string().nullable(),
  // Stage-only fields are absent on sources.
  position: z.number().optional(),
  color: z.string().nullish(),
  is_won: z.boolean().optional(),
  is_lost: z.boolean().optional(),
  // Sources only.
  is_active: z.boolean().optional(),
  leads_count: z.number().optional(),
  deals_count: z.number().optional(),
});

export const settingListSchema = z.object({ data: z.array(settingSchema) });
export type Setting = z.infer<typeof settingSchema>;

export const DISTRIBUTION_STRATEGIES = ['round_robin', 'workload'] as const;

export const ruleSchema = z.object({
  id: z.number(),
  team_id: z.number(),
  strategy: z.enum(DISTRIBUTION_STRATEGIES),
  is_active: z.boolean(),
  last_assigned_user_id: z.number().nullable(),
});

export const ruleListSchema = z.object({ data: z.array(ruleSchema) });
export type DistributionRule = z.infer<typeof ruleSchema>;
