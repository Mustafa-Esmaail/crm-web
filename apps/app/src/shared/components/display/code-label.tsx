import { cn } from '@crm/ui';

interface CodeLabelProps {
  children: string;
  className?: string;
}

/**
 * Codes (branch, department, employee) always read left-to-right. Only the text is isolated:
 * putting dir="ltr" on the paragraph would also flip its alignment away from the name above it.
 */
export function CodeLabel({ children, className }: CodeLabelProps) {
  return (
    <p className={cn('num text-caption text-muted-foreground', className)}>
      <bdi dir="ltr">{children}</bdi>
    </p>
  );
}
