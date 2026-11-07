'use client';

import { isApiError } from '@crm/api-client';
import { Card, Checkbox, Skeleton } from '@crm/ui';
import { useState } from 'react';

import { ErrorState } from '@/shared/components/feedback/error-state';

import { useSavePermissions } from '../hooks/use-role-mutations';
import { useRoleMatrixQuery } from '../hooks/use-role-queries';
import type { PermissionModule } from '../types';
import { grantedKeys, moduleState, sameKeys, setModule, togglePermission } from '../utils/drafts';
import { SaveBar } from './save-bar';

interface PermissionsTabProps {
  roleId: number;
  canEdit: boolean;
}

export function PermissionsTab({ roleId, canEdit }: PermissionsTabProps) {
  const query = useRoleMatrixQuery(roleId);

  if (query.isPending) return <Skeleton className="h-96 w-full rounded-lg" />;
  if (query.isError) return <ErrorState error={query.error} onRetry={() => void query.refetch()} />;

  // Re-keyed when fresh server data arrives, so the draft restarts from what was saved.
  return (
    <PermissionsEditor
      key={query.dataUpdatedAt}
      roleId={roleId}
      modules={query.data}
      canEdit={canEdit}
    />
  );
}

interface PermissionsEditorProps extends PermissionsTabProps {
  modules: PermissionModule[];
}

function PermissionsEditor({ roleId, modules, canEdit }: PermissionsEditorProps) {
  const saved = grantedKeys(modules);
  const [draft, setDraft] = useState<ReadonlySet<string>>(saved);
  const save = useSavePermissions(roleId);

  const errors = isApiError(save.error) ? [save.error.message] : [];

  return (
    <>
      <div className="grid gap-4 lg:grid-cols-2">
        {modules.map((module) => {
          const state = moduleState(module, draft);

          return (
            <Card key={module.module} className="gap-3 py-4">
              <div className="flex items-center gap-3 border-b px-5 pb-3">
                <Checkbox
                  id={`module-${module.module}`}
                  checked={state === 'all' ? true : state === 'some' ? 'indeterminate' : false}
                  disabled={!canEdit}
                  onCheckedChange={(checked) =>
                    setDraft(setModule(module, draft, checked === true))
                  }
                />
                <label
                  htmlFor={`module-${module.module}`}
                  className="text-card-title text-foreground font-semibold"
                >
                  {module.label}
                </label>
              </div>
              <ul className="space-y-2 px-5">
                {module.permissions.map((permission) => (
                  <li key={permission.key} className="flex items-center gap-3">
                    <Checkbox
                      id={permission.key}
                      checked={draft.has(permission.key)}
                      disabled={!canEdit}
                      onCheckedChange={() => setDraft(togglePermission(draft, permission.key))}
                    />
                    <label htmlFor={permission.key} className="text-small text-foreground">
                      {permission.label}
                    </label>
                  </li>
                ))}
              </ul>
            </Card>
          );
        })}
      </div>

      {canEdit && (
        <SaveBar
          isDirty={!sameKeys(draft, saved)}
          isSaving={save.isPending}
          errors={errors}
          onSave={() => save.mutate([...draft])}
          onDiscard={() => setDraft(saved)}
        />
      )}
    </>
  );
}
