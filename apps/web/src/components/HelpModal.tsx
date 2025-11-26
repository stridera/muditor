'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export type HelpContext =
  | 'global'
  | 'zone-editor'
  | 'room-editor'
  | 'mob-editor'
  | 'object-editor'
  | 'shop-editor';

export interface KeyboardShortcut {
  keys: string;
  description: string;
  implemented?: boolean; // false means "coming soon"
}

export interface HelpSection {
  title: string;
  shortcuts: KeyboardShortcut[];
}

const HELP_CONTENT: Record<HelpContext, HelpSection[]> = {
  global: [
    {
      title: 'Navigation',
      shortcuts: [
        { keys: 'Ctrl+K', description: 'Quick zone/room navigation' },
        { keys: 'Ctrl+G → V', description: 'Go to visual editor (zones)' },
        { keys: 'Ctrl+G → R', description: 'Go to rooms list' },
        { keys: 'Ctrl+G → M', description: 'Go to mobs list' },
        { keys: 'Ctrl+G → O', description: 'Go to objects list' },
        { keys: 'Ctrl+G → S', description: 'Go to shops list' },
        { keys: 'Ctrl+G → Z', description: 'Go to zones list' },
        { keys: 'Ctrl+G → C', description: 'Go to characters' },
        { keys: 'Ctrl+G → U', description: 'Go to users' },
        { keys: 'Ctrl+G → A', description: 'Go to abilities' },
        { keys: 'Ctrl+G → T', description: 'Go to scripts' },
        { keys: 'Ctrl+G → E', description: 'Go to effects' },
        { keys: '?', description: 'Show this help dialog' },
        { keys: 'Esc', description: 'Close dialogs and modals' },
      ],
    },
  ],
  'zone-editor': [
    {
      title: 'Navigation',
      shortcuts: [
        { keys: 'Ctrl+K', description: 'Quick zone/room navigation' },
        { keys: 'Ctrl+G → V', description: 'Go to visual editor (zones)' },
        { keys: 'Ctrl+G → R', description: 'Go to rooms list' },
        { keys: 'Ctrl+G → M', description: 'Go to mobs list' },
        { keys: 'Ctrl+G → O', description: 'Go to objects list' },
        { keys: 'Ctrl+G → S', description: 'Go to shops list' },
        { keys: 'Ctrl+G → Z', description: 'Go to zones list' },
        { keys: 'Ctrl+G → C', description: 'Go to characters' },
        { keys: 'Ctrl+G → U', description: 'Go to users' },
        { keys: 'Ctrl+G → A', description: 'Go to abilities' },
        { keys: 'Ctrl+G → T', description: 'Go to scripts' },
        { keys: 'Ctrl+G → E', description: 'Go to effects' },
        { keys: '?', description: 'Show help dialog' },
      ],
    },
    {
      title: 'View Controls',
      shortcuts: [
        { keys: 'Mouse Wheel', description: 'Zoom in/out' },
        { keys: 'Mouse Drag', description: 'Pan the view' },
        { keys: 'Click Room', description: 'Select room' },
      ],
    },
    {
      title: 'Entity Creation (Chords)',
      shortcuts: [
        {
          keys: 'Ctrl+N → R',
          description: 'Create new room (in direction)',
          implemented: false,
        },
        {
          keys: 'Ctrl+N → M',
          description: 'Create new mob in current room',
          implemented: false,
        },
        {
          keys: 'Ctrl+N → O',
          description: 'Create new object in current room',
          implemented: false,
        },
        {
          keys: 'Ctrl+N → S',
          description: 'Create new shop in current room',
          implemented: false,
        },
        {
          keys: 'Ctrl+N → T',
          description: 'Create new trigger/script',
          implemented: false,
        },
      ],
    },
  ],
  'room-editor': [
    {
      title: 'Navigation',
      shortcuts: [
        { keys: 'Ctrl+K', description: 'Quick zone/room navigation' },
        { keys: '?', description: 'Show help dialog' },
      ],
    },
    {
      title: 'Editing',
      shortcuts: [
        { keys: 'Ctrl+S', description: 'Save room changes' },
        {
          keys: 'Ctrl+N → M',
          description: 'Add mob to this room',
          implemented: false,
        },
        {
          keys: 'Ctrl+N → O',
          description: 'Add object to this room',
          implemented: false,
        },
        {
          keys: 'Ctrl+N → S',
          description: 'Add shop to this room',
          implemented: false,
        },
      ],
    },
  ],
  'mob-editor': [
    {
      title: 'Navigation',
      shortcuts: [
        { keys: 'Ctrl+K', description: 'Quick zone/room navigation' },
        { keys: '?', description: 'Show help dialog' },
      ],
    },
    {
      title: 'Editing',
      shortcuts: [{ keys: 'Ctrl+S', description: 'Save mob changes' }],
    },
  ],
  'object-editor': [
    {
      title: 'Navigation',
      shortcuts: [
        { keys: 'Ctrl+K', description: 'Quick zone/room navigation' },
        { keys: '?', description: 'Show help dialog' },
      ],
    },
    {
      title: 'Editing',
      shortcuts: [{ keys: 'Ctrl+S', description: 'Save object changes' }],
    },
  ],
  'shop-editor': [
    {
      title: 'Navigation',
      shortcuts: [
        { keys: 'Ctrl+K', description: 'Quick zone/room navigation' },
        { keys: '?', description: 'Show help dialog' },
      ],
    },
    {
      title: 'Editing',
      shortcuts: [{ keys: 'Ctrl+S', description: 'Save shop changes' }],
    },
  ],
};

