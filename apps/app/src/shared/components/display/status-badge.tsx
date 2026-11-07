import { cn } from '@crm/ui';
import { useTranslations } from 'next-intl';

export type StatusTone = 'success' | 'warning' | 'destructive' | 'info' | 'neutral';

const TONE_CLASSES: Record<StatusTone, { badge: string; dot: string }> = {
  success: { badge: 'bg-success-soft text-success', dot: 'bg-success' },
  warning: { badge: 'bg-warning-soft text-warning', dot: 'bg-warning' },
  destructive: { badge: 'bg-destructive-soft text-destructive', dot: 'bg-destructive' },
  info: { badge: 'bg-info-soft text-info', dot: 'bg-info' },
  neutral: { badge: 'border bg-muted text-muted-foreground', dot: 'bg-text-faint' },
};

// Registry: a new status is one line here plus its label in messages; the component never changes.
export const STATUS_TONES: Record<string, StatusTone> = {
  active: 'success',
  inactive: 'neutral',
  suspended: 'warning',
  left: 'neutral',
  project_planning: 'info',
  project_selling: 'success',
  project_completed: 'neutral',
  unit_available: 'success',
  unit_reserved: 'warning',
  unit_sold: 'neutral',
  export_pending: 'warning',
  export_approved: 'success',
  export_rejected: 'destructive',
  // Appointments and test drives share one lifecycle.
  booking_scheduled: 'info',
  booking_completed: 'success',
  booking_cancelled: 'neutral',
  booking_no_show: 'destructive',
  enrollment_enrolled: 'info',
  enrollment_completed: 'success',
  enrollment_dropped: 'neutral',
  vehicle_available: 'success',
  vehicle_reserved: 'warning',
  vehicle_sold: 'neutral',
  engagement_proposed: 'info',
  engagement_active: 'success',
  engagement_paused: 'warning',
  engagement_ended: 'neutral',
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const t = useTranslations('status');
  const tone = TONE_CLASSES[STATUS_TONES[status] ?? 'neutral'];

  return (
    <span
      className={cn(
        'text-caption inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-medium',
        tone.badge,
        className,
      )}
    >
      <span className={cn('size-1.5 rounded-full', tone.dot)} aria-hidden />
      {t.has(status) ? t(status) : status}
    </span>
  );
}
