'use client';

import { Link } from '@/lib/i18n/navigation';

import { useLeadName } from '../hooks/use-lead-options';

/**
 * A lead referenced only by id (an appointment's `lead_id`), shown by name and linked to its page.
 * Until the name loads, or when the viewer may not see that lead, it reads "#id".
 */
export function LeadLink({ id }: { id: number }) {
  const name = useLeadName(id);

  return (
    <Link href={`/leads/${id}`} className="text-primary block truncate hover:underline">
      {name ?? `#${id}`}
    </Link>
  );
}
