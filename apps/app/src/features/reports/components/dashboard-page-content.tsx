'use client';

import { Button } from '@crm/ui';
import { ChartColumnBig, UserRoundCheck } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { PERMISSIONS } from '@/config/permissions';
import { Link } from '@/lib/i18n/navigation';
import { PageHeader } from '@/shared/components/layout/page-header';
import { useCan } from '@/shared/hooks/use-can';

import type { ReportFilters } from '../hooks/use-overview';
import { OverviewSection } from './overview-section';
import { ReportFiltersBar } from './report-filters';
import { ScorecardView } from './scorecard-view';

/**
 * Home page. People who may read reports see the numbers of everything they can see; everyone
 * else sees their own scorecard, so nobody lands on an empty "no permission" page.
 */
export function DashboardPageContent() {
  const t = useTranslations('dashboard');
  const canView = useCan(PERMISSIONS.reportsView);
  const [filters, setFilters] = useState<ReportFilters>({ period: '30' });

  return (
    <>
      <PageHeader>
        <PageHeader.Heading>
          <PageHeader.Title>{t('title')}</PageHeader.Title>
          <PageHeader.Description>
            {canView ? t('description') : t('myDescription')}
          </PageHeader.Description>
        </PageHeader.Heading>
        <PageHeader.Actions>
          {canView && (
            <Button variant="outline" asChild>
              <Link href="/my-performance">
                <UserRoundCheck aria-hidden />
                {t('myPerformance')}
              </Link>
            </Button>
          )}
          {canView && (
            <Button asChild>
              <Link href="/reports">
                <ChartColumnBig aria-hidden />
                {t('allReports')}
              </Link>
            </Button>
          )}
        </PageHeader.Actions>
      </PageHeader>

      <ReportFiltersBar value={filters} onChange={setFilters} withPeople={false} />
      {canView ? (
        <OverviewSection filters={filters} />
      ) : (
        <ScorecardView employeeId={null} filters={filters} />
      )}
    </>
  );
}
