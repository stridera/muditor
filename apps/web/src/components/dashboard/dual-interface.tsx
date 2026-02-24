'use client';

import { VIEW_MODE_EVENT } from '@/components/navigation/sidebar';
import { usePermissions } from '@/hooks/use-permissions';
import { Loader2 } from 'lucide-react';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';

interface DualInterfaceProps {
  children: ReactNode;
  playerView?: ReactNode;
  adminView?: ReactNode;
  title?: string;
  description?: string;
}

export function DualInterface({
  children,
  playerView,
  adminView,
}: DualInterfaceProps) {
  const { loading, isPlayer, isImmortal } = usePermissions();

  // View toggle state - read from localStorage (synced by Sidebar)
  const [forcePlayerView, setForcePlayerView] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('muditor-view-preference');
      return saved === 'player';
    }
    return false;
  });

  // Listen for custom event from Sidebar (replaces polling)
  useEffect(() => {
    const handleViewModeChange = (e: Event) => {
      const mode = (e as CustomEvent).detail;
      setForcePlayerView(mode === 'player');
    };

    // Listen for custom event from Sidebar
    window.addEventListener(VIEW_MODE_EVENT, handleViewModeChange);

    // Also listen for storage events (cross-tab sync)
    const handleStorageChange = () => {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('muditor-view-preference');
        setForcePlayerView(saved === 'player');
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener(VIEW_MODE_EVENT, handleViewModeChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-[400px] bg-background text-foreground'>
        <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
      </div>
    );
  }

  // Determine interface capabilities
  const canSwitchViews = isImmortal && playerView && adminView;
  const isPlayerOnlyRole = isPlayer;

  // Determine active interface based on role and toggle state
  const showPlayerInterface =
    isPlayerOnlyRole || (canSwitchViews && forcePlayerView);
  const showAdminInterface = isImmortal && !forcePlayerView;
  const showFallbackInterface = !showPlayerInterface && !showAdminInterface;

  return (
    <div className='space-y-6'>
      {/* Show admin view for IMMORTAL+ role users */}
      {showAdminInterface && adminView && (
        <div className='admin-interface animate-fade-in'>{adminView}</div>
      )}

      {/* Show player view for PLAYER role users or when switched */}
      {showPlayerInterface && playerView && (
        <div className='player-interface animate-fade-in'>{playerView}</div>
      )}

      {/* Show fallback interface if no role-specific interface is available */}
      {showFallbackInterface && children}

      {/* Show children as fallback if role-specific view exists but content is missing */}
      {((showAdminInterface && !adminView) ||
        (showPlayerInterface && !playerView)) &&
        children}
    </div>
  );
}
