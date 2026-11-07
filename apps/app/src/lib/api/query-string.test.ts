import { describe, expect, it } from 'vitest';

import { buildListParams } from './list-params';
import { buildQueryString } from './query-string';

describe('buildQueryString', () => {
  it('drops empty values so cleared filters never reach the API', () => {
    expect(buildQueryString({ search: '', status: null, branch_id: undefined })).toBe('');
  });

  it('sends booleans as 1/0 because Laravel rejects the string "true"', () => {
    expect(buildQueryString({ include_sub_departments: true, archived: false })).toBe(
      '?include_sub_departments=1&archived=0',
    );
  });

  it('keeps 0 and encodes arrays Laravel-style', () => {
    expect(buildQueryString({ page: 0, ids: [1, 2] })).toBe('?page=0&ids%5B%5D=1&ids%5B%5D=2');
  });
});

describe('buildListParams', () => {
  it('omits page 1 and merges filters', () => {
    expect(
      buildListParams({ search: 'ali', page: 1, perPage: 15, filters: { status: 'active' } }),
    ).toEqual({ status: 'active', search: 'ali', page: undefined, per_page: 15, sort: undefined });
  });

  it('keeps pages after the first', () => {
    expect(buildListParams({ page: 3 }).page).toBe(3);
  });
});
