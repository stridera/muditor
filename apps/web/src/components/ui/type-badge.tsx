import { cn } from '@/lib/utils';
import React from 'react';

export interface TypeBadgeProps {
  type: string;
  className?: string;
  accentClassName?: string;
}

function deriveAccent(type: string): string {
  const t = type.toUpperCase();
  // Ability types
  if (/SPELL|SONG|CHANT/.test(t)) return 'bg-accent';
  if (/SKILL/.test(t)) return 'bg-primary';
  // Object types
  if (/WEAPON|KEY|SCROLL|WAND|STAFF/.test(t)) return 'bg-primary';
  if (/ARMOR|CONTAINER|FOOD|LIGHT/.test(t)) return 'bg-secondary';
  if (/POTION|LIQUID|DRINK|FOUNTAIN/.test(t)) return 'bg-accent';
  if (/TRAP/.test(t)) return 'bg-destructive';
  return 'bg-border';
}

export const TypeBadge: React.FC<TypeBadgeProps> = ({
  type,
  className,
  accentClassName,
}) => {
  const accent = accentClassName || deriveAccent(type);
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium bg-muted text-muted-foreground border border-border',
        className
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full', accent)} />
      {type.replace('_', ' ')}
    </span>
  );
};
