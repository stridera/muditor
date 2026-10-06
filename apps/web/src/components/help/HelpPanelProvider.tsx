'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { HelpPanel } from './HelpPanel';
import type { HelpTopic } from './help-topics';

interface HelpPanelState {
  open: boolean;
  topic: HelpTopic;
  anchor: string | undefined;
  /** Bumped on every open request so the same anchor is re-applied. */
  nonce: number;
}

export interface HelpPanelApi {
  open: boolean;
  topic: HelpTopic;
  /** Open (or re-point) the panel. `trigger` gets focus back on close. */
  openHelp: (
    topic: HelpTopic,
    anchor?: string,
    trigger?: HTMLElement | null
  ) => void;
  closeHelp: () => void;
}

const HelpPanelContext = createContext<HelpPanelApi | null>(null);
const HelpPanelStateContext = createContext<{
  state: HelpPanelState;
  closeHelp: () => void;
} | null>(null);

export function useHelpPanel(): HelpPanelApi {
  const ctx = useContext(HelpPanelContext);
  if (!ctx) {
    throw new Error('useHelpPanel must be used inside <HelpPanelProvider>');
  }
  return ctx;
}

/**
 * Owns the single help panel for the dashboard. Lives in the dashboard layout
 * so open state and the current topic/anchor survive client-side navigation.
 * Render `<HelpPanelSlot />` as a flex sibling of the main content: the panel
 * docks there and the content shrinks to make room.
 */
export function HelpPanelProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<HelpPanelState>({
    open: false,
    topic: 'quests',
    anchor: undefined,
    nonce: 0,
  });
  const triggerRef = useRef<HTMLElement | null>(null);

  const openHelp = useCallback<HelpPanelApi['openHelp']>(
    (topic, anchor, trigger) => {
      // Keep the first trigger so closing returns focus to where help began.
      if (trigger && !triggerRef.current?.isConnected) {
        triggerRef.current = trigger;
      }
      setState(prev => ({
        open: true,
        topic,
        anchor,
        nonce: prev.nonce + 1,
      }));
    },
    []
  );

  const closeHelp = useCallback(() => {
    const trigger = triggerRef.current;
    triggerRef.current = null;
    setState(prev => ({ ...prev, open: false }));
    if (trigger?.isConnected) trigger.focus();
  }, []);

  const api = useMemo<HelpPanelApi>(
    () => ({ open: state.open, topic: state.topic, openHelp, closeHelp }),
    [state.open, state.topic, openHelp, closeHelp]
  );

  return (
    <HelpPanelContext.Provider value={api}>
      <HelpPanelStateContext.Provider value={{ state, closeHelp }}>
        {children}
      </HelpPanelStateContext.Provider>
    </HelpPanelContext.Provider>
  );
}

/** Where the docked panel renders; place it after `<main>` in a flex row. */
export function HelpPanelSlot() {
  const ctx = useContext(HelpPanelStateContext);
  if (!ctx?.state.open) return null;
  const { state, closeHelp } = ctx;
  return (
    <HelpPanel
      topic={state.topic}
      anchor={state.anchor}
      nonce={state.nonce}
      onClose={closeHelp}
    />
  );
}
