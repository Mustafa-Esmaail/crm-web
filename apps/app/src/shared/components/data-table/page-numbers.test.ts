import { describe, expect, it } from 'vitest';

import { getPageItems } from './page-numbers';

describe('getPageItems', () => {
  it('shows every page when there are few', () => {
    expect(getPageItems(1, 3)).toEqual([1, 2, 3]);
  });

  it('collapses the distance to the ends into gaps', () => {
    expect(getPageItems(10, 20)).toEqual([1, 'gap', 9, 10, 11, 'gap', 20]);
  });

  it('does not add a gap when only one page would be hidden by it being adjacent', () => {
    expect(getPageItems(3, 20)).toEqual([1, 2, 3, 4, 'gap', 20]);
    expect(getPageItems(18, 20)).toEqual([1, 'gap', 17, 18, 19, 20]);
  });

  it('handles a single page', () => {
    expect(getPageItems(1, 1)).toEqual([1]);
  });
});
