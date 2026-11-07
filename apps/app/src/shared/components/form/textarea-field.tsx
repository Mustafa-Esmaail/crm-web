'use client';

import { Textarea } from '@crm/ui';
import type { FieldValues } from 'react-hook-form';

import type { FieldProps } from './field-types';
import { FormField } from './form-field';

interface TextareaFieldProps<TValues extends FieldValues> extends FieldProps<TValues> {
  placeholder?: string;
  rows?: number;
}

export function TextareaField<TValues extends FieldValues>({
  placeholder,
  rows = 3,
  disabled,
  ...fieldProps
}: TextareaFieldProps<TValues>) {
  return (
    <FormField {...fieldProps} disabled={disabled}>
      {({ field, id, isInvalid, describedBy }) => (
        <Textarea
          {...field}
          id={id}
          rows={rows}
          value={field.value ?? ''}
          placeholder={placeholder}
          disabled={disabled}
          aria-invalid={isInvalid}
          aria-describedby={describedBy}
          className="bg-muted min-h-20"
        />
      )}
    </FormField>
  );
}
