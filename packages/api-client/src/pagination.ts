import { z } from 'zod';

/** Laravel's resource paginator: `{ data, links, meta }`. */
export const paginationMetaSchema = z.object({
  current_page: z.number(),
  from: z.number().nullable(),
  last_page: z.number(),
  per_page: z.number(),
  to: z.number().nullable(),
  total: z.number(),
});

export const paginationLinksSchema = z.object({
  first: z.string().nullable(),
  last: z.string().nullable(),
  prev: z.string().nullable(),
  next: z.string().nullable(),
});

export type PaginationMeta = z.infer<typeof paginationMetaSchema>;
export type PaginationLinks = z.infer<typeof paginationLinksSchema>;

export interface Paginated<T> {
  data: T[];
  meta: PaginationMeta;
  links: PaginationLinks;
}

export function paginatedSchema<T extends z.ZodType>(item: T) {
  return z.object({
    data: z.array(item),
    meta: paginationMetaSchema,
    links: paginationLinksSchema,
  });
}
