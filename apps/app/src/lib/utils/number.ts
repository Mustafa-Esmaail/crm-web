/**
 * Laravel serialises decimals as strings ("3200000.00"); this reads either that or a number and
 * returns null for anything that is not a finite number (missing, empty, garbage).
 */
export function toNumber(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined || value === '') return null;
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

/** "3,200,000" in English, with that language's digits and grouping in Arabic. */
export function formatAmount(
  value: string | number | null | undefined,
  locale: string,
): string | null {
  const parsed = toNumber(value);
  if (parsed === null) return null;
  return new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(parsed);
}

/** Form inputs hold text; the API wants a number or null for a cleared amount. */
export function amountOrNull(value: string): number | null {
  const trimmed = value.trim();
  if (trimmed === '') return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}
