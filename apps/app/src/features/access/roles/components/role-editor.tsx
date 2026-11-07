'use client';

import { Tabs, TabsList, TabsTrigger } from '@crm/ui';
import { ArrowLeft, Info } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { parseAsStringLiteral, useQueryState } from 'nuqs';

import { PERMISSIONS } from '@/config/permissions';
import { Link } from '@/lib/i18n/navigation';
import { CodeLabel } from '@/shared/components/display/code-label';
import { ErrorState } from '@/shared/components/feedback/error-state';
import { PageSkeleton } from '@/shared/components/feedback/page-skeleton';
import { PageHeader } from '@/shared/components/layout/page-header';
import { useCan } from '@/shared/hooks/use-can';

import { OWNER_ROLE_KEY, ROLE_EDITOR_TABS } from '../constants';
import { useRoleQuery } from '../hooks/use-role-queries';
import { FieldsTab } from './fields-tab';
import { PermissionsTab } from './permissions-tab';
import { ScopesTab } from './scopes-tab';

export function RoleEditor({ roleId }: { roleId: number }) {
  const t = useTranslations('roles');
  const tNav = useTranslations('nav');
  const canManage = useCan(PERMISSIONS.rolesManage);
  const query = useRoleQuery(roleId);
  const [tab, setTab] = useQueryState(
    'tab',
    parseAsStringLiteral(ROLE_EDITOR_TABS)
      .withDefault('permissions')
      .withOptions({ history: 'replace' }),
  );

  if (query.isPending) return <PageSkeleton />;
  if (query.isError) return <ErrorState error={query.error} onRetry={() => void query.refetch()} />;

  const role = query.data;
  const isOwner = role.key === OWNER_ROLE_KEY;

  return (
    <>
      <PageHeader>
        <PageHeader.Heading>
          <PageHeader.Breadcrumbs
            items={[
              { label: tNav('items.home'), href: '/' },
              { label: tNav('sections.admin') },
              { label: t('title'), href: '/access/roles' },
              { label: role.name },
            ]}
          />
          <PageHeader.Title>{role.name}</PageHeader.Title>
          {/* CodeLabel is a block element, so it cannot live inside the description paragraph. */}
          <div className="text-small text-muted-foreground flex flex-wrap items-center gap-x-2">
            <CodeLabel>{role.key}</CodeLabel>
            {role.description && <p>{role.description}</p>}
          </div>
        </PageHeader.Heading>
        <PageHeader.Actions>
          <Link
            href="/access/roles"
            className="text-small text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5"
          >
            <ArrowLeft className="size-4 rtl:rotate-180" aria-hidden />
            {t('editor.back')}
          </Link>
        </PageHeader.Actions>
      </PageHeader>

      {isOwner && (
        <p className="bg-info-soft text-info text-small mb-4 flex items-start gap-2 rounded-md px-3 py-2">
          <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
          {t('editor.ownerNote')}
        </p>
      )}
      {!canManage && (
        <p className="bg-muted text-muted-foreground text-small mb-4 rounded-md px-3 py-2">
          {t('editor.readOnly')}
        </p>
      )}

      <Tabs
        value={tab}
        onValueChange={(value) => void setTab(value as typeof tab)}
        className="mb-6"
      >
        <TabsList>
          {ROLE_EDITOR_TABS.map((value) => (
            <TabsTrigger key={value} value={value}>
              {t(`editor.tabs.${value}`)}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {tab === 'permissions' && <PermissionsTab roleId={roleId} canEdit={canManage} />}
      {tab === 'scopes' && <ScopesTab roleId={roleId} canEdit={canManage} />}
      {tab === 'fields' && <FieldsTab roleId={roleId} canEdit={canManage} />}
    </>
  );
}
