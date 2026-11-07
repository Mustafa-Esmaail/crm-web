'use client';

import { Button, Skeleton, Tabs, TabsList, TabsTrigger } from '@crm/ui';
import { Download, Network } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { parseAsStringLiteral, useQueryState } from 'nuqs';
import { useMemo } from 'react';

import { useDepartmentTreeQuery } from '@/features/organization/departments';
import { EmptyState } from '@/shared/components/feedback/empty-state';
import { ErrorState } from '@/shared/components/feedback/error-state';
import { PageHeader } from '@/shared/components/layout/page-header';

import { useOrgChartQuery } from '../hooks/use-org-chart-query';
import { CHART_MODES } from '../types/chart';
import { flatten, fromDepartments, fromOrgChart } from '../utils/adapters';
import { ChartCanvas } from './chart-canvas';

export function OrgChartPageContent() {
  const t = useTranslations('orgChart');
  const tNav = useTranslations('nav');
  const [mode, setMode] = useQueryState(
    'mode',
    parseAsStringLiteral(CHART_MODES).withDefault('manager').withOptions({ history: 'replace' }),
  );
  const people = useOrgChartQuery();
  const departments = useDepartmentTreeQuery();
  const query = mode === 'manager' ? people : departments;

  const roots = useMemo(() => {
    if (mode === 'manager') return fromOrgChart(people.data ?? []);
    return fromDepartments(departments.data ?? []);
  }, [mode, people.data, departments.data]);

  const peopleCount = useMemo(() => flatten(fromOrgChart(people.data ?? [])).length, [people.data]);

  return (
    <>
      <PageHeader>
        <PageHeader.Heading>
          <PageHeader.Breadcrumbs
            items={[
              { label: tNav('items.home'), href: '/' },
              { label: tNav('sections.organization') },
              { label: t('title') },
            ]}
          />
          <PageHeader.Title>{t('title')}</PageHeader.Title>
          <PageHeader.Description>
            {t('description', { count: peopleCount })}
          </PageHeader.Description>
        </PageHeader.Heading>
        <PageHeader.Actions>
          <Tabs value={mode} onValueChange={(value) => void setMode(value as typeof mode)}>
            <TabsList>
              {CHART_MODES.map((value) => (
                <TabsTrigger key={value} value={value}>
                  {t(`modes.${value}`)}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <Button variant="outline" onClick={() => window.print()}>
            <Download className="size-4" aria-hidden />
            {t('export')}
          </Button>
        </PageHeader.Actions>
      </PageHeader>

      {query.isPending ? (
        <Skeleton className="h-[640px] w-full rounded-xl" />
      ) : query.isError ? (
        <ErrorState error={query.error} onRetry={() => void query.refetch()} />
      ) : roots.length === 0 ? (
        <EmptyState icon={Network} title={t('empty.title')} description={t('empty.description')} />
      ) : (
        <ChartCanvas key={mode} roots={roots} />
      )}
    </>
  );
}
