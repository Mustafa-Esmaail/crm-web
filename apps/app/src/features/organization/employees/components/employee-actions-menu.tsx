'use client';

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@crm/ui';
import { Eye, LogOut, MoreHorizontal, Pause, Pencil, Play } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { PERMISSIONS } from '@/config/permissions';
import { Link } from '@/lib/i18n/navigation';
import { useCan } from '@/shared/hooks/use-can';

import { EMPLOYEE_STATUS } from '../constants';
import type { Employee } from '../types';
import { canChangeStatus } from '../utils/mappers';

export interface EmployeeActions {
  onEdit: (employee: Employee) => void;
  onSuspend: (employee: Employee) => void;
  onActivate: (employee: Employee) => void;
  onOffboard: (employee: Employee) => void;
}

interface EmployeeActionsMenuProps {
  employee: Employee;
  actions: EmployeeActions;
}

/** Every item is gated by its own permission; a user with none of them still gets "view". */
export function EmployeeActionsMenu({ employee, actions }: EmployeeActionsMenuProps) {
  const t = useTranslations('employees.actions');
  const canUpdate = useCan(PERMISSIONS.employeesUpdate);
  const canSuspend = useCan(PERMISSIONS.employeesSuspend);
  const canActivate = useCan(PERMISSIONS.employeesSuspend);
  const canOffboard = useCan(PERMISSIONS.employeesOffboard);

  const isProtected = !canChangeStatus(employee);
  const isActive = employee.status === EMPLOYEE_STATUS.active;
  const isSuspended = employee.status === EMPLOYEE_STATUS.suspended;
  const hasLeft = employee.status === EMPLOYEE_STATUS.left;

  const showSuspend = canSuspend && isActive && !isProtected;
  const showActivate = canActivate && isSuspended && !isProtected;
  const showOffboard = canOffboard && !hasLeft && !isProtected;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label={`${t('menu')}: ${employee.name}`}>
          <MoreHorizontal aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem asChild>
          <Link href={`/organization/employees/${employee.id}`}>
            <Eye aria-hidden />
            {t('view')}
          </Link>
        </DropdownMenuItem>
        {canUpdate && (
          <DropdownMenuItem onSelect={() => actions.onEdit(employee)}>
            <Pencil aria-hidden />
            {t('edit')}
          </DropdownMenuItem>
        )}
        {(showSuspend || showActivate || showOffboard) && <DropdownMenuSeparator />}
        {showSuspend && (
          <DropdownMenuItem onSelect={() => actions.onSuspend(employee)}>
            <Pause aria-hidden />
            {t('suspend')}
          </DropdownMenuItem>
        )}
        {showActivate && (
          <DropdownMenuItem onSelect={() => actions.onActivate(employee)}>
            <Play aria-hidden />
            {t('activate')}
          </DropdownMenuItem>
        )}
        {showOffboard && (
          <DropdownMenuItem variant="destructive" onSelect={() => actions.onOffboard(employee)}>
            <LogOut aria-hidden />
            {t('offboard')}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
