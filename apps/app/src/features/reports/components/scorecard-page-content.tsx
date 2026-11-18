'use client';

import { Button } from '@crm/ui';
import { UserRound } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { PERMISSIONS } from '@/config/permissions';
import { useEmployeeName } from '@/features/organization/employees';
import { Link } from '@/lib/i18n/navigation';
import { NoPermission } from '@/shared/components/feedback/no-permission';
import { PageHeader } from '@/shared/components/layout/page-header';
import { useCan } from '@/shared/hooks/use-can';

import type { ReportFilters } from '../hooks/use-overview';
import { ReportFiltersBar } from './report-filters';
import { ScorecardView } from './scorecard-view';

/** A manager's view of one employee's performance. */
export function EmployeeReportPageContent({ employeeId }: { employeeId: number }) {
  const t = useTranslations('reports.scorecard');
  const canView = useCan(PERMISSIONS.reportsView);
  const name = useEmployeeName(String(employeeId));
  const [filters, setFilters] = useState<ReportFilters>({ period: '30' });

  return (
    <>
      <PageHeader>
        <PageHeader.Heading>
          <PageHeader.Title>{name ? t('employeeTitle', { name }) : t('title')}</PageHeader.Title>
          <PageHeader.Description>{t('employeeDescription')}</PageHeader.Description>
        </PageHeader.Heading>
        <PageHeader.Actions>
          <Button variant="outline" asChild>
            <Link href={`/organization/employees/${employeeId}`}>
              <UserRound aria-hidden />
              {t('profile')}
            </Link>
          </Button>
        </PageHeader.Actions>
      </PageHeader>
      {canView ? (
        <>
          <ReportFiltersBar value={filters} onChange={setFilters} withPeople={false} />
          <ScorecardView employeeId={employeeId} filters={filters} />
        </>
      ) : (
        <NoPermission />
      )}
    </>
  );
}

/** Every user's own performance; needs no permission. */
export function MyPerformancePageContent() {
  const t = useTranslations('reports.scorecard');
  const [filters, setFilters] = useState<ReportFilters>({ period: '30' });

  return (
    <>
      <PageHeader>
        <PageHeader.Heading>
          <PageHeader.Title>{t('myTitle')}</PageHeader.Title>
          <PageHeader.Description>{t('myDescription')}</PageHeader.Description>
        </PageHeader.Heading>
      </PageHeader>
      <ReportFiltersBar value={filters} onChange={setFilters} withPeople={false} />
      <ScorecardView employeeId={null} filters={filters} />
    </>
  );
}
