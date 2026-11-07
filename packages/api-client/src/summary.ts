import { z } from 'zod';

/** The API's compact `{ id, name }` shape, used wherever one record points at another. */
export const summarySchema = z.object({
  id: z.number(),
  name: z.string(),
});

export type Summary = z.infer<typeof summarySchema>;

/** Standard single-record envelope: `{ data: T }`. */
export function resourceSchema<T extends z.ZodType>(item: T) {
  return z.object({ data: item });
}
