import { cn } from '@crm/ui';
import { Inbox, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  /** Slot for a call to action, e.g. a "create" button. */
  children?: ReactNode;
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon: Icon = Inbox,
  children,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center gap-3 px-6 py-14 text-center', className)}>
      <span className="bg-primary-soft text-primary flex size-12 items-center justify-center rounded-full">
        <Icon className="size-5" strokeWidth={1.75} aria-hidden />
      </span>
      <div className="space-y-1">
        <p className="text-card-title font-semibold">{title}</p>
        {description && <p className="text-small text-muted-foreground max-w-sm">{description}</p>}
      </div>
      {children}
    </div>
  );
}
