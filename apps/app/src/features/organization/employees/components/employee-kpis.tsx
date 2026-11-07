'use client';

import { Activity, PauseCircle, Users, UsersRound } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { StatCard } from '@/shared/components/display/stat-card';

import { useEmployeeKpis } from '../hooks/use-employee-kpis';

export function EmployeeKpis() {
  const t = useTranslations('employees.kpis');
  const kpis = useEmployeeKpis();

  return (
    <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label={t('total')}
        value={kpis.total}
        icon={Users}
        tone="primary"
        isLoading={kpis.isLoading}
      />
      <StatCard
        label={t('active')}
        value={kpis.active}
        subLabel={
          kpis.activePercent === undefined
            ? undefined
            : t('activeShare', { percent: kpis.activePercent })
        }
        icon={Activity}
        tone="success"
        isLoading={kpis.isLoading}
      />
      <StatCard
        label={t('suspended')}
        value={kpis.suspended}
        subLabel={t('needsReview')}
        icon={PauseCircle}
        tone="accent"
        isLoading={kpis.isLoading}
      />
      <StatCard
        label={t('teams')}
        value={kpis.teams}
        subLabel={
          kpis.branches === undefined ? undefined : t('inBranches', { count: kpis.branches })
        }
        icon={UsersRound}
        tone="info"
        isLoading={kpis.isLoading}
      />
    </div>
  );
}
