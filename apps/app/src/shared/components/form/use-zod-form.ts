'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { type DefaultValues, type FieldValues, useForm, type UseFormReturn } from 'react-hook-form';
import type { z } from 'zod';

/** react-hook-form wired to a zod schema; schema messages are i18n keys that FormField translates. */
export function useZodForm<TInput extends FieldValues, TOutput extends FieldValues>(
  schema: z.ZodType<TOutput, TInput>,
  defaultValues: DefaultValues<TInput>,
): UseFormReturn<TInput, unknown, TOutput> {
  return useForm<TInput, unknown, TOutput>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: 'onTouched',
  });
}
