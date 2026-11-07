'use client';

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@crm/ui';
import { useTranslations } from 'next-intl';

import { type AuditLog, getChanges } from '@/features/audit';
import { useAuditValueResolver } from '@/features/organization/employees';
import { AuditDiff } from '@/shared/components/display/audit-diff';
import { FormattedDate } from '@/shared/components/display/formatted-date';

import { AuditActionBadge } from './audit-action-badge';

interface AuditLogDrawerProps {
  log: AuditLog | null;
  onClose: () => void;
}

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-0.5">
      <dt className="text-caption text-muted-foreground">{label}</dt>
      <dd className="text-small text-foreground break-words">{children}</dd>
    </div>
  );
}

export function AuditLogDrawer({ log, onClose }: AuditLogDrawerProps) {
  const t = useTranslations('auditLog.drawer');
  const tFields = useTranslations('employees.profile.fields');
  const formatValue = useAuditValueResolver();
  const changes = log ? getChanges(log) : [];
  const fieldLabel = (field: string) => (tFields.has(field) ? tFields(field) : field);
  const empty = '—';

  return (
    <Sheet open={log !== null} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{t('title')}</SheetTitle>
          <SheetDescription>{log && <AuditActionBadge action={log.action} />}</SheetDescription>
        </SheetHeader>
        {log && (
          <div className="space-y-6 px-4 pb-6">
            <dl className="grid grid-cols-2 gap-4">
              <Detail label={t('user')}>{log.user?.name ?? empty}</Detail>
              <Detail label={t('when')}>
                <bdi dir="ltr" className="num">
                  <FormattedDate value={log.created_at} pattern="yyyy-MM-dd HH:mm:ss" />
                </bdi>
              </Detail>
              <Detail label={t('record')}>
                <span className="num">
                  {log.auditable_type ?? empty}
                  {log.auditable_id ? ` #${log.auditable_id}` : ''}
                </span>
              </Detail>
              <Detail label={t('ip')}>
                <span className="num">{log.ip_address ?? empty}</span>
              </Detail>
              <Detail label={t('request')}>
                <span className="num" dir="ltr">
                  {log.http_method ?? ''} {log.url ?? empty}
                </span>
              </Detail>
              <Detail label={t('agent')}>{log.user_agent ?? empty}</Detail>
            </dl>

            <section className="space-y-3">
              <h3 className="text-card-title text-foreground font-semibold">{t('changes')}</h3>
              {changes.length > 0 ? (
                <AuditDiff
                  oldValues={Object.fromEntries(changes.map((c) => [c.field, c.oldValue]))}
                  newValues={Object.fromEntries(changes.map((c) => [c.field, c.newValue]))}
                  getFieldLabel={fieldLabel}
                  formatValue={formatValue}
                />
              ) : (
                <p className="text-small text-muted-foreground">{t('noChanges')}</p>
              )}
            </section>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
