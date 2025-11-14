import { Badge } from './badge';

// Centralized ClimateBadge component; maps climate string to a colored dot while keeping semantic base styling.
const climateDotMap: Record<string, string> = {
  NONE: 'bg-muted-foreground',
  OCEANIC: 'bg-primary',
  TEMPERATE: 'bg-green-600 dark:bg-green-400',
  TROPICAL: 'bg-yellow-500 dark:bg-yellow-300',
  SUBARCTIC: 'bg-cyan-600 dark:bg-cyan-400',
  ARCTIC: 'bg-cyan-600 dark:bg-cyan-400',
  ARID: 'bg-orange-600 dark:bg-orange-400',
  SEMIARID: 'bg-amber-600 dark:bg-amber-400',
  ALPINE: 'bg-purple-600 dark:bg-purple-400',
};

export function ClimateBadge({ climate }: { climate: string }) {
  const dotClass = climateDotMap[climate] || 'bg-muted-foreground';
  return (
    <Badge
      variant='outline'
      className='inline-flex items-center gap-1 bg-muted text-muted-foreground border-border'
    >
      <span className={`h-2 w-2 rounded-full ${dotClass}`} />
      {climate}
    </Badge>
  );
}
