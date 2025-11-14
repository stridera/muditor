'use client';

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

  // View toggle state - read from localStorage (synced by Navigation)
  const [forcePlayerView, setForcePlayerView] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('muditor-view-preference');
      return saved === 'player';
    }
    return false;
  });

  // Listen for localStorage changes (when Navigation updates it)
  useEffect(() => {
    const handleStorageChange = () => {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('muditor-view-preference');
        setForcePlayerView(saved === 'player');
      }
    };

    // Listen for storage events from Navigation component
    window.addEventListener('storage', handleStorageChange);

    // Also check periodically (for same-tab updates)
    const interval = setInterval(handleStorageChange, 500);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
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
        <div className='admin-interface'>{adminView}</div>
      )}

      {/* Show player view for PLAYER role users or when switched */}
      {showPlayerInterface && playerView && (
        <div className='player-interface'>{playerView}</div>
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
