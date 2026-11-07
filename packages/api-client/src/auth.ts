import { z } from 'zod';

import { phpRecord } from './php';

export const accessProfileSchema = z.object({
  roles: z.array(z.object({ id: z.number(), key: z.string(), name: z.string() })),
  permissions: z.array(z.string()),
  scopes: phpRecord(z.string()),
  fields: phpRecord(phpRecord(z.string())),
});

export const tenantSchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
  industry: z.string(),
  status: z.string(),
  locale: z.string().nullable(),
  timezone: z.string().nullable(),
});

export const userSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string(),
  phone: z.string().nullable(),
  job_title: z.string().nullable(),
  status: z.string(),
  is_owner: z.boolean(),
  locale: z.string().nullable(),
  last_login_at: z.string().nullable(),
  tenant: tenantSchema.optional(),
  access: accessProfileSchema.optional(),
});

export const currentUserResponseSchema = z.object({ data: userSchema });

export type AccessProfile = z.infer<typeof accessProfileSchema>;
export type Tenant = z.infer<typeof tenantSchema>;
export type CurrentUser = z.infer<typeof userSchema>;

/** Owners hold every permission implicitly; the backend remains the real check. */
export function canPerform(user: CurrentUser | undefined, permission: string): boolean {
  if (!user) return false;
  if (user.is_owner) return true;
  return user.access?.permissions.includes(permission) ?? false;
}
