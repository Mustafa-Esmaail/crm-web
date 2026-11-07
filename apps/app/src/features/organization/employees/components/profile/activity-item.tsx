'use client';

import { cn } from '@crm/ui';
import type { LucideIcon } from 'lucide-react';
import { Activity, LogIn, LogOut, Pause, Pencil, Play, Trash2, UserPlus } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { type AuditLog, getChanges } from '@/features/audit';
import { AuditDiff } from '@/shared/components/display/audit-diff';
import { RelativeTime } from '@/shared/components/display/relative-time';

interface ActionStyle {
  icon: LucideIcon;
  tone: string;
}

// Registry: a new audit action is one line here plus its sentence in messages.
const ACTION_STYLES: Record<string, ActionStyle> = {
  created: { icon: UserPlus, tone: 'bg-success-soft text-success' },
  updated: { icon: Pencil, tone: 'bg-info-soft text-info' },
  login: { icon: LogIn, tone: 'bg-success-soft text-success' },
  suspended: { icon: Pause, tone: 'bg-warning-soft text-warning' },
  activated: { icon: Play, tone: 'bg-success-soft text-success' },
  offboarded: { icon: LogOut, tone: 'bg-destructive-soft text-destructive' },
  deleted: { icon: Trash2, tone: 'bg-destructive-soft text-destructive' },
};
const FALLBACK_STYLE: ActionStyle = { icon: Activity, tone: 'bg-muted text-muted-foreground' };

interface ActivityItemProps {
  log: AuditLog;
  formatValue: (field: string, value: unknown) => string | undefined;
}

export function ActivityItem({ log, formatValue }: ActivityItemProps) {
  const t = useTranslations('employees.profile.activity');
  const tFields = useTranslations('employees.profile.fields');
  const style = ACTION_STYLES[log.action] ?? FALLBACK_STYLE;
  const Icon = style.icon;
  const user = log.user?.name ?? t('someone');

  const changes = log.action === 'updated' ? getChanges(log) : [];
  const fieldLabel = (field: string) => (tFields.has(field) ? tFields(field) : field);
  const onlyChange = changes.length === 1 ? changes[0] : undefined;

  const sentence = onlyChange
    ? t('changedField', { user, field: fieldLabel(onlyChange.field) })
    : t.has(`actions.${log.action}`)
      ? t(`actions.${log.action}`, { user })
      : t('actions.other', { user, action: log.action });

  return (
    <li className="flex items-start gap-3 py-3">
      <span
        className={cn('flex size-8 shrink-0 items-center justify-center rounded-full', style.tone)}
      >
        <Icon className="size-4" strokeWidth={1.75} aria-hidden />
      </span>
      <div className="min-w-0 flex-1 space-y-1.5">
        <p className="text-small text-foreground">{sentence}</p>
        {changes.length > 0 && (
          <AuditDiff
            oldValues={Object.fromEntries(changes.map((change) => [change.field, change.oldValue]))}
            newValues={Object.fromEntries(changes.map((change) => [change.field, change.newValue]))}
            getFieldLabel={fieldLabel}
            formatValue={formatValue}
          />
        )}
        <p className="text-caption text-text-faint">
          <RelativeTime value={log.created_at} />
        </p>
      </div>
    </li>
  );
}
