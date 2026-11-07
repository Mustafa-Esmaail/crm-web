import { describe, expect, it } from 'vitest';

import { EMPTY_TASK_FORM, toTaskPayload } from './mappers';

describe('toTaskPayload', () => {
  it('turns empty inputs into nulls', () => {
    expect(toTaskPayload({ ...EMPTY_TASK_FORM, title: ' Call ' }, { isCreate: true })).toEqual({
      title: 'Call',
      description: null,
      priority: 'normal',
      due_at: null,
      owner_id: null,
    });
  });

  it('sends the due day as an end-of-day timestamp', () => {
    expect(
      toTaskPayload({ ...EMPTY_TASK_FORM, title: 'x', due_at: '2026-11-10' }, { isCreate: true })
        .due_at,
    ).toBe('2026-11-10T23:59:00');
  });

  it('links a new task to its lead or deal', () => {
    expect(
      toTaskPayload(
        { ...EMPTY_TASK_FORM, title: 'x', owner_id: '7' },
        { isCreate: true, related: { type: 'lead', id: 3 } },
      ),
    ).toMatchObject({ related_type: 'lead', related_id: 3, owner_id: 7 });
  });

  // The API answers 422 ("prohibited") when an update carries owner_id, even the current one.
  it('never sends the owner or the relation on update', () => {
    const payload = toTaskPayload(
      { ...EMPTY_TASK_FORM, title: 'x', owner_id: '7' },
      { isCreate: false, related: { type: 'deal', id: 3 } },
    );
    expect(payload).not.toHaveProperty('owner_id');
    expect(payload).not.toHaveProperty('related_type');
    expect(payload).not.toHaveProperty('related_id');
  });
});
