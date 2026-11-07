'use client';

import { Card, Skeleton, Tabs, TabsList, TabsTrigger } from '@crm/ui';
import { Handshake } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { parseAsStringLiteral, useQueryState } from 'nuqs';
import { useMemo, useState } from 'react';

import { EmployeeRolesPanel } from '@/features/access/roles';
import { ErrorState } from '@/shared/components/feedback/error-state';
import { PageHeader } from '@/shared/components/layout/page-header';

import { EMPLOYEE_PROFILE_TABS, type EmployeeProfileTab } from '../../constants';
import { useEmployeeQuery } from '../../hooks/use-employee-queries';
import type { Employee } from '../../types';
import type { EmployeeActions } from '../employee-actions-menu';
import { EmployeeFormDialog } from '../employee-form-dialog';
import { EmployeeStatusDialog, type StatusAction } from '../employee-status-dialog';
import { OffboardDialog } from '../offboard-dialog';
import { ActivityTab } from './activity-tab';
import { BasicInfoCard } from './basic-info-card';
import { ComingSoonTab } from './coming-soon-tab';
import { ProfileHeader } from './profile-header';
import { RecentActivityCard } from './recent-activity-card';
import { ReportingLineCard } from './reporting-line-card';
import { SubordinatesTab } from './subordinates-tab';

function parseTab(value: string): EmployeeProfileTab {
  return EMPLOYEE_PROFILE_TABS.find((tab) => tab === value) ?? 'overview';
}

function ProfileSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-64 rounded-lg" />
      <div className="grid gap-4 lg:grid-cols-3">
        <Skeleton className="h-72 rounded-lg" />
        <Skeleton className="h-72 rounded-lg" />
        <Skeleton className="h-72 rounded-lg" />
      </div>
    </div>
  );
}

export function EmployeeProfile({ id }: { id: number }) {
  const t = useTranslations('employees');
  const tNav = useTranslations('nav');
  const query = useEmployeeQuery(id);
  const [tab, setTab] = useQueryState(
    'tab',
    parseAsStringLiteral(EMPLOYEE_PROFILE_TABS)
      .withDefault('overview')
      .withOptions({ history: 'replace' }),
  );
  const [isEditing, setIsEditing] = useState(false);
  const [statusAction, setStatusAction] = useState<StatusAction | null>(null);
  const [isOffboarding, setIsOffboarding] = useState(false);

  const actions: EmployeeActions = useMemo(
    () => ({
      onEdit: () => setIsEditing(true),
      onSuspend: () => setStatusAction('suspend'),
      onActivate: () => setStatusAction('activate'),
      onOffboard: () => setIsOffboarding(true),
    }),
    [],
  );

  if (query.isLoading) return <ProfileSkeleton />;
  if (query.error || !query.data) {
    return <ErrorState error={query.error} onRetry={() => void query.refetch()} />;
  }
  const employee: Employee = query.data;

  return (
    <>
      <PageHeader className="mb-4">
        <PageHeader.Heading>
          <PageHeader.Breadcrumbs
            items={[
              { label: tNav('sections.organization') },
              { label: t('title'), href: '/organization/employees' },
              { label: employee.name },
            ]}
          />
        </PageHeader.Heading>
      </PageHeader>

      <Card className="mb-4 gap-0 overflow-hidden p-0">
        <ProfileHeader employee={employee} actions={actions} />
        <Tabs value={tab} onValueChange={(next) => void setTab(parseTab(next))} className="px-6">
          <TabsList
            variant="line"
            className="h-auto w-full justify-start gap-6 rounded-none bg-transparent p-0"
          >
            {EMPLOYEE_PROFILE_TABS.map((value) => (
              <TabsTrigger
                key={value}
                value={value}
                className="data-[state=active]:text-primary after:bg-primary h-11 flex-none rounded-none px-1 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
              >
                {t(`profile.tabs.${value}`)}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </Card>

      {tab === 'overview' && (
        <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr_0.9fr]">
          <BasicInfoCard employee={employee} />
          <RecentActivityCard employeeId={employee.id} onViewAll={() => void setTab('activity')} />
          <ReportingLineCard employee={employee} />
        </div>
      )}
      {tab === 'subordinates' && <SubordinatesTab employeeId={employee.id} />}
      {tab === 'deals' && <ComingSoonTab messageKey="deals" icon={Handshake} />}
      {tab === 'roles' && <EmployeeRolesPanel employeeId={employee.id} />}
      {tab === 'activity' && <ActivityTab employeeId={employee.id} />}

      {isEditing && <EmployeeFormDialog employee={employee} onClose={() => setIsEditing(false)} />}
      {statusAction && (
        <EmployeeStatusDialog
          employee={employee}
          action={statusAction}
          onClose={() => setStatusAction(null)}
        />
      )}
      {isOffboarding && (
        <OffboardDialog employee={employee} onClose={() => setIsOffboarding(false)} />
      )}
    </>
  );
}
