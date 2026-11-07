'use client';

import { Switch } from '@crm/ui';
import type { FieldValues } from 'react-hook-form';

import type { FieldProps } from './field-types';
import { FormField } from './form-field';

export function SwitchField<TValues extends FieldValues>({
  disabled,
  ...fieldProps
}: FieldProps<TValues>) {
  return (
    <FormField {...fieldProps} disabled={disabled}>
      {({ field, id, describedBy }) => (
        <Switch
          id={id}
          checked={Boolean(field.value)}
          onCheckedChange={field.onChange}
          onBlur={field.onBlur}
          ref={field.ref}
          disabled={disabled}
          aria-describedby={describedBy}
        />
      )}
    </FormField>
  );
}
