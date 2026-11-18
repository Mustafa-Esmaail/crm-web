/** Downloads rows as a UTF-8 CSV (with BOM so Excel shows Arabic correctly). */
export function downloadCsv(
  filename: string,
  header: string[],
  rows: (string | number | null)[][],
) {
  const escape = (cell: string | number | null) => {
    const text = cell === null ? '' : String(cell);
    return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
  };
  const csv = [header, ...rows].map((row) => row.map(escape).join(',')).join('\r\n');
  const url = URL.createObjectURL(new Blob(['﻿', csv], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

/** Response time: minutes under an hour, hours under two days, then days. */
export function formatHours(
  hours: number | null,
  t: (key: 'minutes' | 'hours' | 'days', values: { count: string }) => string,
  locale: string,
): string {
  if (hours === null) return '—';
  const number = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 });
  if (hours < 1) return t('minutes', { count: number.format(Math.round(hours * 60)) });
  if (hours < 48) return t('hours', { count: number.format(hours) });
  return t('days', { count: number.format(Math.round((hours / 24) * 10) / 10) });
}

export function percentOf(part: number, whole: number): number {
  return whole === 0 ? 0 : Math.round((part / whole) * 1000) / 10;
}
