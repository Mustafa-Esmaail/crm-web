import { paginatedSchema, summarySchema } from '@crm/api-client';
import { z } from 'zod';

export const EXPORT_STATUSES = ['pending', 'approved', 'rejected'] as const;

export const exportRequestSchema = z.object({
  id: z.number(),
  module: z.string(),
  filters: z.unknown(),
  status: z.enum(EXPORT_STATUSES),
  requested_by: summarySchema.nullish(),
  decided_by: summarySchema.nullish(),
  decided_at: z.string().nullable(),
  decision_note: z.string().nullable(),
  downloadable: z.boolean(),
  created_at: z.string().nullable(),
});

export const exportRequestListSchema = paginatedSchema(exportRequestSchema);

export type ExportRequest = z.infer<typeof exportRequestSchema>;
