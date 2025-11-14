import { cn } from '@/lib/utils';
import * as React from 'react';

export type Severity = 'critical' | 'high' | 'medium' | 'low';

interface SeverityBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  severity: Severity;
  children?: React.ReactNode; // allow overriding label
}

function deriveAccent(severity: Severity): string {
  switch (severity) {
    case 'critical':
      return 'bg-destructive';
    case 'high':
      return 'bg-destructive/80';
    case 'medium':
      return 'bg-primary';
    case 'low':
    default:
      return 'bg-secondary';
  }
}

export function SeverityBadge({
  severity,
  className,
  children,
  ...rest
}: SeverityBadgeProps) {
  const accent = deriveAccent(severity);
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md border border-border bg-muted text-muted-foreground px-2 py-0.5 text-xs font-medium',
        className
      )}
      {...rest}
    >
      <span className={cn('w-2 h-2 rounded-full', accent)} />
      {children ?? severity}
    </span>
  );
}
