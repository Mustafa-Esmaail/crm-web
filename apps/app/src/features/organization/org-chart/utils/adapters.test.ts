import { describe, expect, it } from 'vitest';

import type { Department } from '@/features/organization/departments';

import type { OrgChartNode } from '../types';
import { findMatches, flatten, fromDepartments, fromOrgChart } from './adapters';

const person = (id: number, name: string, children: OrgChartNode[] = []): OrgChartNode => ({
  id,
  name,
  job_title: `${name} title`,
  children,
});

const people = [person(1, 'Owner', [person(2, 'Layla', [person(4, 'Omar')]), person(3, 'Sara')])];

describe('fromOrgChart', () => {
  it('counts everyone below a person, directly or not', () => {
    const [owner] = fromOrgChart(people);

    expect(owner?.count).toBe(3);
    expect(owner?.children.find((child) => child.title === 'Layla')?.count).toBe(1);
    expect(owner?.children.find((child) => child.title === 'Sara')?.count).toBe(0);
  });

  it('links each person to their profile', () => {
    expect(fromOrgChart(people)[0]?.href).toBe('/organization/employees/1');
  });

  it('prefixes ids so a person and a department never collide', () => {
    expect(fromOrgChart(people)[0]?.id).toBe('e1');
  });
});

describe('fromDepartments', () => {
  const departments: Department[] = [
    {
      id: 7,
      parent_id: null,
      name: 'Sales',
      name_ar: 'Sales',
      is_active: true,
      manager: { id: 2, name: 'Layla' },
      employees_count: 9,
      children: [{ id: 8, parent_id: 7, name: 'Inbound', name_ar: 'Inbound', is_active: true }],
    },
  ];

  it('shows the manager as the subtitle and the head-count as the number', () => {
    const [sales] = fromDepartments(departments);

    expect(sales).toMatchObject({
      id: 'd7',
      title: 'Sales',
      subtitle: 'Layla',
      count: 9,
      avatarId: 2,
    });
    expect(sales?.children[0]).toMatchObject({ id: 'd8', count: 0 });
  });
});

describe('findMatches', () => {
  const nodes = fromOrgChart(people);

  it('matches names and titles regardless of case', () => {
    expect(findMatches(nodes, 'LAYLA')).toEqual(['e2']);
    expect(findMatches(nodes, 'sara title')).toEqual(['e3']);
  });

  it('returns nothing for a blank search', () => {
    expect(findMatches(nodes, '   ')).toEqual([]);
  });

  it('finds people deep in the tree', () => {
    expect(findMatches(nodes, 'omar')).toEqual(['e4']);
    expect(flatten(nodes)).toHaveLength(4);
  });
});
