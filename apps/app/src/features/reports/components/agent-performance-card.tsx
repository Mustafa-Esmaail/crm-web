'use client';

import {
  Card,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@crm/ui';
import { useTranslations } from 'next-intl';

import { Amount } from '@/shared/components/display/amount';
import { UserAvatar } from '@/shared/components/display/user-avatar';
import { ErrorState } from '@/shared/components/feedback/error-state';

import { type Period, useAgentPerformance } from '../hooks/use-overview';

/** Leaderboard of the employees the viewer may see, sorted by won value (as the API sends it). */
export function AgentPerformanceCard({ period }: { period: Period }) {
  const t = useTranslations('dashboard.agents');
  const query = useAgentPerformance(period, true);
  const rows = query.data ?? [];

  return (
    <Card className="mt-4 gap-0 py-4">
      <div className="px-5 pb-3">
        <h2 className="font-semibold">{t('title')}</h2>
        <p className="text-small text-muted-foreground">{t('description')}</p>
      </div>

      {query.error ? (
        <ErrorState error={query.error} onRetry={() => void query.refetch()} />
      ) : query.isLoading ? (
        <div className="space-y-2 px-5">
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
        </div>
      ) : rows.length === 0 ? (
        <p className="text-small text-muted-foreground px-5">{t('empty')}</p>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="ps-5">{t('columns.employee')}</TableHead>
                <TableHead className="text-end">{t('columns.leads')}</TableHead>
                <TableHead className="text-end">{t('columns.leadsWon')}</TableHead>
                <TableHead className="text-end">{t('columns.conversion')}</TableHead>
                <TableHead className="text-end">{t('columns.deals')}</TableHead>
                <TableHead className="text-end">{t('columns.dealsWon')}</TableHead>
                <TableHead className="text-end">{t('columns.wonValue')}</TableHead>
                <TableHead className="pe-5 text-end">{t('columns.commission')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => {
                const name = row.name ?? t('unknown', { id: row.employee_id });
                return (
                  <TableRow key={row.employee_id}>
                    <TableCell className="ps-5">
                      <div className="flex items-center gap-2">
                        <UserAvatar id={row.employee_id} name={name} size="sm" />
                        <span className="truncate font-medium">{name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="num text-end">{row.leads}</TableCell>
                    <TableCell className="num text-end">{row.leads_won}</TableCell>
                    <TableCell className="num text-end">{row.conversion_rate}%</TableCell>
                    <TableCell className="num text-end">{row.deals}</TableCell>
                    <TableCell className="num text-end">{row.deals_won}</TableCell>
                    <TableCell className="text-end">
                      <Amount value={row.won_value} />
                    </TableCell>
                    <TableCell className="pe-5 text-end">
                      <Amount value={row.commission} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </Card>
  );
}
