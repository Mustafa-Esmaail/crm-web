const pad = (value: number) => String(value).padStart(2, '0');

/**
 * An API timestamp ("2026-11-08T10:00:00+00:00") as the "YYYY-MM-DDTHH:mm" a datetime-local
 * input holds, in the viewer's own time zone.
 */
export function toDateTimeInput(iso: string | null | undefined): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** A datetime-local value back to an absolute ISO timestamp, so the API never guesses the zone. */
export function fromDateTimeInput(value: string): string | null {
  if (value === '') return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

/** "Now" as a datetime-local value, for the `min` of a field that must be in the future. */
export function nowDateTimeInput(): string {
  return toDateTimeInput(new Date().toISOString());
}
