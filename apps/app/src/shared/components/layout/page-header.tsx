import { cn } from '@crm/ui';
import type { ComponentProps } from 'react';

import { Breadcrumbs } from './breadcrumbs';

function Root({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn('mb-6 flex flex-wrap items-start justify-between gap-4', className)}
      {...props}
    />
  );
}

function Heading({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cn('min-w-0 space-y-1.5', className)} {...props} />;
}

function Title({ className, ...props }: ComponentProps<'h1'>) {
  return <h1 className={cn('text-title text-foreground font-bold', className)} {...props} />;
}

function Description({ className, ...props }: ComponentProps<'p'>) {
  return <p className={cn('text-small text-muted-foreground', className)} {...props} />;
}

function Actions({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cn('flex flex-wrap items-center gap-2', className)} {...props} />;
}

/** Compound: PageHeader > Heading (Breadcrumbs, Title, Description) + Actions. */
export const PageHeader = Object.assign(Root, {
  Heading,
  Breadcrumbs,
  Title,
  Description,
  Actions,
});