interface HelpModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  context?: HelpContext;
}

export interface GoToHintProps {
  show: boolean;
}

export function GoToHint({ show }: GoToHintProps) {
  if (!show) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center pointer-events-none'>
      <div className='bg-popover border border-border rounded-lg shadow-lg p-4 pointer-events-auto animate-in fade-in zoom-in-95 duration-200'>
        <div className='text-sm font-semibold mb-3 text-foreground'>Go to:</div>
        <div className='grid grid-cols-2 gap-x-6 gap-y-2 text-sm'>
          <div className='flex items-center gap-3'>
            <kbd className='kbd min-w-[1.5rem]'>V</kbd>
            <span className='text-muted-foreground'>Visual Editor</span>
          </div>
          <div className='flex items-center gap-3'>
            <kbd className='kbd min-w-[1.5rem]'>C</kbd>
            <span className='text-muted-foreground'>Characters</span>
          </div>
          <div className='flex items-center gap-3'>
            <kbd className='kbd min-w-[1.5rem]'>R</kbd>
            <span className='text-muted-foreground'>Rooms</span>
          </div>
          <div className='flex items-center gap-3'>
            <kbd className='kbd min-w-[1.5rem]'>U</kbd>
            <span className='text-muted-foreground'>Users</span>
          </div>
          <div className='flex items-center gap-3'>
            <kbd className='kbd min-w-[1.5rem]'>M</kbd>
            <span className='text-muted-foreground'>Mobs</span>
          </div>
          <div className='flex items-center gap-3'>
            <kbd className='kbd min-w-[1.5rem]'>A</kbd>
            <span className='text-muted-foreground'>Abilities</span>
          </div>
          <div className='flex items-center gap-3'>
            <kbd className='kbd min-w-[1.5rem]'>O</kbd>
            <span className='text-muted-foreground'>Objects</span>
          </div>
          <div className='flex items-center gap-3'>
            <kbd className='kbd min-w-[1.5rem]'>T</kbd>
            <span className='text-muted-foreground'>Scripts</span>
          </div>
          <div className='flex items-center gap-3'>
            <kbd className='kbd min-w-[1.5rem]'>S</kbd>
            <span className='text-muted-foreground'>Shops</span>
          </div>
          <div className='flex items-center gap-3'>
            <kbd className='kbd min-w-[1.5rem]'>E</kbd>
            <span className='text-muted-foreground'>Effects</span>
          </div>
          <div className='flex items-center gap-3'>
            <kbd className='kbd min-w-[1.5rem]'>Z</kbd>
            <span className='text-muted-foreground'>Zones</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function HelpModal({
  open,
  onOpenChange,
  context = 'global',
}: HelpModalProps) {
  const sections = HELP_CONTENT[context] || HELP_CONTENT.global;
  const contextTitle =
    context === 'global'
      ? 'Keyboard Shortcuts'
      : `${context
          .split('-')
          .map(w => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ')} Shortcuts`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-2xl'>
        <DialogHeader>
          <DialogTitle>{contextTitle}</DialogTitle>
          <DialogDescription>
            Press <kbd className='kbd'>?</kbd> anytime to view shortcuts for the
            current context
          </DialogDescription>
        </DialogHeader>
        <div className='max-h-[60vh] overflow-y-auto pr-4'>
          <div className='space-y-6'>
            {sections.map((section, idx) => (
              <div key={idx}>
                <h3 className='text-sm font-semibold mb-3'>{section.title}</h3>
                <div className='space-y-2'>
                  {section.shortcuts.map((shortcut, sidx) => (
                    <div
                      key={sidx}
                      className='flex items-center justify-between py-1.5'
                    >
                      <span
                        className={`text-sm ${
                          shortcut.implemented === false
                            ? 'text-muted-foreground'
                            : ''
                        }`}
                      >
                        {shortcut.description}
                        {shortcut.implemented === false && (
                          <span className='text-xs ml-2 text-muted-foreground'>
                            (coming soon)
                          </span>
                        )}
                      </span>
                      <kbd
                        className={`kbd text-xs ${
                          shortcut.implemented === false ? 'opacity-50' : ''
                        }`}
                      >
                        {shortcut.keys}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Hook to manage help modal state and keyboard shortcuts
 * Also handles global navigation shortcuts (Ctrl+G → R/M/O/S/Z)
 */
export function useHelpModal(context: HelpContext = 'global') {
  const [open, setOpen] = useState(false);
  const [showGoToHint, setShowGoToHint] = useState(false);
  const lastKeyRef = useRef<string | null>(null);
  const lastKeyTimeRef = useRef<number>(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;

      // ? key opens help (but not in input fields)
      // Note: ? requires shift key, so we check for '?' character directly
      if (e.key === '?') {
        if (!isInput) {
          e.preventDefault();
          setOpen(true);
        }
        return;
      }

      // Esc closes help or hint
      if (e.key === 'Escape') {
        if (open) {
          e.preventDefault();
          setOpen(false);
        } else if (showGoToHint) {
          e.preventDefault();
          setShowGoToHint(false);
          lastKeyRef.current = null;
        }
        return;
      }

      // Handle 'Ctrl+G' navigation shortcuts (Ctrl+G → R/M/O/S/Z)
      // Only in non-input contexts
      if (!isInput) {
        const now = Date.now();
        const timeSinceLastKey = now - lastKeyTimeRef.current;

        // If 'Ctrl+G' was pressed within the last 1000ms, check for second key
        if (lastKeyRef.current === 'ctrl+g' && timeSinceLastKey < 1000) {
          let targetPath: string | null = null;

          switch (e.key.toLowerCase()) {
            case 'v':
              targetPath = '/dashboard/zones';
              break;
            case 'r':
              targetPath = '/dashboard/rooms';
              break;
            case 'm':
              targetPath = '/dashboard/mobs';
              break;
            case 'o':
              targetPath = '/dashboard/objects';
              break;
            case 's':
              targetPath = '/dashboard/shops';
              break;
            case 'z':
              targetPath = '/dashboard/zones';
              break;
            case 'c':
              targetPath = '/dashboard/characters';
              break;
            case 'u':
              targetPath = '/dashboard/users';
              break;
            case 'a':
              targetPath = '/dashboard/abilities';
              break;
            case 't':
              targetPath = '/dashboard/scripts';
              break;
            case 'e':
              targetPath = '/dashboard/effects';
              break;
          }

          if (targetPath) {
            e.preventDefault();
            setShowGoToHint(false);
            window.location.href = targetPath;
            lastKeyRef.current = null;
            return;
          }
        }

        // Record 'Ctrl+G' key press
        if (e.ctrlKey && e.key.toLowerCase() === 'g') {
          e.preventDefault();
          lastKeyRef.current = 'ctrl+g';
          lastKeyTimeRef.current = now;
          setShowGoToHint(true);
          return;
        }

        // Reset if any other key is pressed
        if (lastKeyRef.current === 'ctrl+g') {
          setShowGoToHint(false);
        }
        lastKeyRef.current = null;
      }
    };

    window.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => {
      window.removeEventListener('keydown', handleKeyDown, { capture: true });
    };
  }, [context, open, showGoToHint]);

  // Auto-hide hint after timeout
  useEffect(() => {
    if (showGoToHint) {
      const timeout = setTimeout(() => {
        setShowGoToHint(false);
        lastKeyRef.current = null;
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [showGoToHint]);

  return { open, setOpen, showGoToHint };
}
