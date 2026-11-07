import { paginatedSchema, summarySchema } from '@crm/api-client';
import { z } from 'zod';

export const UNIT_TYPES = [
  'apartment',
  'villa',
  'duplex',
  'townhouse',
  'shop',
  'office',
  'land',
] as const;
export const UNIT_STATUSES = ['available', 'reserved', 'sold'] as const;

const refSchema = z.object({ id: z.number(), name: z.string(), code: z.string().nullable() });

// `price` sits behind a field permission, so it may be absent.
export const unitSchema = z.object({
  id: z.number(),
  project: refSchema,
  building: refSchema.nullish(),
  unit_number: z.string(),
  type: z.enum(UNIT_TYPES),
  floor: z.number().nullable(),
  area_sqm: z.union([z.string(), z.number()]),
  bedrooms: z.number().nullable(),
  bathrooms: z.number().nullable(),
  price: z.union([z.string(), z.number()]).nullish(),
  status: z.enum(UNIT_STATUSES),
  reserved_lead_id: z.number().nullable(),
  reserved_by: summarySchema.nullish(),
  reserved_at: z.string().nullable(),
  reservation_expires_at: z.string().nullable(),
  deposit_amount: z.union([z.string(), z.number()]).nullish(),
  sold_at: z.string().nullable(),
  notes: z.string().nullable(),
  created_at: z.string().nullable(),
});

export const unitListSchema = paginatedSchema(unitSchema);

export type Unit = z.infer<typeof unitSchema>;

// UnitInterestResource: a lead who asked about the unit, sent by id only.
export const unitInterestSchema = z.object({
  id: z.number(),
  unit_id: z.number(),
  lead_id: z.number(),
  note: z.string().nullable(),
  created_by: summarySchema.nullish(),
  created_at: z.string().nullable(),
});

export const unitInterestListSchema = z.object({ data: z.array(unitInterestSchema) });

export type UnitInterest = z.infer<typeof unitInterestSchema>;

/** MediaKind: photos and floor plans are images, a brochure is a PDF. */
export const MEDIA_KINDS = ['photo', 'floor_plan', 'brochure'] as const;
export type MediaKind = (typeof MEDIA_KINDS)[number];

// UnitMediaResource. download_url points at the API itself; the browser uses the proxy instead.
export const unitMediaSchema = z.object({
  id: z.number(),
  unit_id: z.number(),
  kind: z.enum(MEDIA_KINDS),
  original_name: z.string(),
  mime: z.string(),
  size: z.number(),
  download_url: z.string(),
  created_at: z.string().nullable(),
});

export const unitMediaListSchema = z.object({ data: z.array(unitMediaSchema) });

export type UnitMedia = z.infer<typeof unitMediaSchema>;
