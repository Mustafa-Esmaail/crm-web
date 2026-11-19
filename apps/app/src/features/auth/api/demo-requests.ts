import { z } from 'zod';

import type { HttpClient } from '@/lib/api/http-client';

/** The API decides (its DEMO env flag) whether the login page offers the demo, and as whom. */
const demoConfigSchema = z.object({
  data: z.object({
    enabled: z.boolean(),
    password: z.string().optional(),
    accounts: z.array(z.object({ role: z.string(), email: z.string() })),
  }),
});

export type DemoConfig = z.infer<typeof demoConfigSchema>['data'];

export function getDemoConfig(http: HttpClient, signal?: AbortSignal) {
  return http.request('/auth/demo', demoConfigSchema, { signal });
}

/** `sent` is false when the lead API failed; the visitor gets into the demo either way. */
const demoLeadResponseSchema = z.object({ data: z.object({ sent: z.boolean() }) });

export type DemoLeadBody = {
  name: string;
  phone_country: string;
  phone: string;
  landing_url?: string;
  referrer?: string;
} & Partial<Record<(typeof ATTRIBUTION_KEYS)[number], string>>;

/** Marketing parameters copied from the page URL into the lead. */
export const ATTRIBUTION_KEYS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
  'gclid',
  'fbclid',
] as const;

export function postDemoLead(http: HttpClient, body: DemoLeadBody) {
  return http.request('/auth/demo/leads', demoLeadResponseSchema, { method: 'POST', body });
}
