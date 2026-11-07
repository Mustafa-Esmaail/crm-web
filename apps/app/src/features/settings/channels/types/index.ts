import { paginatedSchema } from '@crm/api-client';
import { z } from 'zod';

export const CHANNEL_TYPES = ['whatsapp', 'sms', 'facebook_lead_ads', 'web_form'] as const;
export type ChannelType = (typeof CHANNEL_TYPES)[number];

export const channelSchema = z.object({
  id: z.number(),
  type: z.enum(CHANNEL_TYPES),
  name: z.string(),
  webhook_url: z.string(),
  // Names of the credentials that are set; values are never returned.
  credentials_set: z.array(z.string()),
  lead_source_key: z.string().nullable(),
  team_id: z.number().nullable(),
  is_active: z.boolean(),
  can_send: z.boolean(),
  last_received_at: z.string().nullable(),
  created_at: z.string().nullable(),
});

export const channelListSchema = paginatedSchema(channelSchema);
export type Channel = z.infer<typeof channelSchema>;

export interface CredentialField {
  key: string;
  required: boolean;
}

/** What each provider needs, mirroring the API's driver rules; the API stays the judge. */
export const CREDENTIAL_FIELDS: Record<ChannelType, CredentialField[]> = {
  whatsapp: [
    { key: 'access_token', required: true },
    { key: 'phone_number_id', required: true },
    { key: 'app_secret', required: true },
    { key: 'verify_token', required: true },
    { key: 'graph_version', required: false },
  ],
  sms: [
    { key: 'account_sid', required: true },
    { key: 'auth_token', required: true },
    { key: 'from', required: true },
  ],
  facebook_lead_ads: [
    { key: 'page_access_token', required: true },
    { key: 'app_secret', required: true },
    { key: 'verify_token', required: true },
    { key: 'graph_version', required: false },
  ],
  web_form: [{ key: 'secret', required: false }],
};
