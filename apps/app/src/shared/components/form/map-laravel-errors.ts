import type { ApiError } from '@crm/api-client';
import type { FieldValues, Path, UseFormSetError } from 'react-hook-form';

import { SERVER_ERROR_TYPE } from './form-field';

export interface MappedErrors {
  /** Messages for fields the form does not render; show these as a general alert. */
  unmapped: string[];
}

/**
 * Puts a Laravel 422 `errors` bag onto the matching form fields. Dotted keys such as
 * `items.0.name` already match react-hook-form paths, so nested forms need no special case.
 */
export function mapLaravelErrorsToForm<TValues extends FieldValues>(
  error: ApiError,
  setError: UseFormSetError<TValues>,
  knownFields: readonly string[],
): MappedErrors {
  const unmapped: string[] = [];

  for (const [field, messages] of Object.entries(error.fieldErrors)) {
    const message = messages[0];
    if (!message) continue;

    const rootField = field.split('.')[0] ?? field;
    if (knownFields.includes(rootField)) {
      // Laravel keys are runtime strings; knownFields above is the guard that makes them valid paths.
      setError(field as Path<TValues>, { type: SERVER_ERROR_TYPE, message });
    } else {
      unmapped.push(message);
    }
  }

  if (unmapped.length === 0 && Object.keys(error.fieldErrors).length === 0) {
    unmapped.push(error.message);
  }

  return { unmapped };
}
