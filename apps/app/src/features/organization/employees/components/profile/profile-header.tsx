'use client';

import { Button } from '@crm/ui';
import { Briefcase, LogOut, MapPin, Network, Pause, Pencil, Play, UsersRound } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';

import { PERMISSIONS } from '@/config/permissions';
import { Can } from '@/shared/components/auth/can';
import { StatusBadge } from '@/shared/components/display/status-badge';
import { UserAvatar } from '@/shared/components/display/user-avatar';

import { EMPLOYEE_STATUS } from '../../constants';
import type { Employee } from '../../types';
import { canChangeStatus } from '../../utils/mappers';
import type { EmployeeActions } from '../employee-actions-menu';

function MetaItem({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <span className="text-small text-muted-foreground flex items-center gap-1.5">
      {icon}
      {children}
    </span>
  );
}

interface ProfileHeaderProps {
  employee: Employee;
  actions: EmployeeActions;
}

export function ProfileHeader({ employee, actions }: ProfileHeaderProps) {
  const t = useTranslations('employees.actions');
  const isActive = employee.status === EMPLOYEE_STATUS.active;
  const isSuspended = employee.status === EMPLOYEE_STATUS.suspended;
  const hasLeft = employee.status === EMPLOYEE_STATUS.left;
  const isChangeable = canChangeStatus(employee) && !hasLeft;

  return (
    <>
      <div className="bg-profile-cover h-32 sm:h-40" aria-hidden />
      <div className="flex flex-wrap items-end gap-x-5 gap-y-4 px-6 pb-5">
        <UserAvatar
          id={employee.id}
          name={employee.name}
          size="xl"
          className="border-card -mt-12 border-4"
        />
        <div className="min-w-0 flex-1 space-y-2 pt-3">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-title font-bold">{employee.name}</h1>
            <StatusBadge status={employee.status} />
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            {employee.job_title && (
              <MetaItem icon={<Briefcase className="size-3.5" aria-hidden />}>
                {employee.job_title}
              </MetaItem>
            )}
            {employee.department && (
              <MetaItem icon={<Network className="size-3.5" aria-hidden />}>
                {employee.department.name}
              </MetaItem>
            )}
            {employee.team && (
              <MetaItem icon={<UsersRound className="size-3.5" aria-hidden />}>
                {employee.team.name}
              </MetaItem>
            )}
            {employee.branch && (
              <MetaItem icon={<MapPin className="size-3.5" aria-hidden />}>
                {employee.branch.name}
              </MetaItem>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Can permission={PERMISSIONS.employeesUpdate}>
            <Button variant="outline" onClick={() => actions.onEdit(employee)}>
              <Pencil aria-hidden />
              {t('edit')}
            </Button>
          </Can>
          {isChangeable && isActive && (
            <Can permission={PERMISSIONS.employeesSuspend}>
              <Button variant="outline" onClick={() => actions.onSuspend(employee)}>
                <Pause aria-hidden />
                {t('suspend')}
              </Button>
            </Can>
          )}
          {isChangeable && isSuspended && (
            <Can permission={PERMISSIONS.employeesSuspend}>
              <Button variant="outline" onClick={() => actions.onActivate(employee)}>
                <Play aria-hidden />
                {t('activate')}
              </Button>
            </Can>
          )}
          {isChangeable && (
            <Can permission={PERMISSIONS.employeesOffboard}>
              <Button
                variant="outline"
                className="border-destructive/40 bg-destructive-soft text-destructive hover:bg-destructive-soft hover:text-destructive"
                onClick={() => actions.onOffboard(employee)}
              >
                <LogOut className="rtl:rotate-180" aria-hidden />
                {t('offboard')}
              </Button>
            </Can>
          )}
        </div>
      </div>
    </>
  );
}
