import { z } from 'zod';

/**
 * PHP serialises an empty associative array as `[]`, which a plain z.record would reject.
 * Use this wherever Laravel may send a map that is sometimes empty.
 */
export function phpRecord<T extends z.ZodType>(value: T) {
  return z.preprocess(
    (input) => (Array.isArray(input) && input.length === 0 ? {} : input),
    z.record(z.string(), value),
  );
}
