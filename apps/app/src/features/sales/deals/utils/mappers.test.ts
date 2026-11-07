import { describe, expect, it } from 'vitest';

import { dealFormSchema } from '../schemas';
import type { Deal, DealStage } from '../types';
import {
  EMPTY_DEAL_FORM,
  getDealMoveTargets,
  groupByStage,
  toDealFormValues,
  toDealPayload,
  toDealStagePayload,
} from './mappers';

const stage = (id: number, isLost = false): DealStage => ({
  id,
  key: `s${id}`,
  name: `Stage ${id}`,
  name_ar: `مرحلة ${id}`,
  name_en: `Stage ${id}`,
  position: id,
  color: '#8B5CF6',
  is_won: false,
  is_lost: isLost,
});

const deal = (id: number, stageId: number | null): Deal => ({
  id,
  title: `Deal ${id}`,
  value: '3200000.00',
  commission_amount: null,
  lead_id: 7,
  stage: stageId === null ? null : stage(stageId),
  owner: { id: 21, name: 'Agent' },
  expected_close_date: '2026-12-01T00:00:00+00:00',
  closed_at: null,
  lost_reason: null,
  notes: null,
  created_at: '2026-10-30T00:00:00+00:00',
});

describe('deal mappers', () => {
  it('turns an API deal into form values, keeping only the day of a timestamp', () => {
    expect(toDealFormValues(deal(1, 1))).toMatchObject({
      title: 'Deal 1',
      value: 3200000,
      lead_id: '7',
      owner_id: '21',
      expected_close_date: '2026-12-01',
      notes: '',
    });
  });

  it('sends cleared fields as null and the amount as a number', () => {
    expect(
      toDealPayload({ ...EMPTY_DEAL_FORM, title: ' Villa ', value: 900000, lead_id: '7' }),
    ).toEqual({
      title: 'Villa',
      value: 900000,
      lead_id: 7,
      owner_id: null,
      expected_close_date: null,
      notes: null,
    });
  });

  it('sends a lost reason only when the target stage is a lost stage', () => {
    const stages = [stage(1), stage(9, true)];

    expect(toDealStagePayload({ stage_id: '9', lost_reason: ' no budget ' }, stages)).toEqual({
      stage_id: 9,
      lost_reason: 'no budget',
    });
    expect(toDealStagePayload({ stage_id: '1', lost_reason: 'ignored' }, stages)).toEqual({
      stage_id: 1,
      lost_reason: null,
    });
  });

  it('offers every stage except the current one', () => {
    expect(getDealMoveTargets(deal(1, 2), [stage(1), stage(2), stage(3)]).map((s) => s.id)).toEqual(
      [1, 3],
    );
  });

  it('groups deals under their stage in stage order and ignores stageless ones', () => {
    const columns = groupByStage(
      [deal(1, 2), deal(2, 1), deal(3, 2), deal(4, null)],
      [stage(1), stage(2), stage(3)],
    );

    expect([...columns.keys()]).toEqual([1, 2, 3]);
    expect(columns.get(2)?.map((d) => d.id)).toEqual([1, 3]);
    expect(columns.get(3)).toEqual([]);
  });
});

describe('dealFormSchema', () => {
  it('needs a title and a non-negative amount when one is given', () => {
    expect(dealFormSchema.safeParse(EMPTY_DEAL_FORM).success).toBe(false);
    expect(dealFormSchema.safeParse({ ...EMPTY_DEAL_FORM, title: 'Villa' }).success).toBe(true);
    expect(
      dealFormSchema.safeParse({ ...EMPTY_DEAL_FORM, title: 'Villa', value: -1 }).success,
    ).toBe(false);
  });
});
