import { z } from 'zod';

import { CHANNEL_TYPES } from '../types';

export const channelFormSchema = z.object({
  type: z.enum(CHANNEL_TYPES),
  name: z.string().trim().min(1, 'validation.required').max(150, 'validation.maxLength'),
  lead_source_key: z.string().max(50, 'validation.maxLength'),
  team_id: z.string(),
  is_active: z.boolean(),
  // Write-only: on edit an empty box keeps the stored secret.
  credentials: z.record(z.string(), z.string()),
});

export type ChannelFormValues = z.infer<typeof channelFormSchema>;
