'use client';

import { Card, CardContent, CardHeader, CardTitle, Skeleton } from '@crm/ui';
import { Target } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

import { findPathTo, useOrgChartQuery } from '@/features/organization/org-chart';
import { UserAvatar } from '@/shared/components/display/user-avatar';

import type { Employee } from '../../types';

/** The monthly target needs the deals module; until then the card says so instead of faking a number. */
function TargetPlaceholder() {
  const t = useTranslations('employees.profile.target');

  return (
    <div className="bg-primary-soft text-small mt-4 space-y-2 rounded-lg p-3">
      <div className="text-primary flex items-center gap-2 font-medium">
        <Target className="size-4" aria-hidden />
        {t('title')}
      </div>
      <p className="text-muted-foreground text-caption">{t('unavailable')}</p>
    </div>
  );
}

export function ReportingLineCard({ employee }: { employee: Employee }) {
  const t = useTranslations('employees.profile.reportingLine');
  const orgChart = useOrgChartQuery();
  const path = useMemo(
    () => findPathTo(orgChart.data ?? [], employee.id),
    [orgChart.data, employee.id],
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
      </CardHeader>
      <CardContent>
        {orgChart.isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }, (_, index) => (
              <Skeleton key={index} className="h-10" />
            ))}
          </div>
        ) : path.length === 0 ? (
          <p className="text-small text-muted-foreground">
            {employee.manager ? t('managerOnly', { name: employee.manager.name }) : t('none')}
          </p>
        ) : (
          <ol>
            {path.map((person, index) => {
              const isCurrent = person.id === employee.id;
              const isLast = index === path.length - 1;

              return (
                <li key={person.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <UserAvatar id={person.id} name={person.name} size="sm" />
                    {!isLast && (
                      <span
                        className="border-border-strong my-1 min-h-4 flex-1 border-s border-dashed"
                        aria-hidden
                      />
                    )}
                  </div>
                  <div className="min-w-0 pb-4">
                    <p className="text-small text-foreground font-semibold">{person.name}</p>
                    <p className="text-caption text-muted-foreground">
                      {isCurrent ? t('current') : (person.job_title ?? '')}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
        <TargetPlaceholder />
      </CardContent>
    </Card>
  );
}
