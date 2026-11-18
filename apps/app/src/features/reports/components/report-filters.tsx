'use client';

import { Input, Tabs, TabsList, TabsTrigger } from '@crm/ui';
import { UserRound, UsersRound } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { useEmployeeName, useEmployeeOptions } from '@/features/organization/employees';
import { useTeamLookup } from '@/features/organization/teams';
import { FilterChip } from '@/shared/components/data-table/filter-chip';

import { type Period, PERIODS, type ReportFilters } from '../hooks/use-overview';

interface ReportFiltersBarProps {
  value: ReportFilters;
  onChange: (value: ReportFilters) => void;
  /** Employee and team chips; off for a single employee's scorecard. */
  withPeople?: boolean;
}

function TeamChip({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (v: string | null) => void;
}) {
  const t = useTranslations('reports.filters');
  const teams = useTeamLookup();

  return (
    <FilterChip
      definition={{
        id: 'team_id',
        label: t('team'),
        icon: UsersRound,
        options: teams.options,
        isLoading: teams.isLoading,
      }}
      value={value}
      onChange={onChange}
    />
  );
}

/** Period presets (or a custom range) and, optionally, one employee and one team, in one row. */
export function ReportFiltersBar({ value, onChange, withPeople = true }: ReportFiltersBarProps) {
  const t = useTranslations('reports.filters');

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <Tabs
        value={value.period}
        onValueChange={(period) => onChange({ ...value, period: period as Period })}
      >
        <TabsList className="h-auto flex-wrap">
          {PERIODS.map((period) => (
            <TabsTrigger key={period} value={period}>
              {t(`periods.${period}`)}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {value.period === 'custom' && (
        <div className="flex items-center gap-2">
          <Input
            type="date"
            aria-label={t('from')}
            className="h-chip w-38"
            value={value.from ?? ''}
            max={value.to || undefined}
            onChange={(event) => onChange({ ...value, from: event.target.value || undefined })}
          />
          <span className="text-muted-foreground text-small">{t('until')}</span>
          <Input
            type="date"
            aria-label={t('to')}
            className="h-chip w-38"
            value={value.to ?? ''}
            min={value.from || undefined}
            onChange={(event) => onChange({ ...value, to: event.target.value || undefined })}
          />
        </div>
      )}

      {withPeople && (
        <>
          <FilterChip
            definition={{
              id: 'employee_id',
              label: t('employee'),
              icon: UserRound,
              options: [],
              useOptions: useEmployeeOptions,
              useSelectedLabel: useEmployeeName,
            }}
            value={value.employeeId}
            onChange={(employeeId) => onChange({ ...value, employeeId })}
          />
          <TeamChip
            value={value.teamId ?? null}
            onChange={(teamId) => onChange({ ...value, teamId })}
          />
        </>
      )}
    </div>
  );
}
