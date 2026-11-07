import { paginatedSchema, phpRecord } from '@crm/api-client';
import { z } from 'zod';

// Old/new values are free-form attribute maps (null on create/delete, [] when empty in PHP).
const valuesSchema = phpRecord(z.unknown()).nullish();

export const auditLogSchema = z.object({
  id: z.number(),
  action: z.string(),
  module: z.string().nullish(),
  auditable_type: z.string().nullish(),
  auditable_id: z.number().nullish(),
  old_values: valuesSchema,
  new_values: valuesSchema,
  meta: z.unknown().optional(),
  user: z.object({ id: z.number(), name: z.string() }).nullish(),
  ip_address: z.string().nullish(),
  user_agent: z.string().nullish(),
  url: z.string().nullish(),
  http_method: z.string().nullish(),
  request_id: z.string().nullish(),
  created_at: z.string(),
});

export const auditLogListSchema = paginatedSchema(auditLogSchema);

export type AuditLog = z.infer<typeof auditLogSchema>;
