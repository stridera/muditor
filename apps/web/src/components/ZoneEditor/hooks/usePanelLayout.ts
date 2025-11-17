import { useCallback, useEffect, useState } from 'react';

interface PanelLayoutState {
  showEntityPalette: boolean;
  showKeyboardHelp: boolean;
  showLayoutTools: boolean;
  toggleEntityPalette: () => void;
  closeEntityPalette: () => void;
  toggleKeyboardHelp: () => void;
  closeKeyboardHelp: () => void;
  toggleLayoutTools: () => void;
  closeLayoutTools: () => void;
}

const ENTITY_KEY = 'zoneEditor.showEntityPalette';
const KEYBOARD_KEY = 'zoneEditor.showKeyboardHelp';
const LAYOUT_KEY = 'zoneEditor.showLayoutTools';

export function usePanelLayout(): PanelLayoutState {
  const [showEntityPalette, setShowEntityPalette] = useState<boolean>(true);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState<boolean>(false);
  const [showLayoutTools, setShowLayoutTools] = useState<boolean>(false);

  // Load persisted state once
  useEffect(() => {
    try {
      const entityRaw = localStorage.getItem(ENTITY_KEY);
      if (entityRaw !== null) setShowEntityPalette(entityRaw === 'true');
      const keyboardRaw = localStorage.getItem(KEYBOARD_KEY);
      if (keyboardRaw !== null) setShowKeyboardHelp(keyboardRaw === 'true');
      const layoutRaw = localStorage.getItem(LAYOUT_KEY);
      if (layoutRaw !== null) setShowLayoutTools(layoutRaw === 'true');
    } catch {
      // Ignore storage errors (SSR or privacy settings)
    }
  }, []);

  const persist = (key: string, value: boolean) => {
    try {
      localStorage.setItem(key, String(value));
    } catch {
      // ignore
    }
  };

  const toggleEntityPalette = useCallback(() => {
    setShowEntityPalette(prev => {
      const next = !prev;
      persist(ENTITY_KEY, next);
      return next;
    });
  }, []);
  const closeEntityPalette = useCallback(() => {
    setShowEntityPalette(false);
    persist(ENTITY_KEY, false);
  }, []);

  const toggleKeyboardHelp = useCallback(() => {
    setShowKeyboardHelp(prev => {
      const next = !prev;
      persist(KEYBOARD_KEY, next);
      return next;
    });
  }, []);
  const closeKeyboardHelp = useCallback(() => {
    setShowKeyboardHelp(false);
    persist(KEYBOARD_KEY, false);
  }, []);

  const toggleLayoutTools = useCallback(() => {
    setShowLayoutTools(prev => {
      const next = !prev;
      persist(LAYOUT_KEY, next);
      return next;
    });
  }, []);
  const closeLayoutTools = useCallback(() => {
    setShowLayoutTools(false);
    persist(LAYOUT_KEY, false);
  }, []);

  return {
    showEntityPalette,
    showKeyboardHelp,
    showLayoutTools,
    toggleEntityPalette,
    closeEntityPalette,
    toggleKeyboardHelp,
    closeKeyboardHelp,
    toggleLayoutTools,
    closeLayoutTools,
  };
}
