'use client';

import { canPerform } from '@crm/api-client';

import { useCurrentUser } from './use-current-user';

/** UI affordance only: hides what the user cannot do. The API still enforces every rule. */
export function useCan(permission: string): boolean {
  const { user } = useCurrentUser();
  return canPerform(user, permission);
}
