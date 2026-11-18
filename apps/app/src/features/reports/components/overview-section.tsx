'use client';

import {
  CircleCheck,
  Clock,
  Handshake,
  ListChecks,
  Percent,
  PhoneCall,
  Target,
  TriangleAlert,
} from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { Amount } from '@/shared/components/display/amount';
import { ErrorState } from '@/shared/components/feedback/error-state';

import { type ReportFilters, useOverview } from '../hooks/use-overview';
import { formatHours } from '../utils';
import { BarList } from './bar-list';
import { Delta, ReportKpi, ReportSection } from './report-kpi';
import { TrendChart } from './trend-chart';

/** Company (or filtered) headline numbers: leads, deals, tasks, activity and the lead trend. */
export function OverviewSection({ filters }: { filters: ReportFilters }) {
  const t = useTranslations('reports');
  const locale = useLocale();
  const query = useOverview(filters, true);
  const data = query.data;
  const previous = data?.previous;
  const loading = query.isLoading;

  if (query.error) return <ErrorState error={query.error} onRetry={() => void query.refetch()} />;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <ReportKpi
          label={t('kpi.leads')}
          value={data?.leads.summary.total}
          subLabel={t('kpi.leadsOpen', { count: data?.leads.summary.open ?? 0 })}
          icon={Target}
          isLoading={loading}
          delta={
            data && <Delta current={data.leads.summary.total} previous={previous?.leads.total} />
          }
        />
        <ReportKpi
          label={t('kpi.conversion')}
          value={data ? `${data.leads.summary.conversion_rate}%` : undefined}
          subLabel={t('kpi.leadsWon', { count: data?.leads.summary.won ?? 0 })}
          icon={Percent}
          tone="success"
          isLoading={loading}
          delta={
            data && (
              <Delta
                current={data.leads.summary.conversion_rate}
                previous={previous?.leads.conversion_rate}
              />
            )
          }
        />
        <ReportKpi
          label={t('kpi.dealsWon')}
          value={data?.deals.won}
          subLabel={t('kpi.dealsSummary', {
            open: data?.deals.open ?? 0,
            lost: data?.deals.lost ?? 0,
          })}
          icon={CircleCheck}
          tone="info"
          isLoading={loading}
          delta={data && <Delta current={data.deals.won} previous={previous?.deals.won} />}
        />
        <ReportKpi
          label={t('kpi.wonValue')}
          value={data ? <Amount value={data.deals.won_value} /> : undefined}
          subLabel={
            data && (
              <>
                {t('kpi.pipelineValue')}: <Amount value={data.deals.open_value} />
              </>
            )
          }
          icon={Handshake}
          tone="accent"
          isLoading={loading}
          delta={
            data && (
              <Delta
                current={Number(data.deals.won_value)}
                previous={previous ? Number(previous.deals.won_value) : null}
              />
            )
          }
        />
        <ReportKpi
          label={t('kpi.activities')}
          value={data?.activities.total}
          subLabel={t('kpi.calls', { count: data?.activities.by_type.call ?? 0 })}
          icon={PhoneCall}
          isLoading={loading}
          delta={
            data && <Delta current={data.activities.total} previous={previous?.activities.total} />
          }
        />
        <ReportKpi
          label={t('kpi.firstResponse')}
          value={
            data
              ? formatHours(
                  data.leads.first_response.avg_hours,
                  (key, values) => t(`time.${key}`, values),
                  locale,
                )
              : undefined
          }
          subLabel={
            data &&
            t('kpi.responded', {
              responded: data.leads.first_response.responded,
              total: data.leads.first_response.leads,
            })
          }
          icon={Clock}
          tone="info"
          isLoading={loading}
        />
        <ReportKpi
          label={t('kpi.staleLeads')}
          value={data?.leads.stale}
          subLabel={
            data &&
            t('kpi.staleOf', { open: data.leads.open_now, days: data.leads.stale_after_days })
          }
          icon={TriangleAlert}
          tone="warning"
          isLoading={loading}
        />
        <ReportKpi
          label={t('kpi.tasksCompleted')}
          value={data?.tasks.completed}
          subLabel={
            data &&
            t('kpi.tasksDetail', { onTime: data.tasks.on_time_rate, overdue: data.tasks.overdue })
          }
          icon={ListChecks}
          tone="success"
          isLoading={loading}
          delta={
            data && <Delta current={data.tasks.completed} previous={previous?.tasks.completed} />
          }
        />
      </div>

      <ReportSection title={t('charts.newLeads')}>
        <TrendChart
          label={t('charts.newLeads')}
          points={data?.leads.per_day ?? []}
          from={data?.period.from}
          to={data?.period.to}
          emptyLabel={t('empty')}
        />
      </ReportSection>

      <div className="grid gap-4 lg:grid-cols-2">
        <ReportSection title={t('charts.byStage')}>
          <BarList
            emptyLabel={t('empty')}
            rows={(data?.leads.by_stage ?? []).map((row) => ({
              key: String(row.stage_id),
              label: row.name ?? row.key,
              count: row.count,
            }))}
          />
        </ReportSection>
        <ReportSection title={t('charts.bySource')}>
          <BarList
            emptyLabel={t('empty')}
            rows={(data?.leads.by_source ?? []).map((row) => ({
              key: String(row.source_id ?? 'none'),
              label: row.name ?? t('noSource'),
              count: row.count,
            }))}
          />
        </ReportSection>
      </div>
    </div>
  );
}
