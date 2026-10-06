'use client';

import { Markdown } from '@/components/public/Markdown';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Children,
  isValidElement,
  useEffect,
  useRef,
  type ReactNode,
} from 'react';
import type { Components } from 'react-markdown';

import { HELP_TOPICS, type HelpTopic } from './help-topics';
import { helpAnchorId, slugify } from './slug';

function nodeText(node: ReactNode): string {
  return Children.toArray(node)
    .map(child => {
      if (typeof child === 'string' || typeof child === 'number') {
        return String(child);
      }
      if (isValidElement<{ children?: ReactNode }>(child)) {
        return nodeText(child.props.children);
      }
      return '';
    })
    .join('');
}

/** Scroll a heading into view and move keyboard focus to it. */
function goToAnchor(container: HTMLElement | null, slug: string): boolean {
  if (!container) return false;
  const target = container.querySelector<HTMLElement>(
    `[id="${helpAnchorId(slug)}"]`
  );
  if (!target) return false;
  target.scrollIntoView?.({ block: 'start' });
  target.focus({ preventScroll: true });
  return true;
}

const headingComponents: Components = {
  h1: ({ children }) => (
    <h2
      id={helpAnchorId(slugify(nodeText(children)))}
      tabIndex={-1}
      className='mb-3 mt-2 text-2xl font-bold outline-none'
    >
      {children}
    </h2>
  ),
  h2: ({ children }) => (
    <h2
      id={helpAnchorId(slugify(nodeText(children)))}
      tabIndex={-1}
      className='mb-2 mt-8 border-b border-border pb-1 text-xl font-semibold outline-none'
    >
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3
      id={helpAnchorId(slugify(nodeText(children)))}
      tabIndex={-1}
      className='mb-2 mt-6 text-lg font-semibold outline-none'
    >
      {children}
    </h3>
  ),
  h4: ({ children }) => (
    <h4
      id={helpAnchorId(slugify(nodeText(children)))}
      tabIndex={-1}
      className='mb-1 mt-4 font-semibold outline-none'
    >
      {children}
    </h4>
  ),
};

function HelpDocument({
  topic,
  anchor,
}: {
  topic: HelpTopic;
  anchor: string | undefined;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  // The drawer header already shows the guide title.
  const body = HELP_TOPICS[topic].content.replace(/^# .*\n/, '');

  // Mounted only while the drawer is open, so this runs on every open.
  useEffect(() => {
    if (anchor && goToAnchor(containerRef.current, anchor)) return;
    containerRef.current?.focus({ preventScroll: true });
  }, [topic, anchor]);

  // In-guide links like (#offering-a-quest) scroll the drawer instead of
  // changing the page URL.
  const components: Components = {
    ...headingComponents,
    a: ({ href, children }) => {
      if (href?.startsWith('#')) {
        return (
          <a
            href={href}
            className='text-primary underline-offset-2 hover:underline'
            onClick={event => {
              event.preventDefault();
              goToAnchor(containerRef.current, href.slice(1));
            }}
          >
            {children}
          </a>
        );
      }
      return (
        <a
          href={href}
          className='text-primary underline-offset-2 hover:underline'
          target='_blank'
          rel='noopener noreferrer'
        >
          {children}
        </a>
      );
    },
  };

  return (
    <div
      ref={containerRef}
      tabIndex={-1}
      data-testid='help-scroll'
      className='flex-1 overflow-y-auto px-6 pb-8 text-sm outline-none'
    >
      <Markdown components={components}>{body}</Markdown>
    </div>
  );
}

export interface HelpDrawerProps {
  topic: HelpTopic;
  /** Heading slug to scroll to and focus when the drawer opens. */
  anchor?: string | undefined;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Side drawer that renders a markdown help guide from `HELP_TOPICS`.
 *
 * Generic on purpose: the mob, object, zone and shop editors can reuse it by
 * registering their own topic in `help-topics.ts`. Only the quests topic is
 * shipped today.
 */
export function HelpDrawer({
  topic,
  anchor,
  open,
  onOpenChange,
}: HelpDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side='right'
        className='flex w-full flex-col gap-0 p-0 sm:max-w-2xl'
        // We move focus to the requested section ourselves.
        onOpenAutoFocus={event => event.preventDefault()}
      >
        <SheetHeader className='border-b border-border px-6 py-4 pr-12'>
          <SheetTitle>{HELP_TOPICS[topic].title}</SheetTitle>
          <SheetDescription>
            Help for builders. Close with Esc.
          </SheetDescription>
        </SheetHeader>
        <HelpDocument topic={topic} anchor={anchor} />
      </SheetContent>
    </Sheet>
  );
}
