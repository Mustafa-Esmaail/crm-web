import { emptyToNull, idOrNull } from '@/lib/utils/strings';

import type { ChannelFormValues } from '../schemas';
import type { Channel } from '../types';

export const EMPTY_CHANNEL_FORM: ChannelFormValues = {
  type: 'whatsapp',
  name: '',
  lead_source_key: '',
  team_id: '',
  is_active: true,
  credentials: {},
};

export function toChannelFormValues(channel: Channel): ChannelFormValues {
  return {
    type: channel.type,
    name: channel.name,
    lead_source_key: channel.lead_source_key ?? '',
    team_id: channel.team_id === null ? '' : String(channel.team_id),
    is_active: channel.is_active,
    credentials: {},
  };
}

/** Only typed credentials are sent, so an untouched secret on edit keeps its stored value. */
export function toChannelPayload(values: ChannelFormValues, isCreate: boolean) {
  const credentials = Object.fromEntries(
    Object.entries(values.credentials)
      .map(([key, value]) => [key, value.trim()] as const)
      .filter(([, value]) => value !== ''),
  );

  return {
    ...(isCreate ? { type: values.type } : {}),
    name: values.name.trim(),
    lead_source_key: emptyToNull(values.lead_source_key),
    team_id: idOrNull(values.team_id),
    is_active: values.is_active,
    ...(Object.keys(credentials).length > 0 ? { credentials } : {}),
  };
}
