'use client';

import { format, parseISO } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import { useLocale } from 'next-intl';

interface FormattedDateProps {
  /** ISO date or timestamp. */
  value: string | null | undefined;
  /** date-fns pattern; the default reads "3 March 2025". */
  pattern?: string;
  fallback?: string;
}

export function FormattedDate({ value, pattern = 'PPP', fallback = '—' }: FormattedDateProps) {
  const locale = useLocale();
  if (!value) return <span className="text-text-faint">{fallback}</span>;

  return <>{format(parseISO(value), pattern, { locale: locale === 'ar' ? ar : enUS })}</>;
}
