import { describe, expect, it } from 'vitest';

import { amountOrNull, formatAmount, toNumber } from './number';

describe('toNumber', () => {
  it('reads Laravel decimal strings and plain numbers', () => {
    expect(toNumber('3200000.00')).toBe(3200000);
    expect(toNumber(12.5)).toBe(12.5);
  });

  it('returns null for missing or unreadable values', () => {
    expect(toNumber(null)).toBeNull();
    expect(toNumber(undefined)).toBeNull();
    expect(toNumber('')).toBeNull();
    expect(toNumber('abc')).toBeNull();
  });
});

describe('formatAmount', () => {
  it('groups digits for the locale and drops a pointless .00', () => {
    expect(formatAmount('3200000.00', 'en')).toBe('3,200,000');
    expect(formatAmount('1250.5', 'en')).toBe('1,250.5');
  });

  it('returns null when there is nothing to show', () => {
    expect(formatAmount(null, 'en')).toBeNull();
  });
});

describe('amountOrNull', () => {
  it('turns an empty field into null and text into a number', () => {
    expect(amountOrNull('  ')).toBeNull();
    expect(amountOrNull('1500')).toBe(1500);
    expect(amountOrNull('nope')).toBeNull();
  });
});
