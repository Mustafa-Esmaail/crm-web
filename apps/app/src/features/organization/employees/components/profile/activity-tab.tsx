'use client';

import { Card, Skeleton } from '@crm/ui';
import { History } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { AUDITABLE_TYPE, useAuditLogsQuery } from '@/features/audit';
import { DataTablePagination } from '@/shared/components/data-table/data-table-pagination';
import { EmptyState } from '@/shared/components/feedback/empty-state';
import { ErrorState } from '@/shared/components/feedback/error-state';

import { useAuditValueResolver } from '../../hooks/use-audit-value-resolver';
import { ActivityItem } from './activity-item';

const DEFAULT_PER_PAGE = 15;

/** The full activity trail for one employee, paged. */
export function ActivityTab({ employeeId }: { employeeId: number }) {
  const t = useTranslations('employees.profile.activity');
  const resolve = useAuditValueResolver();
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(DEFAULT_PER_PAGE);
  const query = useAuditLogsQuery({
    auditableType: AUDITABLE_TYPE.employee,
    auditableId: employeeId,
    page,
    perPage,
  });

  if (query.isLoading) return <Skeleton className="h-72 rounded-lg" />;
  if (query.error) return <ErrorState error={query.error} onRetry={() => void query.refetch()} />;

  const logs = query.data?.data ?? [];
  if (logs.length === 0) {
    return (
      <Card>
        <EmptyState icon={History} title={t('empty')} />
      </Card>
    );
  }

  return (
    <Card className="gap-0 overflow-hidden py-0">
      <ul className="divide-y px-5">
        {logs.map((log) => (
          <ActivityItem key={log.id} log={log} formatValue={resolve} />
        ))}
      </ul>
      <DataTablePagination
        meta={query.data?.meta}
        onPageChange={setPage}
        onPerPageChange={(next) => {
          setPerPage(next);
          setPage(1);
        }}
      />
    </Card>
  );
}
