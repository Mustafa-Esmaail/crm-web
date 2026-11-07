export type QueryValue =
  string | number | boolean | null | undefined | readonly (string | number)[];
export type QueryParams = Record<string, QueryValue>;

/**
 * Laravel's `boolean` rule rejects the string "true", so booleans go out as 1/0.
 * Empty values are dropped so cleared filters never reach the API.
 */
export function buildQueryString(params: QueryParams = {}): string {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === null || value === undefined || value === '') continue;

    if (typeof value === 'boolean') {
      search.set(key, value ? '1' : '0');
    } else if (typeof value === 'object') {
      value.forEach((item) => search.append(`${key}[]`, String(item)));
    } else {
      search.set(key, String(value));
    }
  }

  const query = search.toString();
  return query ? `?${query}` : '';
}
