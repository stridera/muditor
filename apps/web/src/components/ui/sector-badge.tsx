import { cn } from '@/lib/utils';
import React from 'react';

export interface SectorBadgeProps {
  sector: string;
  className?: string;
  accentClassName?: string;
}

function deriveAccent(sector: string): string {
  const s = sector.toUpperCase();
  if (/FOREST|FIELD|HILL|MOUNTAIN|PLAIN/.test(s)) return 'bg-secondary';
  if (/WATER|UNDERWATER|SWAMP|RIVER/.test(s)) return 'bg-accent';
  if (/CITY|ROAD|INSIDE|URBAN/.test(s)) return 'bg-primary';
  if (/DESERT|AIR/.test(s)) return 'bg-destructive';
  return 'bg-border';
}

export const SectorBadge: React.FC<SectorBadgeProps> = ({
  sector,
  className,
  accentClassName,
}) => {
  const accent = accentClassName || deriveAccent(sector);
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium bg-muted text-muted-foreground border border-border',
        className
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full', accent)} />
      {sector.replace('_', ' ')}
    </span>
  );
};
