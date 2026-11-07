import type { OrgChartNode } from '../types';

/**
 * The chain of people from the top of the company down to `targetId`, inclusive, or an empty
 * array when the person is not in the tree (e.g. an employee who has left).
 */
export function findPathTo(roots: OrgChartNode[], targetId: number): OrgChartNode[] {
  for (const node of roots) {
    if (node.id === targetId) return [node];

    const below = findPathTo(node.children, targetId);
    if (below.length > 0) return [node, ...below];
  }
  return [];
}
