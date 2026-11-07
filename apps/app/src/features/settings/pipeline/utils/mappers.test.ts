import { describe, expect, it } from 'vitest';

import { EMPTY_SETTING_FORM, toRulePayload, toSettingPayload } from './mappers';

describe('toSettingPayload', () => {
  const values = { ...EMPTY_SETTING_FORM, name_ar: ' جديد ', color: '#112233', is_won: true };

  it('sends stage fields and the key on create', () => {
    expect(toSettingPayload('deal-stages', values, true)).toEqual({
      key: null,
      name_ar: 'جديد',
      name_en: null,
      color: '#112233',
      is_won: true,
      is_lost: false,
    });
  });

  it('leaves the key out on update', () => {
    expect(toSettingPayload('lead-stages', { ...values, key: 'new' }, false)).not.toHaveProperty(
      'key',
    );
  });

  it('sends only is_active for sources', () => {
    expect(toSettingPayload('lead-sources', values, false)).toEqual({
      name_ar: 'جديد',
      name_en: null,
      is_active: true,
    });
  });
});

describe('toRulePayload', () => {
  it('turns the team id into a number', () => {
    expect(toRulePayload({ team_id: '4', strategy: 'workload', is_active: false })).toEqual({
      team_id: 4,
      strategy: 'workload',
      is_active: false,
    });
  });
});
