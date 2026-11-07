import { paginatedSchema, resourceSchema } from '@crm/api-client';
import { z } from 'zod';

export const notificationSchema = z.object({
  id: z.string(),
  // The API does not type these two (Scramble exports them as free-form), so they stay opaque.
  kind: z.unknown().optional(),
  message: z.string(),
  subject_type: z.unknown().optional(),
  subject_id: z.unknown().optional(),
  is_read: z.boolean(),
  read_at: z.string().nullable(),
  created_at: z.string().nullable(),
});

export const notificationListSchema = paginatedSchema(notificationSchema);
export const notificationResponseSchema = resourceSchema(notificationSchema);
export const unreadCountSchema = resourceSchema(z.object({ unread: z.number() }));
export const markedAllSchema = resourceSchema(z.object({ marked: z.number() }));

export type Notification = z.infer<typeof notificationSchema>;
