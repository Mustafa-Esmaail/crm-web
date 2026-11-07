'use client';

import type { Industry } from '@/config/industries';

import { useCurrentUser } from './use-current-user';

/**
 * Whether the signed-in company works in this industry. Pack endpoints refuse every other
 * industry (owners included, who otherwise hold every permission), so pack screens check this too.
 */
export function useHasIndustry(industry: Industry): boolean {
  const { user } = useCurrentUser();
  return user?.tenant?.industry === industry;
}
