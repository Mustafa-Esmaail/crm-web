'use client';

import { Card, Skeleton } from '@crm/ui';
import { UsersRound } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Link } from '@/lib/i18n/navigation';
import { StatusBadge } from '@/shared/components/display/status-badge';
import { UserAvatar } from '@/shared/components/display/user-avatar';
import { EmptyState } from '@/shared/components/feedback/empty-state';
import { ErrorState } from '@/shared/components/feedback/error-state';

import { useSubordinatesQuery } from '../../hooks/use-employee-queries';

/** Everyone below this person in the reporting line, direct and indirect. */
export function SubordinatesTab({ employeeId }: { employeeId: number }) {
  const t = useTranslations('employees.profile.subordinates');
  const query = useSubordinatesQuery(employeeId);

  if (query.isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-14" />
        ))}
      </div>
    );
  }
  if (query.error) return <ErrorState error={query.error} onRetry={() => void query.refetch()} />;

  const people = query.data ?? [];
  if (people.length === 0) {
    return (
      <Card>
        <EmptyState icon={UsersRound} title={t('emptyTitle')} description={t('emptyDescription')} />
      </Card>
    );
  }

  return (
    <Card className="gap-0 py-0">
      <p className="text-small text-muted-foreground border-b px-5 py-3">
        {t('count', { count: people.length })}
      </p>
      <ul className="divide-y">
        {people.map((person) => (
          <li key={person.id} className="flex items-center gap-3 px-5 py-3">
            <UserAvatar id={person.id} name={person.name} size="md" />
            <div className="min-w-0 flex-1">
              <Link
                href={`/organization/employees/${person.id}`}
                className="text-foreground hover:text-primary block truncate font-semibold"
              >
                {person.name}
              </Link>
              <p className="text-caption text-muted-foreground truncate">
                {[person.job_title, person.department?.name].filter(Boolean).join(' · ')}
              </p>
            </div>
            <StatusBadge status={person.status} />
          </li>
        ))}
      </ul>
    </Card>
  );
}
