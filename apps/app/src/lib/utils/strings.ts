/** Form inputs hold '' for "empty"; the API wants null for a cleared nullable column. */
export function emptyToNull(value: string): string | null {
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
}

/** Select and picker fields hold ids as strings; the API wants an integer or null. */
export function idOrNull(value: string): number | null {
  return value === '' ? null : Number(value);
}
