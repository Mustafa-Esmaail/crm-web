import { describe, expect, it } from 'vitest';

import { leadFormSchema } from '../schemas';
import type { Lead, LeadStage } from '../types';
import {
  EMPTY_LEAD_FORM,
  getMoveTargets,
  toLeadFormValues,
  toLeadPayload,
  toStageChangePayload,
} from './mappers';

const stage = (id: number, isLost = false): LeadStage => ({
  id,
  key: `s${id}`,
  name: `Stage ${id}`,
  name_ar: `مرحلة ${id}`,
  name_en: `Stage ${id}`,
  position: id,
  color: '#3B82F6',
  is_won: false,
  is_lost: isLost,
});

const lead: Lead = {
  id: 1,
  name: 'Nicole',
  phone: '+201174613184',
  email: null,
  budget: '3200000.00',
  notes: null,
  source: { id: 2, name: 'Facebook' },
  stage: stage(1),
  owner: { id: 21, name: 'Agent' },
  team: null,
  lost_reason: null,
  last_activity_at: null,
  created_at: '2026-10-30T00:00:00+00:00',
};

describe('lead mappers', () => {
  it('turns an API lead into form text', () => {
    expect(toLeadFormValues(lead)).toMatchObject({
      name: 'Nicole',
      email: '',
      source_id: '2',
      budget: 3200000,
      owner_id: '21',
      team_id: '',
    });
  });

  it('sends cleared fields as null and numbers as numbers', () => {
    expect(
      toLeadPayload({ ...EMPTY_LEAD_FORM, name: ' Nicole ', budget: 1500, owner_id: '21' }),
    ).toEqual({
      name: 'Nicole',
      phone: null,
      email: null,
      source_id: null,
      budget: 1500,
      notes: null,
      owner_id: 21,
      team_id: null,
    });
  });

  it('sends a lost reason only when the target stage is a lost stage', () => {
    const stages = [stage(1), stage(9, true)];

    expect(toStageChangePayload({ stage_id: '9', lost_reason: ' too pricey ' }, stages)).toEqual({
      stage_id: 9,
      lost_reason: 'too pricey',
    });
    expect(toStageChangePayload({ stage_id: '1', lost_reason: 'ignored' }, stages)).toEqual({
      stage_id: 1,
      lost_reason: null,
    });
  });

  it('offers every stage except the current one', () => {
    expect(getMoveTargets(lead, [stage(1), stage(2), stage(3)]).map((s) => s.id)).toEqual([2, 3]);
  });
});

describe('leadFormSchema', () => {
  const valid = { ...EMPTY_LEAD_FORM, name: 'Nicole' };

  it('only needs a name', () => {
    expect(leadFormSchema.safeParse(EMPTY_LEAD_FORM).success).toBe(false);
    expect(leadFormSchema.safeParse(valid).success).toBe(true);
  });

  it('checks phone, email and budget the way the API does', () => {
    expect(leadFormSchema.safeParse({ ...valid, phone: '+201174613184' }).success).toBe(true);
    expect(leadFormSchema.safeParse({ ...valid, phone: '12 ab' }).success).toBe(false);
    expect(leadFormSchema.safeParse({ ...valid, email: 'not-an-email' }).success).toBe(false);
    expect(leadFormSchema.safeParse({ ...valid, budget: -5 }).success).toBe(false);
  });
});
