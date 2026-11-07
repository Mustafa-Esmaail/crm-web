import { cn } from '@crm/ui';
import { useTranslations } from 'next-intl';

import { AUDIT_ACTION_TONES, AUDIT_FALLBACK_TONE } from '../constants';

export function AuditActionBadge({ action }: { action: string }) {
  const t = useTranslations('auditLog.actions');

  return (
    <span
      className={cn(
        'text-caption inline-flex rounded-full px-2.5 py-0.5 font-semibold',
        AUDIT_ACTION_TONES[action] ?? AUDIT_FALLBACK_TONE,
      )}
    >
      {t.has(action) ? t(action) : action}
    </span>
  );
}
