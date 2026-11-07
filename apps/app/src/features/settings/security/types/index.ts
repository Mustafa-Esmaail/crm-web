import { z } from 'zod';

/** Carbon's dayOfWeek: 0 = Sunday … 6 = Saturday. */
export const WEEK_DAYS = [0, 1, 2, 3, 4, 5, 6] as const;

const loginHoursSchema = z.object({
  from: z.string(),
  to: z.string(),
  days: z.array(z.coerce.number()).nullable().optional(),
});

// SecurityPolicyResource. PHP serialises an empty login_hours array as `[]`, which means "none".
export const securityPolicySchema = z.object({
  ip_whitelist: z.array(z.string()),
  login_hours: z.preprocess(
    (value) => (Array.isArray(value) ? null : value),
    loginHoursSchema.nullable(),
  ),
  require_two_factor: z.boolean(),
  export_requires_approval: z.boolean(),
  updated_at: z.string().nullable(),
});

export const securityPolicyResponseSchema = z.object({ data: securityPolicySchema });

export type SecurityPolicy = z.infer<typeof securityPolicySchema>;
