'use client';

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@crm/ui';
import { FolderInput, MoreHorizontal, Pencil, Plus, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { PERMISSIONS } from '@/config/permissions';
import { Can } from '@/shared/components/auth/can';

import type { Department } from '../types';

export interface DepartmentActions {
  onEdit: (department: Department) => void;
  onAddChild: (department: Department) => void;
  onMove: (department: Department) => void;
  onDelete: (department: Department) => void;
}

interface DepartmentActionsMenuProps {
  department: Department;
  actions: DepartmentActions;
}

/** One menu for tree rows and list rows, so both offer the same actions to the same people. */
export function DepartmentActionsMenu({ department, actions }: DepartmentActionsMenuProps) {
  const t = useTranslations('departments.actions');

  return (
    <Can permission={PERMISSIONS.departmentsManage}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm" aria-label={`${t('menu')}: ${department.name}`}>
            <MoreHorizontal aria-hidden />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => actions.onEdit(department)}>
            <Pencil aria-hidden />
            {t('edit')}
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => actions.onAddChild(department)}>
            <Plus aria-hidden />
            {t('addChild')}
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => actions.onMove(department)}>
            <FolderInput aria-hidden />
            {t('move')}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onSelect={() => actions.onDelete(department)}>
            <Trash2 aria-hidden />
            {t('delete')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </Can>
  );
}
