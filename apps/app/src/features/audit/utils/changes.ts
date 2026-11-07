import type { AuditLog } from '../types';

export interface AuditChange {
  field: string;
  oldValue: unknown;
  newValue: unknown;
}

// Bookkeeping columns that change on every write; showing them would bury the real edit.
const IGNORED_FIELDS = new Set(['id', 'tenant_id', 'created_at', 'updated_at', 'deleted_at']);

/** The attributes an entry actually changed, as old -> new pairs. */
export function getChanges(log: Pick<AuditLog, 'old_values' | 'new_values'>): AuditChange[] {
  const oldValues = log.old_values ?? {};
  const newValues = log.new_values ?? {};
  const fields = new Set([...Object.keys(oldValues), ...Object.keys(newValues)]);

  return [...fields]
    .filter((field) => !IGNORED_FIELDS.has(field))
    .filter((field) => JSON.stringify(oldValues[field]) !== JSON.stringify(newValues[field]))
    .map((field) => ({ field, oldValue: oldValues[field], newValue: newValues[field] }));
}
