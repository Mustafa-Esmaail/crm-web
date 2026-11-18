'use client';

import {
  Button,
  cn,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@crm/ui';
import { ArrowDown, ArrowUp, ChevronLeft, Download } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';

import { Link } from '@/lib/i18n/navigation';
import { Amount } from '@/shared/components/display/amount';
import { UserAvatar } from '@/shared/components/display/user-avatar';
import { ErrorState } from '@/shared/components/feedback/error-state';

import { type ReportFilters, useAgentPerformance, useTeamsReport } from '../hooks/use-overview';
import type { AgentPerformanceRow } from '../types';
import { downloadCsv, formatHours } from '../utils';
import { ReportSection } from './report-kpi';

type SortKey = Exclude<keyof AgentPerformanceRow, 'employee_id' | 'name'>;

const COLUMNS: {
  key: SortKey;
  kind: 'number' | 'money' | 'percent' | 'hours';
  lowerIsBetter?: boolean;
}[] = [
  { key: 'leads', kind: 'number' },
  { key: 'conversion_rate', kind: 'percent' },
  { key: 'deals_won', kind: 'number' },
  { key: 'won_value', kind: 'money' },
  { key: 'commission', kind: 'money' },
  { key: 'activities', kind: 'number' },
  { key: 'calls', kind: 'number' },
  { key: 'meetings', kind: 'number' },
  { key: 'avg_first_response_hours', kind: 'hours', lowerIsBetter: true },
  { key: 'open_leads', kind: 'number' },
  { key: 'stale_leads', kind: 'number', lowerIsBetter: true },
  { key: 'tasks_completed', kind: 'number' },
  { key: 'tasks_overdue', kind: 'number', lowerIsBetter: true },
  { key: 'tasks_on_time_rate', kind: 'percent' },
];

function sortValue(row: AgentPerformanceRow, key: SortKey): number {
  const value = row[key];
  return value === null ? Number.NEGATIVE_INFINITY : Number(value);
}

function AgentTable({ filters }: { filters: ReportFilters }) {
  const t = useTranslations('reports');
  const locale = useLocale();
  const query = useAgentPerformance(filters, true);
  const [sort, setSort] = useState<{ key: SortKey; desc: boolean }>({
    key: 'won_value',
    desc: true,
  });

  const rows = useMemo(() => {
    const list = [...(query.data ?? [])];
    list.sort((a, b) => {
      const diff = sortValue(a, sort.key) - sortValue(b, sort.key);
      return sort.desc ? -diff : diff;
    });
    return list;
  }, [query.data, sort]);

  const hours = (value: number | null) =>
    formatHours(value, (key, values) => t(`time.${key}`, values), locale);

  const exportCsv = () =>
    downloadCsv(
      'employee-performance.csv',
      [t('agents.columns.employee'), ...COLUMNS.map((column) => t(`agents.columns.${column.key}`))],
      rows.map((row) => [
        row.name ?? t('agents.unknown', { id: row.employee_id }),
        ...COLUMNS.map((column) => (row[column.key] === null ? null : Number(row[column.key]))),
      ]),
    );

  // Cells are flagged when they are the weakest in the column among people with work to show.
  const flag = (row: AgentPerformanceRow, key: SortKey) =>
    (key === 'stale_leads' || key === 'tasks_overdue') && Number(row[key]) > 0;

  return (
    <ReportSection
      title={t('agents.title')}
      description={t('agents.description')}
      className="gap-3 px-0 pb-2"
      action={
        <Button
          variant="outline"
          size="sm"
          className="me-5"
          onClick={exportCsv}
          disabled={rows.length === 0}
        >
          <Download aria-hidden />
          {t('export')}
        </Button>
      }
    >
      {query.error ? (
        <ErrorState error={query.error} onRetry={() => void query.refetch()} />
      ) : query.isLoading ? (
        <div className="space-y-2 px-5">
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
        </div>
      ) : rows.length === 0 ? (
        <p className="text-small text-muted-foreground px-5">{t('agents.empty')}</p>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="bg-card sticky start-0 z-10 ps-5">
                  {t('agents.columns.employee')}
                </TableHead>
                {COLUMNS.map((column) => (
                  <TableHead key={column.key} className="text-end whitespace-nowrap">
                    <button
                      type="button"
                      className="hover:text-foreground inline-flex items-center gap-1"
                      onClick={() =>
                        setSort((current) => ({
                          key: column.key,
                          desc: current.key === column.key ? !current.desc : !column.lowerIsBetter,
                        }))
                      }
                    >
                      {t(`agents.columns.${column.key}`)}
                      {sort.key === column.key &&
                        (sort.desc ? (
                          <ArrowDown className="size-3" aria-hidden />
                        ) : (
                          <ArrowUp className="size-3" aria-hidden />
                        ))}
                    </button>
                  </TableHead>
                ))}
                <TableHead className="pe-5" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => {
                const name = row.name ?? t('agents.unknown', { id: row.employee_id });
                return (
                  <TableRow key={row.employee_id}>
                    <TableCell className="bg-card sticky start-0 z-10 ps-5">
                      <Link
                        href={`/reports/employees/${row.employee_id}`}
                        className="flex items-center gap-2 hover:underline"
                      >
                        <UserAvatar id={row.employee_id} name={name} size="sm" />
                        <span className="truncate font-medium">{name}</span>
                      </Link>
                    </TableCell>
                    {COLUMNS.map((column) => (
                      <TableCell
                        key={column.key}
                        className={cn(
                          'num text-end',
                          flag(row, column.key) && 'text-destructive font-semibold',
                        )}
                      >
                        {column.kind === 'money' ? (
                          <Amount value={row[column.key]} />
                        ) : column.kind === 'percent' ? (
                          `${row[column.key]}%`
                        ) : column.kind === 'hours' ? (
                          hours(row.avg_first_response_hours)
                        ) : (
                          row[column.key]
                        )}
                      </TableCell>
                    ))}
                    <TableCell className="pe-5">
                      <Link
                        href={`/reports/employees/${row.employee_id}`}
                        aria-label={t('agents.open', { name })}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <ChevronLeft className="size-4 ltr:rotate-180" aria-hidden />
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </ReportSection>
  );
}

function TeamsTable({ filters }: { filters: ReportFilters }) {
  const t = useTranslations('reports');
  const query = useTeamsReport(filters, true);
  const rows = query.data ?? [];

  const exportCsv = () =>
    downloadCsv(
      'teams.csv',
      [
        'team',
        'leads',
        'leads_won',
        'leads_lost',
        'conversion_rate',
        'deals',
        'deals_won',
        'won_value',
      ].map((key) => t(`teams.columns.${key}`)),
      rows.map((row) => [
        row.name ?? t('teams.noTeam'),
        row.leads,
        row.leads_won,
        row.leads_lost,
        row.conversion_rate,
        row.deals,
        row.deals_won,
        Number(row.won_value),
      ]),
    );

  return (
    <ReportSection
      title={t('teams.title')}
      description={t('teams.description')}
      className="gap-3 px-0 pb-2"
      action={
        <Button
          variant="outline"
          size="sm"
          className="me-5"
          onClick={exportCsv}
          disabled={rows.length === 0}
        >
          <Download aria-hidden />
          {t('export')}
        </Button>
      }
    >
      {query.error ? (
        <ErrorState error={query.error} onRetry={() => void query.refetch()} />
      ) : query.isLoading ? (
        <div className="px-5">
          <Skeleton className="h-9 w-full" />
        </div>
      ) : rows.length === 0 ? (
        <p className="text-small text-muted-foreground px-5">{t('empty')}</p>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="ps-5">{t('teams.columns.team')}</TableHead>
                <TableHead className="text-end">{t('teams.columns.leads')}</TableHead>
                <TableHead className="text-end">{t('teams.columns.leads_won')}</TableHead>
                <TableHead className="text-end">{t('teams.columns.leads_lost')}</TableHead>
                <TableHead className="text-end">{t('teams.columns.conversion_rate')}</TableHead>
                <TableHead className="text-end">{t('teams.columns.deals')}</TableHead>
                <TableHead className="text-end">{t('teams.columns.deals_won')}</TableHead>
                <TableHead className="pe-5 text-end">{t('teams.columns.won_value')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.team_id ?? 'none'}>
                  <TableCell className="ps-5 font-medium">
                    {row.name ?? t('teams.noTeam')}
                  </TableCell>
                  <TableCell className="num text-end">{row.leads}</TableCell>
                  <TableCell className="num text-end">{row.leads_won}</TableCell>
                  <TableCell className="num text-end">{row.leads_lost}</TableCell>
                  <TableCell className="num text-end">{row.conversion_rate}%</TableCell>
                  <TableCell className="num text-end">{row.deals}</TableCell>
                  <TableCell className="num text-end">{row.deals_won}</TableCell>
                  <TableCell className="pe-5 text-end">
                    <Amount value={row.won_value} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </ReportSection>
  );
}

export function TeamPerformanceSection({ filters }: { filters: ReportFilters }) {
  return (
    <div className="space-y-4">
      <AgentTable filters={filters} />
      <TeamsTable filters={filters} />
    </div>
  );
}
