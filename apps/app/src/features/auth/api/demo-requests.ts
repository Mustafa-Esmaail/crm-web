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
