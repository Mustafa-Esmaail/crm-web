import { describe, expect, it } from 'vitest';

import { DEFAULT_LOCALE, getDirection, isLocale } from './routing';

describe('RTL helpers', () => {
  it('uses right-to-left for Arabic and left-to-right for English', () => {
    expect(getDirection('ar')).toBe('rtl');
    expect(getDirection('en')).toBe('ltr');
  });

  it('defaults to Arabic', () => {
    expect(DEFAULT_LOCALE).toBe('ar');
  });

  it('recognises only supported locales', () => {
    expect(isLocale('ar')).toBe(true);
    expect(isLocale('en')).toBe(true);
    expect(isLocale('fr')).toBe(false);
    expect(isLocale(undefined)).toBe(false);
  });
});
