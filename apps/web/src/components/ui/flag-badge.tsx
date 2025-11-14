import { cn } from '@/lib/utils';
import React from 'react';

// Semantic badge for flags (room, object, shop, etc.)
// Chooses an accent dot color based on heuristic categories.
export interface FlagBadgeProps {
  flag: string;
  className?: string;
  // Optional override for accent color utility (e.g., 'bg-primary')
  accentClassName?: string;
}

function deriveAccent(flag: string): string {
  const f = flag.toUpperCase();
  if (/LOCK|CLOSE|DEAD|CURSE|POISON|ILL/.test(f)) return 'bg-destructive';
  if (/MAGIC|GLOW|HUM|INVIS|HIDDEN/.test(f)) return 'bg-accent';
  if (/BLESSED|GOOD/.test(f)) return 'bg-primary';
  if (/EVIL|ANTI|NO\w*/.test(f)) return 'bg-destructive';
  return 'bg-border';
}

export const FlagBadge: React.FC<FlagBadgeProps> = ({
  flag,
  className,
  accentClassName,
}) => {
  const accent = accentClassName || deriveAccent(flag);
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium bg-muted text-muted-foreground border border-border',
        className
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full', accent)} />
      {flag.replace('_', ' ')}
    </span>
  );
};
