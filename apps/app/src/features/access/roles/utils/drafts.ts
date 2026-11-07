import type { FieldRow, PermissionModule, ScopeRow } from '../types';

/** Permission keys the role currently holds, across every module. */
export function grantedKeys(modules: PermissionModule[]): Set<string> {
  return new Set(
    modules.flatMap((module) =>
      module.permissions.filter((permission) => permission.granted).map(({ key }) => key),
    ),
  );
}

export function togglePermission(granted: ReadonlySet<string>, key: string): Set<string> {
  const next = new Set(granted);
  if (!next.delete(key)) next.add(key);
  return next;
}

export type ModuleState = 'none' | 'some' | 'all';

export function moduleState(module: PermissionModule, granted: ReadonlySet<string>): ModuleState {
  const count = module.permissions.filter(({ key }) => granted.has(key)).length;
  if (count === 0) return 'none';
  return count === module.permissions.length ? 'all' : 'some';
}

/** Grants or revokes a whole module at once (the module's "select all" box). */
export function setModule(
  module: PermissionModule,
  granted: ReadonlySet<string>,
  isOn: boolean,
): Set<string> {
  const next = new Set(granted);
  for (const { key } of module.permissions) {
    if (isOn) next.add(key);
    else next.delete(key);
  }
  return next;
}

export function sameKeys(a: ReadonlySet<string>, b: ReadonlySet<string>): boolean {
  return a.size === b.size && [...a].every((key) => b.has(key));
}

/** `{ leads: 'team' }`, the shape the scopes endpoint both returns and accepts. */
export function scopesToDraft(rows: ScopeRow[]): Record<string, string> {
  return Object.fromEntries(rows.map(({ module, scope }) => [module, scope]));
}

/** `{ employees: { phone: 'hidden' } }`, the shape the field endpoint accepts. */
export function fieldsToDraft(rows: FieldRow[]): Record<string, Record<string, string>> {
  const draft: Record<string, Record<string, string>> = {};
  for (const { module, field, access } of rows) {
    draft[module] = { ...draft[module], [field]: access };
  }
  return draft;
}

/** Order-independent comparison for the plain-object drafts above. */
export function sameDraft(a: unknown, b: unknown): boolean {
  return JSON.stringify(sortKeys(a)) === JSON.stringify(sortKeys(b));
}

function sortKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortKeys);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, inner]) => [key, sortKeys(inner)]),
    );
  }
  return value;
}
