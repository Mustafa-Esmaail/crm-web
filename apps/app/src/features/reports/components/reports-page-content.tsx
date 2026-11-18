'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@crm/ui';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { PERMISSIONS } from '@/config/permissions';
import { NoPermission } from '@/shared/components/feedback/no-permission';
import { PageHeader } from '@/shared/components/layout/page-header';
import { useCan } from '@/shared/hooks/use-can';

import type { ReportFilters } from '../hooks/use-overview';
import { ActivitiesSection } from './activities-section';
import { OverviewSection } from './overview-section';
import { ReportFiltersBar } from './report-filters';
import { SalesSection } from './sales-section';
import { TeamPerformanceSection } from './team-performance-section';

const TABS = ['overview', 'sales', 'team', 'activities'] as const;
type Tab = (typeof TABS)[number];

/** Every report behind one filter row: period, employee and team apply to all tabs. */
export function ReportsPageContent() {
  const t = useTranslations('reports');
  const canView = useCan(PERMISSIONS.reportsView);
  const [tab, setTab] = useState<Tab>('overview');
  const [filters, setFilters] = useState<ReportFilters>({ period: '30' });

  return (
    <>
      <PageHeader>
        <PageHeader.Heading>
          <PageHeader.Title>{t('title')}</PageHeader.Title>
          <PageHeader.Description>{t('description')}</PageHeader.Description>
        </PageHeader.Heading>
      </PageHeader>

      {!canView ? (
        <NoPermission />
      ) : (
        <Tabs value={tab} onValueChange={(value) => setTab(value as Tab)}>
          <TabsList className="mb-3">
            {TABS.map((value) => (
              <TabsTrigger key={value} value={value}>
                {t(`tabs.${value}`)}
              </TabsTrigger>
            ))}
          </TabsList>
          <ReportFiltersBar value={filters} onChange={setFilters} />
          <TabsContent value="overview">
            <OverviewSection filters={filters} />
          </TabsContent>
          <TabsContent value="sales">
            <SalesSection filters={filters} />
          </TabsContent>
          <TabsContent value="team">
            <TeamPerformanceSection filters={filters} />
          </TabsContent>
          <TabsContent value="activities">
            <ActivitiesSection filters={filters} />
          </TabsContent>
        </Tabs>
      )}
    </>
  );
}
