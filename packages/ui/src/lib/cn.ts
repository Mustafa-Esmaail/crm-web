import { type ClassValue, clsx } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

/**
 * Our own type scale (`--text-*` in globals.css) is named like colours (`text-small`), so
 * tailwind-merge would take `text-caption` for a colour and silently drop a `text-white` beside it.
 * Declaring the names tells it they are font sizes.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [{ text: ['title', 'card-title', 'small', 'caption'] }],
    },
  },
});

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
