'use client';

import { useLocale } from 'next-intl';

import { formatAmount } from '@/lib/utils/number';

interface AmountProps {
  value: string | number | null | undefined;
  fallback?: string;
}

/** A money-like figure in the reader's digits; the API has no currency field, so none is shown. */
export function Amount({ value, fallback = '—' }: AmountProps) {
  const locale = useLocale();
  const text = formatAmount(value, locale);

  if (text === null) return <span className="text-text-faint">{fallback}</span>;
  return (
    <bdi dir="ltr" className="num">
      {text}
    </bdi>
  );
}
