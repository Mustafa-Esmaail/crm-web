import { describe, expect, it } from 'vitest';

import type { OrgChartNode } from '../types';
import { findPathTo } from './tree';

const node = (id: number, children: OrgChartNode[] = []): OrgChartNode => ({
  id,
  name: `P${id}`,
  children,
});

// 1 > (2 > (4 > 5), 3)
const tree = [node(1, [node(2, [node(4, [node(5)])]), node(3)])];

describe('findPathTo', () => {
  it('returns the chain from the top down to the person, inclusive', () => {
    expect(findPathTo(tree, 5).map((person) => person.id)).toEqual([1, 2, 4, 5]);
  });

  it('returns just the root for the root itself', () => {
    expect(findPathTo(tree, 1).map((person) => person.id)).toEqual([1]);
  });

  it('finds a person in a sibling branch', () => {
    expect(findPathTo(tree, 3).map((person) => person.id)).toEqual([1, 3]);
  });

  it('returns nothing when the person is not in the tree', () => {
    expect(findPathTo(tree, 99)).toEqual([]);
  });

  it('works with several roots', () => {
    expect(findPathTo([node(7), node(8, [node(9)])], 9).map((person) => person.id)).toEqual([8, 9]);
  });
});
