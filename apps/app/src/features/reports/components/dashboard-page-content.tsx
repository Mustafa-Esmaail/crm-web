'use client';

import { Card, Tabs, TabsList, TabsTrigger } from '@crm/ui';
import { CircleCheck, Handshake, Percent, Target } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { PERMISSIONS } from '@/config/permissions';
import { Amount } from '@/shared/components/display/amount';
import { StatCard } from '@/shared/components/display/stat-card';
import { ErrorState } from '@/shared/components/feedback/error-state';
import { NoPermission } from '@/shared/components/feedback/no-permission';
import { PageHeader } from '@/shared/components/layout/page-header';
import { useCan } from '@/shared/hooks/use-can';

import { type Period, PERIODS, useOverview } from '../hooks/use-overview';
import { AgentPerformanceCard } from './agent-performance-card';
import { BarList } from './bar-list';

export function DashboardPageContent() {
  const t = useTranslations('dashboard');
  const canView = useCan(PERMISSIONS.reportsView);
  const [period, setPeriod] = useState<Period>('30');
  const query = useOverview(period, canView);
  const data = query.data;
  const loading = query.isLoading;

  const header = (
    <PageHeader>
      <PageHeader.Heading>
        <PageHeader.Title>{t('title')}</PageHeader.Title>
        <PageHeader.Description>{t('description')}</PageHeader.Description>
      </PageHeader.Heading>
      {canView && (
        <PageHeader.Actions>
          <Tabs value={period} onValueChange={(value) => setPeriod(value as Period)}>
            <TabsList>
              {PERIODS.map((value) => (
                <TabsTrigger key={value} value={value}>
                  {t(`periods.${value}`)}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </PageHeader.Actions>
      )}
    </PageHeader>
  );

  if (!canView) {
    return (
      <>
        {header}
        <NoPermission />
      </>
    );
  }
  if (query.error) {
    return (
      <>
        {header}
        <ErrorState error={query.error} onRetry={() => void query.refetch()} />
      </>
    );
  }

  return (
    <>
      {header}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label={t('kpi.leads')}
          value={data?.leads.summary.total}
          subLabel={t('kpi.leadsOpen', { count: data?.leads.summary.open ?? 0 })}
          icon={Target}
          isLoading={loading}
        />
        <StatCard
          label={t('kpi.conversion')}
          value={data ? `${data.leads.summary.conversion_rate}%` : undefined}
          subLabel={t('kpi.leadsWon', { count: data?.leads.summary.won ?? 0 })}
          icon={Percent}
          tone="success"
          isLoading={loading}
        />
        <StatCard
          label={t('kpi.deals')}
          value={data?.deals.total}
          subLabel={t('kpi.dealsOpen', { count: data?.deals.open ?? 0 })}
          icon={Handshake}
          tone="info"
          isLoading={loading}
        />
        <StatCard
          label={t('kpi.dealsWon')}
          value={data?.deals.won}
          subLabel={t('kpi.dealsLost', { count: data?.deals.lost ?? 0 })}
          icon={CircleCheck}
          tone="success"
          isLoading={loading}
        />
      </div>

      {data && (
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <Card className="space-y-1 p-5">
            <p className="text-small text-muted-foreground">{t('kpi.pipelineValue')}</p>
            <p className="text-2xl font-bold">
              <Amount value={data.deals.open_value} />
            </p>
          </Card>
          <Card className="space-y-1 p-5">
            <p className="text-small text-muted-foreground">{t('kpi.wonValue')}</p>
            <p className="text-2xl font-bold">
              <Amount value={data.deals.won_value} />
            </p>
          </Card>
          <Card className="space-y-1 p-5">
            <p className="text-small text-muted-foreground">{t('kpi.commission')}</p>
            <p className="text-2xl font-bold">
              <Amount value={data.deals.commission} />
            </p>
          </Card>
        </div>
      )}

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card className="space-y-4 p-5">
          <h2 className="font-semibold">{t('byStage')}</h2>
          <BarList
            emptyLabel={t('empty')}
            rows={(data?.leads.by_stage ?? []).map((row) => ({
              key: String(row.stage_id),
              label: row.name ?? row.key,
              count: row.count,
            }))}
          />
        </Card>
        <Card className="space-y-4 p-5">
          <h2 className="font-semibold">{t('bySource')}</h2>
          <BarList
            emptyLabel={t('empty')}
            rows={(data?.leads.by_source ?? []).map((row) => ({
              key: String(row.source_id ?? 'none'),
              label: row.name ?? t('noSource'),
              count: row.count,
            }))}
          />
        </Card>
      </div>

      <AgentPerformanceCard period={period} />
    </>
  );
}
