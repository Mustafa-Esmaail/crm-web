import { describe, expect, it } from 'vitest';

import { getChanges } from './changes';

describe('getChanges', () => {
  it('returns only the attributes whose value actually changed', () => {
    const changes = getChanges({
      old_values: { team_id: 5, name: 'Layla', job_title: 'Rep' },
      new_values: { team_id: 3, name: 'Layla', job_title: 'Rep' },
    });

    expect(changes).toEqual([{ field: 'team_id', oldValue: 5, newValue: 3 }]);
  });

  it('ignores bookkeeping columns that change on every write', () => {
    const changes = getChanges({
      old_values: { updated_at: '2026-01-01', name: 'A' },
      new_values: { updated_at: '2026-02-02', name: 'B' },
    });

    expect(changes.map((change) => change.field)).toEqual(['name']);
  });

  it('treats a created record as every field going from nothing to a value', () => {
    const changes = getChanges({ old_values: null, new_values: { name: 'New', id: 9 } });

    expect(changes).toEqual([{ field: 'name', oldValue: undefined, newValue: 'New' }]);
  });

  it('reports a field removed on delete', () => {
    const changes = getChanges({ old_values: { code: 'X1' }, new_values: null });

    expect(changes).toEqual([{ field: 'code', oldValue: 'X1', newValue: undefined }]);
  });

  it('returns nothing when old and new are both empty', () => {
    expect(getChanges({ old_values: null, new_values: undefined })).toEqual([]);
  });
});
