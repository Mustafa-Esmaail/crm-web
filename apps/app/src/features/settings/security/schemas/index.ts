import { z } from 'zod';

const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;

// Mirrors SecurityPolicyRequest. IP syntax is left to the API, which knows CIDR and IPv6 rules
// exactly; its message comes back on the line that failed. Messages are i18n keys.
export const securityFormSchema = z
  .object({
    ip_whitelist: z.string(),
    hours_enabled: z.boolean(),
    hours_from: z.string(),
    hours_to: z.string(),
    hours_days: z.array(z.number()),
    require_two_factor: z.boolean(),
    export_requires_approval: z.boolean(),
  })
  .superRefine((values, ctx) => {
    if (!values.hours_enabled) return;
    for (const field of ['hours_from', 'hours_to'] as const) {
      const value = values[field];
      if (value === '') {
        ctx.addIssue({ code: 'custom', path: [field], message: 'validation.required' });
      } else if (!TIME.test(value)) {
        ctx.addIssue({ code: 'custom', path: [field], message: 'validation.time' });
      }
    }
    if (values.hours_from !== '' && values.hours_from === values.hours_to) {
      ctx.addIssue({ code: 'custom', path: ['hours_to'], message: 'validation.sameTime' });
    }
  });

export type SecurityFormValues = z.infer<typeof securityFormSchema>;
