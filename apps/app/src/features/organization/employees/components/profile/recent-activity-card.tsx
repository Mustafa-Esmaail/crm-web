'use client';

import { Button, Card, CardContent, CardHeader, CardTitle, Skeleton } from '@crm/ui';
import { useTranslations } from 'next-intl';

import { AUDITABLE_TYPE, useAuditLogsQuery } from '@/features/audit';
import { EmptyState } from '@/shared/components/feedback/empty-state';
import { ErrorState } from '@/shared/components/feedback/error-state';

import { useAuditValueResolver } from '../../hooks/use-audit-value-resolver';
import { ActivityItem } from './activity-item';

const RECENT_COUNT = 5;

interface RecentActivityCardProps {
  employeeId: number;
  /** Switches the page to the full activity tab. */
  onViewAll: () => void;
}

export function RecentActivityCard({ employeeId, onViewAll }: RecentActivityCardProps) {
  const t = useTranslations('employees.profile.activity');
  const resolve = useAuditValueResolver();
  const query = useAuditLogsQuery({
    auditableType: AUDITABLE_TYPE.employee,
    auditableId: employeeId,
    perPage: RECENT_COUNT,
  });

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>{t('recentTitle')}</CardTitle>
        <Button variant="link" size="sm" className="h-auto p-0" onClick={onViewAll}>
          {t('viewAll')}
        </Button>
      </CardHeader>
      <CardContent>
        {query.isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }, (_, index) => (
              <Skeleton key={index} className="h-14" />
            ))}
          </div>
        ) : query.error ? (
          <ErrorState error={query.error} onRetry={() => void query.refetch()} />
        ) : (query.data?.data.length ?? 0) === 0 ? (
          <EmptyState title={t('empty')} className="py-8" />
        ) : (
          <ul className="divide-y">
            {query.data?.data.map((log) => (
              <ActivityItem key={log.id} log={log} formatValue={resolve} />
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
