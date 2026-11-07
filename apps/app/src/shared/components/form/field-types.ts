import type { Control, FieldValues, Path } from 'react-hook-form';

/** The one contract every field obeys, so fields stay interchangeable (Liskov). */
export interface FieldProps<TValues extends FieldValues> {
  name: Path<TValues>;
  label: string;
  control: Control<TValues>;
  disabled?: boolean;
  description?: string;
  isRequired?: boolean;
}

export interface SelectOption {
  value: string;
  label: string;
  /** Nesting level for hierarchical lists; rendered as start-side padding so it flips in RTL. */
  depth?: number;
}
