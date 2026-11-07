'use client';

import { Button } from '@crm/ui';
import { Plus, ShieldCheck } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';

import { PERMISSIONS } from '@/config/permissions';
import { Can } from '@/shared/components/auth/can';
import { DataTable } from '@/shared/components/data-table/data-table';
import { EmptyState } from '@/shared/components/feedback/empty-state';
import { PageHeader } from '@/shared/components/layout/page-header';

import { useRolesQuery } from '../hooks/use-role-queries';
import type { Role } from '../types';
import { DeleteRoleDialog } from './delete-role-dialog';
import { createRoleColumns } from './role-columns';
import { RoleFormDialog } from './role-form-dialog';

const NO_ROWS: Role[] = [];

/** `null` = closed; `{ role: null }` = creating; `{ role }` = editing that role. */
type FormTarget = { role: Role | null } | null;

export function RolesPageContent() {
  const t = useTranslations('roles');
  const tNav = useTranslations('nav');
  const query = useRolesQuery();
  const [formTarget, setFormTarget] = useState<FormTarget>(null);
  const [deleteTarget, setDeleteTarget] = useState<Role | null>(null);

  const columns = useMemo(
    () =>
      createRoleColumns({
        t,
        onEdit: (role) => setFormTarget({ role }),
        onDelete: setDeleteTarget,
      }),
    [t],
  );

  return (
    <>
      <PageHeader>
        <PageHeader.Heading>
          <PageHeader.Breadcrumbs
            items={[
              { label: tNav('items.home'), href: '/' },
              { label: tNav('sections.admin') },
              { label: t('title') },
            ]}
          />
          <PageHeader.Title>{t('title')}</PageHeader.Title>
          <PageHeader.Description>{t('description')}</PageHeader.Description>
        </PageHeader.Heading>
        <PageHeader.Actions>
          <Can permission={PERMISSIONS.rolesManage}>
            <Button onClick={() => setFormTarget({ role: null })}>
              <Plus aria-hidden />
              {t('actions.create')}
            </Button>
          </Can>
        </PageHeader.Actions>
      </PageHeader>

      <DataTable>
        <DataTable.Content
          columns={columns}
          data={query.data ?? NO_ROWS}
          getRowId={(role) => String(role.id)}
          isLoading={query.isLoading}
          error={query.error}
          onRetry={() => void query.refetch()}
          emptyState={
            <EmptyState
              icon={ShieldCheck}
              title={t('empty.title')}
              description={t('empty.description')}
            />
          }
        />
      </DataTable>

      {formTarget && (
        <RoleFormDialog
          key={formTarget.role?.id ?? 'new'}
          role={formTarget.role}
          onClose={() => setFormTarget(null)}
        />
      )}
      {deleteTarget && (
        <DeleteRoleDialog role={deleteTarget} onClose={() => setDeleteTarget(null)} />
      )}
    </>
  );
}
