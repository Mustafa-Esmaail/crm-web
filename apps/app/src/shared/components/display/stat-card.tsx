import { Card, cn, Skeleton } from '@crm/ui';
import type { LucideIcon } from 'lucide-react';

const TONE_CLASSES = {
  primary: 'bg-primary-soft text-primary',
  success: 'bg-success-soft text-success',
  warning: 'bg-warning-soft text-warning',
  info: 'bg-info-soft text-info',
  accent: 'bg-accent-amber-soft text-accent-amber',
} as const;

interface StatCardProps {
  label: string;
  value: number | string | undefined;
  subLabel?: string;
  icon: LucideIcon;
  tone?: keyof typeof TONE_CLASSES;
  isLoading?: boolean;
}

export function StatCard({
  label,
  value,
  subLabel,
  icon: Icon,
  tone = 'primary',
  isLoading,
}: StatCardProps) {
  return (
    <Card className="flex-row items-start justify-between gap-3 px-5 py-4">
      <div className="min-w-0 space-y-1">
        <p className="text-small text-muted-foreground">{label}</p>
        {isLoading ? (
          <Skeleton className="h-8 w-16" />
        ) : (
          <p className="num text-foreground text-2xl leading-8 font-bold">{value ?? '—'}</p>
        )}
        {subLabel && <p className="text-caption text-text-faint">{subLabel}</p>}
      </div>
      <span
        className={cn(
          'flex size-8.5 shrink-0 items-center justify-center rounded-md',
          TONE_CLASSES[tone],
        )}
      >
        <Icon className="size-4.5" strokeWidth={1.75} aria-hidden />
      </span>
    </Card>
  );
}
