'use client';

import { Skeleton } from '@crm/ui';
import { Building2, GitBranch, UserRound, Users } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { CodeLabel } from '@/shared/components/display/code-label';
import { StatusBadge } from '@/shared/components/display/status-badge';
import { TreeView } from '@/shared/components/display/tree-view';
import { EmptyState } from '@/shared/components/feedback/empty-state';
import { ErrorState } from '@/shared/components/feedback/error-state';

import { useDepartmentTreeQuery } from '../hooks/use-departments-queries';
import type { Department } from '../types';
import { getDepartmentStatus } from '../utils/mappers';
import { type DepartmentActions, DepartmentActionsMenu } from './department-actions-menu';

function DepartmentNodeRow({
  department,
  actions,
}: {
  department: Department;
  actions: DepartmentActions;
}) {
  const t = useTranslations('departments');

  return (
    <div className="hover:bg-surface-2 flex flex-wrap items-center gap-x-4 gap-y-1 rounded-md px-2 py-2">
      <span className="bg-primary-soft text-primary flex size-8 shrink-0 items-center justify-center rounded-md">
        <Building2 className="size-4" strokeWidth={1.75} aria-hidden />
      </span>
      <div className="min-w-40 flex-1">
        <p className="text-foreground truncate font-semibold">{department.name}</p>
        {department.code && <CodeLabel>{department.code}</CodeLabel>}
      </div>
      {department.branch && (
        <span className="text-small text-muted-foreground flex items-center gap-1.5">
          <GitBranch className="size-3.5" aria-hidden />
          {department.branch.name}
        </span>
      )}
      {department.manager && (
        <span className="text-small text-muted-foreground flex items-center gap-1.5">
          <UserRound className="size-3.5" aria-hidden />
          {department.manager.name}
        </span>
      )}
      <span
        className="num text-small text-muted-foreground flex items-center gap-1.5"
        title={t('columns.employees')}
      >
        <Users className="size-3.5" aria-hidden />
        {department.employees_count ?? 0}
      </span>
      <StatusBadge status={getDepartmentStatus(department)} />
      <DepartmentActionsMenu department={department} actions={actions} />
    </div>
  );
}

export function DepartmentTreeView({ actions }: { actions: DepartmentActions }) {
  const t = useTranslations('departments');
  const query = useDepartmentTreeQuery();

  if (query.isLoading) {
    return (
      <div className="space-y-2 p-4">
        {Array.from({ length: 6 }, (_, index) => (
          <Skeleton key={index} className="h-12" />
        ))}
      </div>
    );
  }
  if (query.error) return <ErrorState error={query.error} onRetry={() => void query.refetch()} />;
  if (!query.data || query.data.length === 0) {
    return (
      <EmptyState icon={Building2} title={t('empty.title')} description={t('empty.description')} />
    );
  }

  return (
    <TreeView
      className="p-3"
      nodes={query.data}
      renderNode={(department) => <DepartmentNodeRow department={department} actions={actions} />}
    />
  );
}
