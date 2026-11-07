import { cn } from '@crm/ui';
import type { CSSProperties } from 'react';

interface StageBadgeProps {
  name: string;
  /** The pipeline colour the API stores for the stage (a CSS colour). */
  color: string;
  className?: string;
}

/**
 * Stages are configured per company, so their colour is data, not a design token. It is handed
 * to CSS as one variable and the tint and text are derived from it, so light and dark both work.
 */
export function StageBadge({ name, color, className }: StageBadgeProps) {
  return (
    <span
      style={{ '--stage': color } as CSSProperties}
      className={cn(
        'text-caption inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-semibold whitespace-nowrap',
        'bg-[color-mix(in_oklab,var(--stage)_16%,transparent)] text-[color-mix(in_oklab,var(--stage)_75%,var(--foreground))]',
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-[var(--stage)]" aria-hidden />
      {name}
    </span>
  );
}
