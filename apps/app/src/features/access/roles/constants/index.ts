export const roleKeys = {
  all: ['roles'] as const,
  list: () => [...roleKeys.all, 'list'] as const,
  detail: (id: number) => [...roleKeys.all, 'detail', id] as const,
  // Labels come back translated, so what is cached depends on the language.
  employee: (employeeId: number) => [...roleKeys.all, 'employee', employeeId] as const,
  catalog: (locale: string) => [...roleKeys.all, 'catalog', locale] as const,
  matrix: (id: number, locale: string) => [...roleKeys.all, id, 'matrix', locale] as const,
  scopes: (id: number, locale: string) => [...roleKeys.all, id, 'scopes', locale] as const,
  fields: (id: number, locale: string) => [...roleKeys.all, id, 'fields', locale] as const,
};

/** The built-in role every company starts with; it always holds every permission. */
export const OWNER_ROLE_KEY = 'owner';

export const ROLE_EDITOR_TABS = ['permissions', 'scopes', 'fields'] as const;
export type RoleEditorTab = (typeof ROLE_EDITOR_TABS)[number];

/** Same shape the API's `key` rule enforces: starts with a letter, then lowercase, digits, `_`. */
export const ROLE_KEY_PATTERN = /^[a-z][a-z0-9_]*$/;
