'use client';

import { Button, Tabs, TabsList, TabsTrigger } from '@crm/ui';
import { Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { parseAsStringLiteral, useQueryState } from 'nuqs';
import { useMemo, useState } from 'react';

import { PERMISSIONS } from '@/config/permissions';
import { Can } from '@/shared/components/auth/can';
import { DataTable } from '@/shared/components/data-table/data-table';
import { PageHeader } from '@/shared/components/layout/page-header';

import { DEPARTMENT_VIEWS } from '../constants';
import type { Department } from '../types';
import { DeleteDepartmentDialog } from './delete-department-dialog';
import type { DepartmentActions } from './department-actions-menu';
import { DepartmentFormDialog } from './department-form-dialog';
import { DepartmentTreeView } from './department-tree-view';
import { DepartmentsList } from './departments-list';
import { MoveDepartmentDialog } from './move-department-dialog';

/** `{ department: null }` = creating (optionally under `parentId`); `{ department }` = editing. */
type FormTarget = { department: Department | null; parentId?: number } | null;

export function DepartmentsPageContent() {
  const t = useTranslations('departments');
  const tNav = useTranslations('nav');
  const [view, setView] = useQueryState(
    'view',
    parseAsStringLiteral(DEPARTMENT_VIEWS).withDefault('tree').withOptions({ history: 'replace' }),
  );
  const [formTarget, setFormTarget] = useState<FormTarget>(null);
  const [moveTarget, setMoveTarget] = useState<Department | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Department | null>(null);

  // Stable identity: the list builds its columns from this, so a fresh object each render would rebuild them.
  const actions: DepartmentActions = useMemo(
    () => ({
      onEdit: (department) => setFormTarget({ department }),
      onAddChild: (department) => setFormTarget({ department: null, parentId: department.id }),
      onMove: setMoveTarget,
      onDelete: setDeleteTarget,
    }),
    [],
  );

  return (
    <>
      <PageHeader>
        <PageHeader.Heading>
          <PageHeader.Breadcrumbs
            items={[
              { label: tNav('items.home'), href: '/' },
              { label: tNav('sections.organization') },
              { label: t('title') },
            ]}
          />
          <PageHeader.Title>{t('title')}</PageHeader.Title>
          <PageHeader.Description>{t('description')}</PageHeader.Description>
        </PageHeader.Heading>
        <PageHeader.Actions>
          <Tabs value={view} onValueChange={(next) => void setView(parseView(next))}>
            <TabsList>
              <TabsTrigger value="tree">{t('views.tree')}</TabsTrigger>
              <TabsTrigger value="list">{t('views.list')}</TabsTrigger>
            </TabsList>
          </Tabs>
          <Can permission={PERMISSIONS.departmentsManage}>
            <Button onClick={() => setFormTarget({ department: null })}>
              <Plus aria-hidden />
              {t('actions.create')}
            </Button>
          </Can>
        </PageHeader.Actions>
      </PageHeader>

      <DataTable>
        {view === 'tree' ? (
          <DepartmentTreeView actions={actions} />
        ) : (
          <DepartmentsList actions={actions} />
        )}
      </DataTable>

      {formTarget && (
        <DepartmentFormDialog
          key={formTarget.department?.id ?? `new-${formTarget.parentId ?? 'root'}`}
          department={formTarget.department}
          parentId={formTarget.parentId}
          onClose={() => setFormTarget(null)}
        />
      )}
      {moveTarget && (
        <MoveDepartmentDialog department={moveTarget} onClose={() => setMoveTarget(null)} />
      )}
      {deleteTarget && (
        <DeleteDepartmentDialog department={deleteTarget} onClose={() => setDeleteTarget(null)} />
      )}
    </>
  );
}

function parseView(value: string): (typeof DEPARTMENT_VIEWS)[number] {
  return DEPARTMENT_VIEWS.find((view) => view === value) ?? 'tree';
}
