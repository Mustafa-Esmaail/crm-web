import { cn } from '@crm/ui';
import { describe, expect, it } from 'vitest';

describe('cn', () => {
  // Regression: avatar initials lost `text-white` because `text-caption` was read as a colour.
  it('keeps a text colour next to one of our custom font sizes', () => {
    expect(cn('text-white', 'text-caption')).toBe('text-white text-caption');
    expect(cn('text-foreground', 'text-small', 'font-semibold')).toBe(
      'text-foreground text-small font-semibold',
    );
  });

  it('still lets a later class win over an earlier one of the same kind', () => {
    expect(cn('text-small', 'text-caption')).toBe('text-caption');
    expect(cn('text-white', 'text-foreground')).toBe('text-foreground');
    expect(cn('px-2', 'px-4')).toBe('px-4');
  });
});
