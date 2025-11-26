'use client';

import React, { useEffect, useState } from 'react';
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
        { keys: 'gr', description: 'Go to room', implemented: false },
        { keys: 'gz', description: 'Go to zone', implemented: false },
        { keys: 'gm', description: 'Go to mob', implemented: false },
        { keys: 'go', description: 'Go to object', implemented: false },
        { keys: 'gs', description: 'Go to shop', implemented: false },
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
      title: 'Room Creation',
      shortcuts: [
        {
          keys: 'Ctrl+N North',
          description: 'Create room to the north',
          implemented: false,
        },
        {
          keys: 'Ctrl+N South',
          description: 'Create room to the south',
          implemented: false,
        },
        {
          keys: 'Ctrl+N East',
          description: 'Create room to the east',
          implemented: false,
        },
        {
          keys: 'Ctrl+N West',
          description: 'Create room to the west',
          implemented: false,
        },
        {
          keys: 'Ctrl+N Up',
          description: 'Create room above',
          implemented: false,
        },
        {
          keys: 'Ctrl+N Down',
          description: 'Create room below',
          implemented: false,
        },
      ],
    },
    {
      title: 'Entity Creation',
      shortcuts: [
        {
          keys: 'Ctrl+M',
          description: 'Add mob to current room',
          implemented: false,
        },
        {
          keys: 'Ctrl+O',
          description: 'Add object to current room',
          implemented: false,
        },
        {
          keys: 'Ctrl+Shift+S',
          description: 'Add shop to current room',
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
          keys: 'Ctrl+M',
          description: 'Add mob to this room',
          implemented: false,
        },
        {
          keys: 'Ctrl+O',
          description: 'Add object to this room',
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
 */
export function useHelpModal(context: HelpContext = 'global') {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ? key opens help (but not in input fields)
      // Note: ? requires shift key, so we check for '?' character directly
      if (e.key === '?') {
        const target = e.target as HTMLElement;
        const isInput =
          target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable;

        if (!isInput) {
          e.preventDefault();
          setOpen(true);
        }
      }

      // Esc closes help
      if (e.key === 'Escape') {
        if (open) {
          e.preventDefault();
          setOpen(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [context, open]);

  return { open, setOpen };
}
