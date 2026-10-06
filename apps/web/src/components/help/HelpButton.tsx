'use client';

import { cn } from '@/lib/utils';
import { HelpCircle } from 'lucide-react';
import { useState } from 'react';

import { HelpDrawer } from './HelpDrawer';
import type { HelpTopic } from './help-topics';

export interface HelpButtonProps {
  topic: HelpTopic;
  /** Heading slug inside the guide to open at (see `HELP_TOPICS`). */
  anchor?: string | undefined;
  /**
   * `button` is the labelled page-header button; `icon` is a small `?` for
   * placing next to a form field.
   */
  variant?: 'button' | 'icon';
  /** Button text for the `button` variant. */
  label?: string;
  /** One-line tooltip (and accessible name for the `icon` variant). */
  tip?: string;
  className?: string;
}

/**
 * Opens a help drawer for `topic`, optionally at a section `anchor`.
 *
 * Reusable across editors: the mob, object, zone and shop editors can add
 * their own topic to `help-topics.ts` and drop in `<HelpButton topic='mobs' />`.
 */
export function HelpButton({
  topic,
  anchor,
  variant = 'button',
  label = 'Help',
  tip,
  className,
}: HelpButtonProps) {
  const [open, setOpen] = useState(false);

  const openDrawer = (event: React.MouseEvent) => {
    // The button often sits inside labels or clickable headers.
    event.preventDefault();
    event.stopPropagation();
    setOpen(true);
  };

  return (
    // Events from the drawer portal bubble through the React tree; stop them
    // here so clicks inside the drawer never reach clickable ancestors.

    <span className='inline-flex' onClick={event => event.stopPropagation()}>
      {variant === 'icon' ? (
        <button
          type='button'
          onClick={openDrawer}
          title={tip}
          aria-label={tip ? `Help: ${tip}` : 'Help'}
          className={cn(
            'inline-flex items-center rounded-full text-muted-foreground hover:text-primary focus:outline-none focus:ring-2 focus:ring-ring',
            className
          )}
        >
          <HelpCircle className='h-4 w-4' aria-hidden='true' />
        </button>
      ) : (
        <button
          type='button'
          onClick={openDrawer}
          title={tip}
          className={cn(
            'inline-flex items-center rounded-md border border-border bg-card px-3 py-2 text-sm font-medium text-foreground shadow-sm hover:bg-muted',
            className
          )}
        >
          <HelpCircle className='mr-2 h-4 w-4' aria-hidden='true' />
          {label}
        </button>
      )}
      <HelpDrawer
        topic={topic}
        anchor={anchor}
        open={open}
        onOpenChange={setOpen}
      />
    </span>
  );
}
