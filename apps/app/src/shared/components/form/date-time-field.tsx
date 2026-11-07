'use client';

import { Input } from '@crm/ui';
import type { FieldValues } from 'react-hook-form';

import type { FieldProps } from './field-types';
import { FormField } from './form-field';

interface DateTimeFieldProps<TValues extends FieldValues> extends FieldProps<TValues> {
  /** Earliest selectable moment, as "YYYY-MM-DDTHH:mm". */
  min?: string;
}

/** A day and a time of day, held as "YYYY-MM-DDTHH:mm" (the browser's local wall-clock time). */
export function DateTimeField<TValues extends FieldValues>({
  min,
  disabled,
  ...fieldProps
}: DateTimeFieldProps<TValues>) {
  return (
    <FormField {...fieldProps} disabled={disabled}>
      {({ field, id, isInvalid, describedBy }) => (
        <Input
          {...field}
          id={id}
          type="datetime-local"
          dir="ltr"
          value={String(field.value ?? '')}
          min={min}
          disabled={disabled}
          aria-invalid={isInvalid}
          aria-describedby={describedBy}
          className="num ltr-field"
        />
      )}
    </FormField>
  );
}
