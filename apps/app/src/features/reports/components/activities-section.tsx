'use client';

import { Skeleton, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@crm/ui';
import { useTranslations } from 'next-intl';

import { Link } from '@/lib/i18n/navigation';
import { UserAvatar } from '@/shared/components/display/user-avatar';
import { ErrorState } from '@/shared/components/feedback/error-state';

import { type ReportFilters, useActivities } from '../hooks/use-overview';
import { BarList } from './bar-list';
import { ReportSection } from './report-kpi';
import { TrendChart } from './trend-chart';

export const ACTIVITY_TYPES = ['call', 'meeting', 'whatsapp', 'email', 'note'] as const;

/** Calls, meetings, messages and notes people logged on leads, per day and per employee. */
export function ActivitiesSection({ filters }: { filters: ReportFilters }) {
  const t = useTranslations('reports');
  const query = useActivities(filters, true);
  const data = query.data;

  if (query.error) return <ErrorState error={query.error} onRetry={() => void query.refetch()} />;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-3">
        <ReportSection title={t('activities.perDay')} className="lg:col-span-2">
          <TrendChart
            label={t('activities.perDay')}
            points={(data?.per_day ?? []).map((day) => ({ date: day.date, count: day.total }))}
            from={data?.period.from}
            to={data?.period.to}
            emptyLabel={t('activities.empty')}
          />
        </ReportSection>
        <ReportSection title={t('activities.byType')}>
          <BarList
            emptyLabel={t('activities.empty')}
            rows={ACTIVITY_TYPES.map((type) => ({
              key: type,
              label: t(`activityTypes.${type}`),
              count: data?.totals.by_type[type] ?? 0,
            }))}
          />
        </ReportSection>
      </div>

      <ReportSection title={t('activities.byEmployee')} className="gap-3 px-0 pb-2">
        {query.isLoading ? (
          <div className="px-5">
            <Skeleton className="h-9 w-full" />
          </div>
        ) : (data?.by_employee ?? []).length === 0 ? (
          <p className="text-small text-muted-foreground px-5">{t('activities.empty')}</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="ps-5">{t('agents.columns.employee')}</TableHead>
                  {ACTIVITY_TYPES.map((type) => (
                    <TableHead key={type} className="text-end">
                      {t(`activityTypes.${type}`)}
                    </TableHead>
                  ))}
                  <TableHead className="pe-5 text-end">{t('activities.total')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(data?.by_employee ?? []).map((row) => {
                  const name = row.name ?? t('agents.unknown', { id: row.employee_id });
                  return (
                    <TableRow key={row.employee_id}>
                      <TableCell className="ps-5">
                        <Link
                          href={`/reports/employees/${row.employee_id}`}
                          className="flex items-center gap-2 hover:underline"
                        >
                          <UserAvatar id={row.employee_id} name={name} size="sm" />
                          <span className="truncate font-medium">{name}</span>
                        </Link>
                      </TableCell>
                      {ACTIVITY_TYPES.map((type) => (
                        <TableCell key={type} className="num text-end">
                          {row.by_type[type] ?? 0}
                        </TableCell>
                      ))}
                      <TableCell className="num pe-5 text-end font-semibold">{row.total}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </ReportSection>
    </div>
  );
}
