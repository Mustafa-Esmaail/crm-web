export const AVATAR_COLOR_COUNT = 10;

/** Same id always maps to the same palette slot, so a person keeps their colour everywhere. */
export function avatarColorVar(id: number): string {
  return `var(--avatar-${(Math.abs(id) % AVATAR_COLOR_COUNT) + 1})`;
}

/** First letter of the first two words; spreads the string so Arabic/emoji code points stay whole. */
export function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => [...word][0]?.toUpperCase() ?? '')
    .join('');
}
