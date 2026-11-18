'use client';

import { CalendarClock, Coins, Percent, Trophy } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { Amount } from '@/shared/components/display/amount';
import { ErrorState } from '@/shared/components/feedback/error-state';

import { type ReportFilters, useSales } from '../hooks/use-overview';
import { BarList } from './bar-list';
import { ReportKpi, ReportSection } from './report-kpi';

const FORECAST_BUCKETS = ['overdue', 'next_30', 'next_60', 'next_90', 'later', 'no_date'] as const;

/** Pipeline by stage, revenue per month, forecast of open deals, and why business was lost. */
export function SalesSection({ filters }: { filters: ReportFilters }) {
  const t = useTranslations('reports');
  const locale = useLocale();
  const query = useSales(filters, true);
  const data = query.data;
  const loading = query.isLoading;

  if (query.error) return <ErrorState error={query.error} onRetry={() => void query.refetch()} />;

  const months = data?.revenue.per_month ?? [];
  const maxMonth = Math.max(1, ...months.map((month) => Number(month.value)));
  const monthFormat = new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <ReportKpi
          label={t('sales.revenue')}
          value={data ? <Amount value={data.revenue.won_value} /> : undefined}
          subLabel={data && t('sales.wonDeals', { count: data.revenue.won_count })}
          icon={Coins}
          tone="success"
          isLoading={loading}
        />
        <ReportKpi
          label={t('sales.winRate')}
          value={data ? `${data.revenue.win_rate}%` : undefined}
          subLabel={t('sales.winRateHint')}
          icon={Percent}
          isLoading={loading}
        />
        <ReportKpi
          label={t('sales.avgDeal')}
          value={data ? <Amount value={data.revenue.avg_deal_value} /> : undefined}
          icon={Trophy}
          tone="accent"
          isLoading={loading}
        />
        <ReportKpi
          label={t('sales.cycle')}
          value={
            data?.revenue.avg_cycle_days == null
              ? data && '—'
              : t('time.days', {
                  count: new Intl.NumberFormat(locale).format(data.revenue.avg_cycle_days),
                })
          }
          subLabel={t('sales.cycleHint')}
          icon={CalendarClock}
          tone="info"
          isLoading={loading}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ReportSection title={t('sales.pipeline')} description={t('sales.pipelineHint')}>
          <BarList
            emptyLabel={t('empty')}
            rows={(data?.by_stage ?? []).map((row) => ({
              key: String(row.stage_id),
              label: row.name ?? row.key,
              count: row.count,
              detail: <Amount value={row.value} />,
            }))}
          />
        </ReportSection>

        <ReportSection
          title={t('sales.revenueByMonth')}
          description={t('sales.revenueByMonthHint')}
        >
          {months.length === 0 ? (
            <p className="text-small text-text-faint">{t('empty')}</p>
          ) : (
            <ul className="space-y-3">
              {months.map((month) => (
                <li key={month.month} className="space-y-1">
                  <div className="text-small flex items-center justify-between gap-3">
                    <span>{monthFormat.format(new Date(`${month.month}-01T00:00:00`))}</span>
                    <span className="flex items-center gap-2">
                      <span className="text-caption text-muted-foreground">
                        {t('sales.wonDeals', { count: month.count })}
                      </span>
                      <span className="font-medium">
                        <Amount value={month.value} />
                      </span>
                    </span>
                  </div>
                  <div className="bg-muted h-2 overflow-hidden rounded-full">
                    <div
                      className="bg-success h-full rounded-full"
                      style={{ width: `${(Number(month.value) / maxMonth) * 100}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </ReportSection>
      </div>

      <ReportSection title={t('sales.forecast')} description={t('sales.forecastHint')}>
        <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-6">
          {FORECAST_BUCKETS.map((bucket) => {
            const row = data?.forecast[bucket];
            return (
              <div
                key={bucket}
                className={
                  bucket === 'overdue' && (row?.count ?? 0) > 0
                    ? 'border-warning bg-warning-soft rounded-md border p-3'
                    : 'border-border rounded-md border p-3'
                }
              >
                <p className="text-caption text-muted-foreground">{t(`sales.buckets.${bucket}`)}</p>
                <p className="num text-lg font-bold">{row?.count ?? 0}</p>
                <p className="text-small">
                  <Amount value={row?.value ?? 0} />
                </p>
              </div>
            );
          })}
        </div>
      </ReportSection>

      <div className="grid gap-4 lg:grid-cols-2">
        <ReportSection title={t('sales.lostLeads')}>
          <BarList
            emptyLabel={t('sales.noLosses')}
            rows={(data?.lost_reasons.leads ?? []).map((row, index) => ({
              key: `${index}`,
              label: row.reason ?? t('sales.noReason'),
              count: row.count,
            }))}
          />
        </ReportSection>
        <ReportSection title={t('sales.lostDeals')}>
          <BarList
            emptyLabel={t('sales.noLosses')}
            rows={(data?.lost_reasons.deals ?? []).map((row, index) => ({
              key: `${index}`,
              label: row.reason ?? t('sales.noReason'),
              count: row.count,
              detail: <Amount value={row.value} />,
            }))}
          />
        </ReportSection>
      </div>
    </div>
  );
}
