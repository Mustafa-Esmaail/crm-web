'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@crm/ui';

interface OptionSelectProps {
  value: string;
  options: Array<{ value: string; label: string }>;
  label: string;
  disabled?: boolean;
  onChange: (value: string) => void;
}

/** A compact select for the scope and field-access pickers; `label` names it for screen readers. */
export function OptionSelect({ value, options, label, disabled, onChange }: OptionSelectProps) {
  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger aria-label={label} className="w-full sm:w-64">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
