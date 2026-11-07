import { ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

/** The API replaces sensitive attributes with this literal; it is never a real value. */
export const AUDIT_MASKED_VALUE = '[hidden]';

type AuditValues = Record<string, unknown> | null | undefined;

interface AuditDiffProps {
  oldValues: AuditValues;
  newValues: AuditValues;
  /** Maps an attribute key to a human label; unknown keys fall back to the raw key. */
  getFieldLabel?: (key: string) => string;
  /** Lets the caller show a friendlier value, e.g. a team's name for `team_id`; undefined = default. */
  formatValue?: (key: string, value: unknown) => string | undefined;
}

function useFormatValue(custom: AuditDiffProps['formatValue']) {
  const t = useTranslations('audit.diff');

  return (key: string, value: unknown): string => {
    if (value === AUDIT_MASKED_VALUE) return t('hidden');
    if (value === null || value === undefined || value === '') return t('empty');
    const customText = custom?.(key, value);
    if (customText !== undefined) return customText;
    if (typeof value === 'boolean') return value ? t('yes') : t('no');
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };
}

export function AuditDiff({
  oldValues,
  newValues,
  getFieldLabel = (key) => key,
  formatValue,
}: AuditDiffProps) {
  const format = useFormatValue(formatValue);
  const keys = [...new Set([...Object.keys(oldValues ?? {}), ...Object.keys(newValues ?? {})])];

  if (keys.length === 0) return null;

  return (
    <dl className="space-y-2">
      {keys.map((key) => {
        const hasOld = oldValues != null && key in oldValues;
        const hasNew = newValues != null && key in newValues;

        return (
          <div key={key} className="text-small flex flex-wrap items-center gap-2">
            <dt className="text-text-secondary min-w-28 font-medium">{getFieldLabel(key)}</dt>
            <dd className="flex flex-wrap items-center gap-2">
              {hasOld && (
                <span className="bg-destructive-soft text-destructive rounded-sm px-2 py-0.5 line-through">
                  {format(key, oldValues[key])}
                </span>
              )}
              {hasOld && hasNew && (
                <ArrowRight className="text-text-faint size-3.5 rtl:rotate-180" aria-hidden />
              )}
              {hasNew && (
                <span className="bg-success-soft text-success rounded-sm px-2 py-0.5">
                  {format(key, newValues[key])}
                </span>
              )}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}
