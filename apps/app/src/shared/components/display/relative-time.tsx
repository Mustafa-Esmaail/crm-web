'use client';

import { formatDistanceToNow, parseISO } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import { useLocale } from 'next-intl';

interface RelativeTimeProps {
  /** ISO 8601 timestamp, or null/undefined for "never". */
  value: string | null | undefined;
  /** Shown when there is no value. */
  fallback?: string;
}

/** "5 minutes ago" / "قبل 5 دقائق", with the full timestamp as a tooltip. */
export function RelativeTime({ value, fallback = '—' }: RelativeTimeProps) {
  const locale = useLocale();
  if (!value) return <span className="text-text-faint">{fallback}</span>;

  const date = parseISO(value);

  return (
    // Relative text differs between server render and the browser clock, so skip the hydration check.
    <time dateTime={value} title={date.toLocaleString(locale)} suppressHydrationWarning>
      {formatDistanceToNow(date, { addSuffix: true, locale: locale === 'ar' ? ar : enUS })}
    </time>
  );
}
