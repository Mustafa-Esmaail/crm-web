import type { Department } from '@/features/organization/departments';

import type { OrgChartNode } from '../types';
import type { ChartNode } from '../types/chart';

function countDescendants(node: OrgChartNode): number {
  return node.children.reduce((sum, child) => sum + 1 + countDescendants(child), 0);
}

/** Manager view: one box per person, counting everyone below them. */
export function fromOrgChart(nodes: OrgChartNode[]): ChartNode[] {
  return nodes.map((node) => ({
    id: `e${node.id}`,
    title: node.name,
    subtitle: node.job_title ?? node.department,
    avatarId: node.id,
    count: countDescendants(node),
    href: `/organization/employees/${node.id}`,
    children: fromOrgChart(node.children),
  }));
}

/** Department view: one box per department, showing its manager and head-count. */
export function fromDepartments(departments: Department[]): ChartNode[] {
  return departments.map((department) => ({
    id: `d${department.id}`,
    title: department.name,
    subtitle: department.manager?.name,
    avatarId: department.manager?.id ?? department.id,
    count: department.employees_count ?? 0,
    children: fromDepartments(department.children ?? []),
  }));
}

/** Every box in the forest, for counting and searching. */
export function flatten(nodes: ChartNode[]): ChartNode[] {
  return nodes.flatMap((node) => [node, ...flatten(node.children)]);
}

/** Ids of the boxes whose title or subtitle contains the text (case-insensitive). */
export function findMatches(nodes: ChartNode[], search: string): string[] {
  const needle = search.trim().toLowerCase();
  if (!needle) return [];

  return flatten(nodes)
    .filter((node) => `${node.title} ${node.subtitle ?? ''}`.toLowerCase().includes(needle))
    .map((node) => node.id);
}
