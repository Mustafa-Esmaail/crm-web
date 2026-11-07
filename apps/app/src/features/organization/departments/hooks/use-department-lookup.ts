'use client';

import { useMemo } from 'react';

import type { Department } from '../types';
import { useDepartmentTreeQuery } from './use-departments-queries';

/** Every department by id (flattened from the tree), e.g. to find the branch a department sits in. */
export function useDepartmentLookup(): Map<number, Department> {
  const tree = useDepartmentTreeQuery();

  return useMemo(() => {
    const byId = new Map<number, Department>();
    const visit = (nodes: Department[]) => {
      for (const node of nodes) {
        byId.set(node.id, node);
        visit(node.children ?? []);
      }
    };
    visit(tree.data ?? []);
    return byId;
  }, [tree.data]);
}
