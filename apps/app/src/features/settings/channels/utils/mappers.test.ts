import { describe, expect, it } from 'vitest';

import { EMPTY_CHANNEL_FORM, toChannelPayload } from './mappers';

describe('toChannelPayload', () => {
  const values = {
    ...EMPTY_CHANNEL_FORM,
    name: ' Main line ',
    credentials: { access_token: ' abc ', graph_version: '' },
  };

  it('sends the type and only the typed credentials on create', () => {
    expect(toChannelPayload(values, true)).toEqual({
      type: 'whatsapp',
      name: 'Main line',
      lead_source_key: null,
      team_id: null,
      is_active: true,
      credentials: { access_token: 'abc' },
    });
  });

  it('leaves credentials and type out on an untouched update', () => {
    const payload = toChannelPayload({ ...values, credentials: {} }, false);
    expect(payload).not.toHaveProperty('credentials');
    expect(payload).not.toHaveProperty('type');
  });
});
