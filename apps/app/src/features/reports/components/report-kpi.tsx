'use client';

import { Card, cn, Skeleton } from '@crm/ui';
import type { LucideIcon } from 'lucide-react';
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import type { ReactNode } from 'react';

const TONE_CLASSES = {
  primary: 'bg-primary-soft text-primary',
  success: 'bg-success-soft text-success',
  warning: 'bg-warning-soft text-warning',
  info: 'bg-info-soft text-info',
  accent: 'bg-accent-amber-soft text-accent-amber',
} as const;

interface DeltaProps {
  current: number;
  previous: number | null | undefined;
  /** For counts where less is better (overdue tasks, stale leads, response hours). */
  lowerIsBetter?: boolean;
}

/** Change against the previous period of the same length, coloured by whether it is good news. */
export function Delta({ current, previous, lowerIsBetter = false }: DeltaProps) {
  const t = useTranslations('reports.delta');
  const locale = useLocale();
  if (previous === null || previous === undefined) return null;

  if (current === previous) {
    return (
      <span className="text-caption text-text-faint inline-flex items-center gap-0.5">
        <Minus className="size-3" aria-hidden />
        {t('same')}
      </span>
    );
  }

  const isUp = current > previous;
  const isGood = isUp !== lowerIsBetter;
  const percent =
    previous === 0 ? null : Math.round((Math.abs(current - previous) / previous) * 100);
  const Icon = isUp ? ArrowUpRight : ArrowDownRight;
  const amount = percent === null ? t('new') : `${new Intl.NumberFormat(locale).format(percent)}%`;

  return (
    <span
      className={cn(
        'text-caption inline-flex items-center gap-0.5 font-medium',
        isGood ? 'text-success' : 'text-destructive',
      )}
      title={t('previous', { value: new Intl.NumberFormat(locale).format(previous) })}
    >
      <Icon className="size-3" aria-hidden />
      <span className="num">{amount}</span>
      <span className="sr-only">{t('previous', { value: previous })}</span>
    </span>
  );
}

interface ReportKpiProps {
  label: string;
  value: ReactNode;
  subLabel?: ReactNode;
  icon: LucideIcon;
  tone?: keyof typeof TONE_CLASSES;
  isLoading?: boolean;
  delta?: ReactNode;
}

/** A headline number with its icon, an optional detail line and the change against last period. */
export function ReportKpi({
  label,
  value,
  subLabel,
  icon: Icon,
  tone = 'primary',
  isLoading,
  delta,
}: ReportKpiProps) {
  return (
    <Card className="flex-row items-start justify-between gap-3 px-5 py-4">
      <div className="min-w-0 space-y-1">
        <p className="text-small text-muted-foreground">{label}</p>
        {isLoading ? (
          <Skeleton className="h-8 w-16" />
        ) : (
          <div className="flex flex-wrap items-baseline gap-x-2">
            <p className="num text-foreground text-2xl leading-8 font-bold">{value ?? '—'}</p>
            {delta}
          </div>
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

/** A titled card section of a report. */
export function ReportSection({
  title,
  description,
  action,
  children,
  className,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn('gap-4 p-5', className)}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold">{title}</h2>
          {description && <p className="text-small text-muted-foreground">{description}</p>}
        </div>
        {action}
      </div>
      {children}
    </Card>
  );
}
