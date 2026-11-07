export const AUDIT_FILTER_IDS = ['action', 'module', 'user_id', 'from', 'to'] as const;

export const AUDIT_DEFAULT_PAGE_SIZE = 15;

// The API has no endpoint listing these, so they mirror what it writes today.
export const AUDIT_ACTIONS = [
  'created',
  'updated',
  'deleted',
  'login',
  'logout',
  'suspended',
  'activated',
  'offboarded',
] as const;

export const AUDIT_MODULES = [
  'employees',
  'branches',
  'departments',
  'teams',
  'leads',
  'deals',
  'deal_settings',
  'real_estate',
] as const;

/** Registry: tone per action; an unknown action falls back to neutral. */
export const AUDIT_ACTION_TONES: Record<string, string> = {
  created: 'bg-success-soft text-success',
  updated: 'bg-info-soft text-info',
  deleted: 'bg-destructive-soft text-destructive',
  login: 'bg-success-soft text-success',
  logout: 'bg-muted text-muted-foreground',
  suspended: 'bg-warning-soft text-warning',
  activated: 'bg-success-soft text-success',
  offboarded: 'bg-destructive-soft text-destructive',
};
export const AUDIT_FALLBACK_TONE = 'bg-muted text-muted-foreground';
