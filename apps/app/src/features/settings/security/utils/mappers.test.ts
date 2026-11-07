import { describe, expect, it } from 'vitest';

import type { SecurityPolicy } from '../types';
import { securityPolicySchema } from '../types';
import { mapSecurityErrors, parseIpList, toSecurityFormValues, toSecurityPayload } from './mappers';

const POLICY: SecurityPolicy = {
  ip_whitelist: ['41.33.10.0/24', '10.0.0.5'],
  login_hours: { from: '08:00', to: '18:00', days: [4, 0, 1] },
  require_two_factor: true,
  export_requires_approval: false,
  updated_at: null,
};

describe('securityPolicySchema', () => {
  it('reads an empty PHP array for login_hours as no hours', () => {
    const parsed = securityPolicySchema.parse({ ...POLICY, login_hours: [] });
    expect(parsed.login_hours).toBeNull();
  });
});

describe('parseIpList', () => {
  it('splits on lines and commas, trims, and drops blanks and repeats', () => {
    expect(parseIpList(' 10.0.0.1 \n\n10.0.0.2, 10.0.0.1\n')).toEqual(['10.0.0.1', '10.0.0.2']);
  });
});

describe('security policy round trip', () => {
  it('turns the policy into form values and back', () => {
    const values = toSecurityFormValues(POLICY);
    expect(values.ip_whitelist).toBe('41.33.10.0/24\n10.0.0.5');
    expect(values.hours_days).toEqual([0, 1, 4]);
    expect(toSecurityPayload(values)).toEqual({
      ip_whitelist: ['41.33.10.0/24', '10.0.0.5'],
      login_hours: { from: '08:00', to: '18:00', days: [0, 1, 4] },
      require_two_factor: true,
      export_requires_approval: false,
    });
  });

  it('sends null hours when the limit is off, and null days for every day', () => {
    const values = toSecurityFormValues({ ...POLICY, login_hours: null });
    expect(values.hours_enabled).toBe(false);
    expect(toSecurityPayload(values).login_hours).toBeNull();

    const everyDay = { ...values, hours_enabled: true, hours_from: '09:00', hours_to: '17:00' };
    expect(toSecurityPayload(everyDay).login_hours).toEqual({
      from: '09:00',
      to: '17:00',
      days: null,
    });
  });
});

describe('mapSecurityErrors', () => {
  it('puts each Laravel key on the field that shows it, naming the bad IP line', () => {
    const result = mapSecurityErrors(
      {
        'ip_whitelist.1': ['Enter a valid IP address or range.'],
        'login_hours.to': ['Must differ from the start.'],
        'login_hours.days.0': ['Invalid day.'],
        tenant: ['Something else.'],
      },
      ['10.0.0.1', '999.1.1.1'],
    );
    expect(result.fields).toEqual({
      ip_whitelist: '999.1.1.1: Enter a valid IP address or range.',
      hours_to: 'Must differ from the start.',
      hours_days: 'Invalid day.',
    });
    expect(result.unmapped).toEqual(['Something else.']);
  });
});
