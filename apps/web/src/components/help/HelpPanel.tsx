'use client';

import { Markdown } from '@/components/public/Markdown';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import {
  Children,
  isValidElement,
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
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
  nonce,
}: {
  topic: HelpTopic;
  anchor: string | undefined;
  nonce: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  // The panel header already shows the guide title.
  const body = HELP_TOPICS[topic].content.replace(/^# .*\n/, '');

  // Mounted only while the panel is open. `nonce` bumps on every open request
  // so clicking the same `?` again scrolls back to its section.
  useEffect(() => {
    if (anchor && goToAnchor(containerRef.current, anchor)) return;
    containerRef.current?.focus({ preventScroll: true });
  }, [topic, anchor, nonce]);

  // In-guide links like (#offering-a-quest) scroll the panel instead of
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

const MIN_WIDTH = 320;
const DEFAULT_WIDTH = 420;
const KEY_STEP = 24;
export const HELP_WIDTH_STORAGE_KEY = 'muditor.help.width';
/** Viewports narrower than this get a full-screen panel instead of a dock. */
export const HELP_DOCK_QUERY = '(min-width: 1024px)';

function maxWidth(): number {
  if (typeof window === 'undefined') return 960;
  return Math.max(MIN_WIDTH, Math.floor(window.innerWidth / 2));
}

function clampWidth(width: number): number {
  return Math.min(maxWidth(), Math.max(MIN_WIDTH, Math.round(width)));
}

function readStoredWidth(): number {
  try {
    const raw = window.localStorage.getItem(HELP_WIDTH_STORAGE_KEY);
    const parsed = raw === null ? NaN : Number(raw);
    return clampWidth(Number.isFinite(parsed) ? parsed : DEFAULT_WIDTH);
  } catch {
    return clampWidth(DEFAULT_WIDTH);
  }
}

function useIsDocked(): boolean {
  const [docked, setDocked] = useState(true);
  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;
    const query = window.matchMedia(HELP_DOCK_QUERY);
    const update = () => setDocked(query.matches);
    update();
    query.addEventListener?.('change', update);
    return () => query.removeEventListener?.('change', update);
  }, []);
  return docked;
}

export interface HelpPanelProps {
  topic: HelpTopic;
  /** Heading slug to scroll to and focus. */
  anchor?: string | undefined;
  /** Changes on every open request so the anchor is re-applied. */
  nonce: number;
  onClose: () => void;
}

/**
 * Non-modal docked help panel that renders a markdown guide from
 * `HELP_TOPICS`. No backdrop, no focus trap, no scroll lock: the page beside
 * it stays fully interactive. Rendered by `HelpPanelProvider` as a flex
 * sibling of the dashboard's main content so the content shrinks to make room.
 * Below 1024px it becomes a full-screen panel.
 */
export function HelpPanel({ topic, anchor, nonce, onClose }: HelpPanelProps) {
  const docked = useIsDocked();
  const [width, setWidth] = useState(readStoredWidth);
  const widthRef = useRef(width);
  const drag = useRef<{ startX: number; startWidth: number } | null>(null);

  const commitWidth = useCallback((next: number) => {
    const clamped = clampWidth(next);
    widthRef.current = clamped;
    setWidth(clamped);
    return clamped;
  }, []);

  const persistWidth = useCallback(() => {
    try {
      window.localStorage.setItem(
        HELP_WIDTH_STORAGE_KEY,
        String(widthRef.current)
      );
    } catch {
      // Storage unavailable (private mode); width just isn't remembered.
    }
  }, []);

  // Keep the width within 50vw when the window shrinks.
  useEffect(() => {
    const onResize = () => commitWidth(widthRef.current);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [commitWidth]);

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    drag.current = { startX: event.clientX, startWidth: widthRef.current };
  };
  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!drag.current) return;
    // Panel is docked right: dragging left widens it.
    commitWidth(
      drag.current.startWidth + (drag.current.startX - event.clientX)
    );
  };
  const onPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!drag.current) return;
    drag.current = null;
    event.currentTarget.releasePointerCapture?.(event.pointerId);
    persistWidth();
  };
  const onHandleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    let next: number | null = null;
    // Handle is on the panel's left edge: Left grows the panel.
    if (event.key === 'ArrowLeft') next = widthRef.current + KEY_STEP;
    else if (event.key === 'ArrowRight') next = widthRef.current - KEY_STEP;
    else if (event.key === 'Home') next = MIN_WIDTH;
    else if (event.key === 'End') next = maxWidth();
    if (next === null) return;
    event.preventDefault();
    commitWidth(next);
    persistWidth();
  };

  return (
    <aside
      role='complementary'
      aria-label='Help'
      data-testid='help-panel'
      data-docked={docked}
      style={docked ? { width } : undefined}
      onKeyDown={event => {
        if (event.key === 'Escape') {
          event.stopPropagation();
          onClose();
        }
      }}
      className={cn(
        'relative flex flex-col border-l border-border bg-background',
        docked ? 'h-full flex-shrink-0' : 'fixed inset-0 z-50 w-full'
      )}
    >
      {docked && (
        <div
          role='separator'
          aria-orientation='vertical'
          aria-label='Resize help panel'
          aria-valuenow={width}
          aria-valuemin={MIN_WIDTH}
          aria-valuemax={maxWidth()}
          tabIndex={0}
          data-testid='help-resize-handle'
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onKeyDown={onHandleKeyDown}
          className='absolute inset-y-0 -left-1 z-10 w-2 cursor-col-resize touch-none hover:bg-primary/30 focus-visible:bg-primary/40 focus-visible:outline-none'
        />
      )}
      <header className='flex items-start justify-between gap-2 border-b border-border px-4 py-3'>
        <div>
          <h2 className='text-base font-semibold'>
            {HELP_TOPICS[topic].title}
          </h2>
          <p className='text-xs text-muted-foreground'>
            Help for builders. Close with Esc.
          </p>
        </div>
        <button
          type='button'
          onClick={onClose}
          aria-label='Close help'
          className='rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring'
        >
          <X className='h-4 w-4' aria-hidden='true' />
        </button>
      </header>
      <HelpDocument topic={topic} anchor={anchor} nonce={nonce} />
    </aside>
  );
}
