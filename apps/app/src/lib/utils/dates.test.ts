import { describe, expect, it } from 'vitest';

import { fromDateTimeInput, toDateTimeInput } from './dates';

describe('datetime-local helpers', () => {
  it('round-trips an API timestamp through the input format', () => {
    const iso = '2026-11-08T10:30:00.000Z';
    const local = toDateTimeInput(iso);
    expect(local).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
    expect(fromDateTimeInput(local)).toBe(iso);
  });

  it('treats empty and invalid values as missing', () => {
    expect(toDateTimeInput(null)).toBe('');
    expect(toDateTimeInput('not a date')).toBe('');
    expect(fromDateTimeInput('')).toBeNull();
  });
});
