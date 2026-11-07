import { describe, expect, it } from 'vitest';

import { AVATAR_COLOR_COUNT, avatarColorVar, getInitials } from './avatar-utils';

describe('avatarColorVar', () => {
  it('always gives the same colour for the same id', () => {
    expect(avatarColorVar(42)).toBe(avatarColorVar(42));
  });

  it('maps ids onto the 10 palette slots, starting at 1', () => {
    expect(avatarColorVar(0)).toBe('var(--avatar-1)');
    expect(avatarColorVar(9)).toBe('var(--avatar-10)');
    expect(avatarColorVar(10)).toBe('var(--avatar-1)');
  });

  it('never leaves the palette, even for negative or huge ids', () => {
    for (const id of [-7, -1, 1_000_003, Number.MAX_SAFE_INTEGER]) {
      const slot = Number(/--avatar-(\d+)/.exec(avatarColorVar(id))?.[1]);
      expect(slot).toBeGreaterThanOrEqual(1);
      expect(slot).toBeLessThanOrEqual(AVATAR_COLOR_COUNT);
    }
  });
});

describe('getInitials', () => {
  it('takes the first letter of the first two words', () => {
    expect(getInitials('Demo Owner')).toBe('DO');
    expect(getInitials('agent a1 alex')).toBe('AA');
  });

  it('handles Arabic names and extra whitespace', () => {
    expect(getInitials('  محمد   علي  حسن ')).toBe('مع');
  });

  it('copes with a single word or an empty name', () => {
    expect(getInitials('Sara')).toBe('S');
    expect(getInitials('   ')).toBe('');
  });
});
