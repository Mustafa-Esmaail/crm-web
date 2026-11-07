import { z } from 'zod';

/** Laravel validation payload: `{ message, errors: { field: [msg, …] } }`. */
const laravelErrorSchema = z.object({
  message: z.string().optional(),
  errors: z.record(z.string(), z.array(z.string())).optional(),
});

export type FieldErrors = Record<string, string[]>;

/** Every failed request, whatever its origin, is reduced to this shape. */
export interface ApiError {
  status: number;
  message: string;
  fieldErrors: FieldErrors;
}

export function normalizeApiError(
  status: number,
  body: unknown,
  fallbackMessage: string,
): ApiError {
  const parsed = laravelErrorSchema.safeParse(body);
  if (!parsed.success) {
    return { status, message: fallbackMessage, fieldErrors: {} };
  }
  return {
    status,
    message: parsed.data.message ?? fallbackMessage,
    fieldErrors: parsed.data.errors ?? {},
  };
}

export function isApiError(value: unknown): value is ApiError {
  return (
    typeof value === 'object' &&
    value !== null &&
    'status' in value &&
    'message' in value &&
    'fieldErrors' in value
  );
}
