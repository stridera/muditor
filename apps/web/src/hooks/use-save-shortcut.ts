'use client';

import { useEffect, useRef } from 'react';

/**
 * Ctrl/Cmd+S runs `onSave` and suppresses the browser's "save page" dialog.
 *
 * Unlike single-key shortcuts (see `isEditableTarget`), a modifier chord is
 * deliberately honoured while typing: saving from inside the Monaco editor or
 * a form field is the point. Shift/Alt variants are left alone.
 */
export function useSaveShortcut(onSave: () => void, enabled = true) {
  const saveRef = useRef(onSave);
  saveRef.current = onSave;

  useEffect(() => {
    if (!enabled) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey)) return;
      if (event.shiftKey || event.altKey) return;
      if (event.key.toLowerCase() !== 's') return;
      event.preventDefault();
      if (event.repeat) return;
      saveRef.current();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [enabled]);
}
