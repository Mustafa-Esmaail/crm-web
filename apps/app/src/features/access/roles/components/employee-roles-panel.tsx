'use client';

import { isApiError } from '@crm/api-client';
import { Card, Checkbox, Skeleton } from '@crm/ui';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { PERMISSIONS } from '@/config/permissions';
import { Link } from '@/lib/i18n/navigation';
import { CodeLabel } from '@/shared/components/display/code-label';
import { ErrorState } from '@/shared/components/feedback/error-state';
import { useCan } from '@/shared/hooks/use-can';

import { useSyncEmployeeRoles } from '../hooks/use-role-mutations';
import { useEmployeeRolesQuery, useRolesQuery } from '../hooks/use-role-queries';
import type { Role } from '../types';
import { sameKeys, togglePermission } from '../utils/drafts';
import { SaveBar } from './save-bar';

export function EmployeeRolesPanel({ employeeId }: { employeeId: number }) {
  const all = useRolesQuery();
  const assigned = useEmployeeRolesQuery(employeeId);
  const canAssign = useCan(PERMISSIONS.rolesAssign);

  if (all.isError) return <ErrorState error={all.error} onRetry={() => void all.refetch()} />;
  if (assigned.isError)
    return <ErrorState error={assigned.error} onRetry={() => void assigned.refetch()} />;
  if (all.isPending || assigned.isPending) return <Skeleton className="h-64 w-full rounded-lg" />;

  return (
    <RolesChecklist
      key={assigned.dataUpdatedAt}
      employeeId={employeeId}
      roles={all.data}
      assignedIds={new Set(assigned.data.map((role) => String(role.id)))}
      canAssign={canAssign}
    />
  );
}

interface RolesChecklistProps {
  employeeId: number;
  roles: Role[];
  assignedIds: ReadonlySet<string>;
  canAssign: boolean;
}

function RolesChecklist({ employeeId, roles, assignedIds, canAssign }: RolesChecklistProps) {
  const t = useTranslations('roles.assign');
  const [draft, setDraft] = useState<ReadonlySet<string>>(assignedIds);
  const save = useSyncEmployeeRoles(employeeId);

  const errors = isApiError(save.error) ? [save.error.message] : [];

  return (
    <>
      <p className="text-small text-muted-foreground mb-4">
        {canAssign ? t('intro') : t('readOnly')}{' '}
        <Link href="/access/roles" className="text-primary font-semibold hover:underline">
          {t('manage')}
        </Link>
      </p>
      <Card className="gap-0 divide-y py-0">
        {roles.map((role) => (
          <label
            key={role.id}
            htmlFor={`role-${role.id}`}
            className="flex cursor-pointer items-start gap-3 px-5 py-4"
          >
            <Checkbox
              id={`role-${role.id}`}
              checked={draft.has(String(role.id))}
              disabled={!canAssign}
              onCheckedChange={() => setDraft(togglePermission(draft, String(role.id)))}
              className="mt-0.5"
            />
            <span className="min-w-0">
              <span className="text-small text-foreground block font-semibold">{role.name}</span>
              <CodeLabel>{role.key}</CodeLabel>
              {role.description && (
                <span className="text-caption text-muted-foreground block">{role.description}</span>
              )}
            </span>
          </label>
        ))}
      </Card>

      {canAssign && (
        <SaveBar
          isDirty={!sameKeys(draft, assignedIds)}
          isSaving={save.isPending}
          errors={errors}
          onSave={() => save.mutate([...draft].map(Number))}
          onDiscard={() => setDraft(assignedIds)}
        />
      )}
    </>
  );
}
