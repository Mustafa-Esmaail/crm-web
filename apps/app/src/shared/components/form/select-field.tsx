'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@crm/ui';
import type { FieldValues } from 'react-hook-form';

import type { FieldProps, SelectOption } from './field-types';
import { FormField } from './form-field';

// Radix Select reserves '' to mean "nothing selected", so a real "none" row needs its own value.
const NONE_VALUE = '__none__';

interface SelectFieldProps<TValues extends FieldValues> extends FieldProps<TValues> {
  options: SelectOption[];
  placeholder?: string;
  /** Adds a first row with this label that clears the field back to ''. Omit for required fields. */
  noneLabel?: string;
  /** Runs after the field changes, e.g. to fill dependent fields. Receives '' for "none". */
  onValueChange?: (value: string) => void;
}

export function SelectField<TValues extends FieldValues>({
  options,
  placeholder,
  noneLabel,
  onValueChange,
  disabled,
  ...fieldProps
}: SelectFieldProps<TValues>) {
  return (
    <FormField {...fieldProps} disabled={disabled}>
      {({ field, id, isInvalid, describedBy }) => (
        <Select
          value={field.value ?? ''}
          onValueChange={(value) => {
            const next = value === NONE_VALUE ? '' : value;
            field.onChange(next);
            onValueChange?.(next);
          }}
          disabled={disabled}
          name={field.name}
        >
          <SelectTrigger
            id={id}
            ref={field.ref}
            onBlur={field.onBlur}
            aria-invalid={isInvalid}
            aria-describedby={describedBy}
            className="h-field w-full"
          >
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {noneLabel && <SelectItem value={NONE_VALUE}>{noneLabel}</SelectItem>}
            {options.map((option) => (
              <SelectItem
                key={option.value}
                value={option.value}
                // Tailwind's spacing unit times a step count: 2 is the item's own padding, +4 per level.
                style={
                  option.depth
                    ? { paddingInlineStart: `calc(var(--spacing) * ${2 + option.depth * 4})` }
                    : undefined
                }
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </FormField>
  );
}
