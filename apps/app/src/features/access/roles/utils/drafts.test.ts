import { describe, expect, it } from 'vitest';

import type { PermissionModule } from '../types';
import {
  fieldsToDraft,
  grantedKeys,
  moduleState,
  sameDraft,
  sameKeys,
  scopesToDraft,
  setModule,
  togglePermission,
} from './drafts';

const permission = (key: string, granted: boolean) => ({ key, action: key, label: key, granted });

const leads: PermissionModule = {
  module: 'leads',
  label: 'Leads',
  permissions: [permission('leads.view', true), permission('leads.create', false)],
};
const deals: PermissionModule = {
  module: 'deals',
  label: 'Deals',
  permissions: [permission('deals.view', false)],
};

describe('permission drafts', () => {
  it('collects only the granted keys', () => {
    expect([...grantedKeys([leads, deals])]).toEqual(['leads.view']);
  });

  it('toggles one key without touching the original set', () => {
    const before = new Set(['leads.view']);
    const added = togglePermission(before, 'leads.create');

    expect([...added].sort()).toEqual(['leads.create', 'leads.view']);
    expect([...togglePermission(added, 'leads.view')]).toEqual(['leads.create']);
    expect([...before]).toEqual(['leads.view']);
  });

  it('reports a module as none, some or all granted', () => {
    expect(moduleState(deals, new Set())).toBe('none');
    expect(moduleState(leads, new Set(['leads.view']))).toBe('some');
    expect(moduleState(leads, new Set(['leads.view', 'leads.create']))).toBe('all');
  });

  it('grants or revokes a whole module and leaves other modules alone', () => {
    const start = new Set(['deals.view']);

    expect([...setModule(leads, start, true)].sort()).toEqual([
      'deals.view',
      'leads.create',
      'leads.view',
    ]);
    expect([...setModule(deals, start, false)]).toEqual([]);
  });

  it('compares sets regardless of order', () => {
    expect(sameKeys(new Set(['a', 'b']), new Set(['b', 'a']))).toBe(true);
    expect(sameKeys(new Set(['a']), new Set(['a', 'b']))).toBe(false);
  });
});

describe('scope and field drafts', () => {
  it('turns scope rows into a module -> scope map', () => {
    const rows = [
      { module: 'leads', label: 'Leads', scope: 'team', scope_label: 'Their team' },
      { module: 'deals', label: 'Deals', scope: 'all', scope_label: 'All' },
    ];

    expect(scopesToDraft(rows)).toEqual({ leads: 'team', deals: 'all' });
  });

  it('groups field rows by module', () => {
    const rows = [
      { module: 'employees', field: 'phone', label: 'Phone', access: 'hidden' },
      { module: 'employees', field: 'email', label: 'Email', access: 'write' },
      { module: 'leads', field: 'budget', label: 'Budget', access: 'read' },
    ];

    expect(fieldsToDraft(rows)).toEqual({
      employees: { phone: 'hidden', email: 'write' },
      leads: { budget: 'read' },
    });
  });

  it('treats drafts with the same content as equal, however the keys are ordered', () => {
    expect(sameDraft({ a: { x: '1', y: '2' }, b: '3' }, { b: '3', a: { y: '2', x: '1' } })).toBe(
      true,
    );
    expect(sameDraft({ a: '1' }, { a: '2' })).toBe(false);
  });
});
