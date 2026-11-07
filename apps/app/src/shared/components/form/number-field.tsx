'use client';

import { Input } from '@crm/ui';
import type { FieldValues } from 'react-hook-form';

import type { FieldProps } from './field-types';
import { FormField } from './form-field';

interface NumberFieldProps<TValues extends FieldValues> extends FieldProps<TValues> {
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
}

export function NumberField<TValues extends FieldValues>({
  placeholder,
  min,
  max,
  step,
  disabled,
  ...fieldProps
}: NumberFieldProps<TValues>) {
  return (
    <FormField {...fieldProps} disabled={disabled}>
      {({ field, id, isInvalid, describedBy }) => (
        <Input
          {...field}
          id={id}
          type="number"
          inputMode="decimal"
          dir="ltr"
          value={field.value ?? ''}
          // Empty stays undefined (not 0) so an optional number is never silently submitted as zero.
          onChange={(event) =>
            field.onChange(event.target.value === '' ? undefined : Number(event.target.value))
          }
          placeholder={placeholder}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          aria-invalid={isInvalid}
          aria-describedby={describedBy}
          className="num ltr-field"
        />
      )}
    </FormField>
  );
}
