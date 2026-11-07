import { describe, expect, it } from 'vitest';

import { EMPTY_BUILDING_FORM, toBuildingPayload } from './mappers';

describe('toBuildingPayload', () => {
  it('turns the project into a number and empty inputs into nulls', () => {
    expect(
      toBuildingPayload({ ...EMPTY_BUILDING_FORM, project_id: '2', name_ar: ' برج أ ' }),
    ).toEqual({ project_id: 2, name_ar: 'برج أ', name_en: null, code: null, floors_count: null });
  });
});
