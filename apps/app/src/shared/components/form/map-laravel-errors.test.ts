import type { ApiError } from '@crm/api-client';
import { describe, expect, it, vi } from 'vitest';

import { SERVER_ERROR_TYPE } from './form-field';
import { mapLaravelErrorsToForm } from './map-laravel-errors';

const error = (fieldErrors: ApiError['fieldErrors'], message = 'Invalid.'): ApiError => ({
  status: 422,
  message,
  fieldErrors,
});

describe('mapLaravelErrorsToForm', () => {
  it('puts the first message of each known field onto that field', () => {
    const setError = vi.fn();

    const result = mapLaravelErrorsToForm(
      error({ email: ['Taken.', 'Also bad.'], name_ar: ['Required.'] }),
      setError,
      ['email', 'name_ar'],
    );

    expect(setError).toHaveBeenCalledWith('email', { type: SERVER_ERROR_TYPE, message: 'Taken.' });
    expect(setError).toHaveBeenCalledWith('name_ar', {
      type: SERVER_ERROR_TYPE,
      message: 'Required.',
    });
    expect(result.unmapped).toEqual([]);
  });

  it('matches nested Laravel keys by their root field', () => {
    const setError = vi.fn();

    mapLaravelErrorsToForm(error({ 'phones.0.number': ['Bad number.'] }), setError, ['phones']);

    expect(setError).toHaveBeenCalledWith('phones.0.number', {
      type: SERVER_ERROR_TYPE,
      message: 'Bad number.',
    });
  });

  it('returns messages for fields the form does not render instead of dropping them', () => {
    const setError = vi.fn();

    const result = mapLaravelErrorsToForm(error({ manager_id: ['Cycle.'] }), setError, ['name']);

    expect(setError).not.toHaveBeenCalled();
    expect(result.unmapped).toEqual(['Cycle.']);
  });

  it('falls back to the top-level message when there are no field errors', () => {
    const result = mapLaravelErrorsToForm(error({}, 'Branch is not empty.'), vi.fn(), ['name']);

    expect(result.unmapped).toEqual(['Branch is not empty.']);
  });
});
