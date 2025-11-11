'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useAuth } from '@/contexts/auth-context';
import { usePermissions } from '@/hooks/use-permissions';
import {
  Code,
  Crown,
  Loader2,
  Shield,
  ToggleLeft,
  ToggleRight,
  Users,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { useState } from 'react';

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
  title,
  description,
}: DualInterfaceProps) {
  const { user } = useAuth();
  const { permissions, loading, isPlayer, isImmortal } = usePermissions();

  // View toggle state - for IMMORTAL+ users, allow switching between views
  const [forcePlayerView, setForcePlayerView] = useState(false);

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-[400px]'>
        <Loader2 className='h-8 w-8 animate-spin' />
      </div>
    );
  }

  // Determine interface capabilities
  const canSwitchViews = isImmortal && playerView && adminView;
  const isPlayerOnlyRole = isPlayer || (!loading && user?.role === 'PLAYER');

  // Determine active interface based on role and toggle state
  const showPlayerInterface =
    isPlayerOnlyRole || (canSwitchViews && forcePlayerView);
  const showAdminInterface = isImmortal && !forcePlayerView;
  const showFallbackInterface = !showPlayerInterface && !showAdminInterface;

  return (
    <div className='space-y-6'>
      {/* User Role Indicator */}
      <Card className='border-l-4 border-l-blue-500'>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <div>
              <CardTitle className='flex items-center gap-2'>
                {getRoleIcon(user?.role)}
                {title || 'Dashboard'}
              </CardTitle>
              {description && (
                <CardDescription className='mt-1'>
                  {description}
                </CardDescription>
              )}
            </div>
            <div className='flex items-center gap-2'>
              <Badge variant={getRoleVariant(user?.role)} className='text-xs'>
                {user?.role}
              </Badge>
              <Badge variant='outline' className='text-xs'>
                {showPlayerInterface
                  ? 'Player View'
                  : showAdminInterface
                    ? 'Admin View'
                    : 'Default View'}
              </Badge>
              {canSwitchViews && (
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => setForcePlayerView(!forcePlayerView)}
                  className='flex items-center gap-1 text-xs'
                >
                  {forcePlayerView ? (
                    <>
                      <ToggleRight className='h-4 w-4' />
                      Switch to Admin
                    </>
                  ) : (
                    <>
                      <ToggleLeft className='h-4 w-4' />
                      Switch to Player
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        {permissions && (
          <CardContent className='pt-0'>
            <div className='flex flex-wrap gap-2 text-xs text-muted-foreground'>
              <span>Permissions:</span>
              {permissions.canAccessDashboard && (
                <Badge variant='secondary' className='text-xs'>
                  Dashboard
                </Badge>
              )}
              {permissions.canManageUsers && (
                <Badge variant='secondary' className='text-xs'>
                  User Management
                </Badge>
              )}
              {permissions.canViewValidation && (
                <Badge variant='secondary' className='text-xs'>
                  Validation
                </Badge>
              )}
              <Badge variant='secondary' className='text-xs'>
                Max Character Level: {permissions.maxCharacterLevel}
              </Badge>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Interface Content */}
      <div className='space-y-4'>
        {/* Show admin view first for IMMORTAL+ role users */}
        {showAdminInterface && adminView && (
          <div className='admin-interface'>
            <div className='flex items-center gap-2 mb-4'>
              <Shield className='h-5 w-5 text-purple-600' />
              <h2 className='text-lg font-semibold'>
                Administration Interface
              </h2>
            </div>
            {adminView}
          </div>
        )}

        {/* Show player view for PLAYER role users */}
        {showPlayerInterface && playerView && (
          <div className='player-interface'>
            <div className='flex items-center gap-2 mb-4'>
              <Users className='h-5 w-5 text-blue-600' />
              <h2 className='text-lg font-semibold'>Player Interface</h2>
            </div>
            {playerView}
          </div>
        )}

        {/* Show fallback interface if no role-specific interface is available */}
        {!showPlayerInterface && !showAdminInterface && children}

        {/* Show children as fallback if role-specific view exists but content is missing */}
        {((showAdminInterface && !adminView) ||
          (showPlayerInterface && !playerView)) &&
          children}
      </div>
    </div>
  );
}

function getRoleIcon(role?: string) {
  switch (role) {
    case 'PLAYER':
      return <Users className='h-5 w-5 text-blue-600' />;
    case 'IMMORTAL':
      return <Shield className='h-5 w-5 text-purple-600' />;
    case 'CODER':
      return <Code className='h-5 w-5 text-green-600' />;
    case 'GOD':
      return <Crown className='h-5 w-5 text-yellow-600' />;
    default:
      return <Users className='h-5 w-5 text-gray-600' />;
  }
}

function getRoleVariant(role?: string) {
  switch (role) {
    case 'PLAYER':
      return 'default' as const;
    case 'IMMORTAL':
      return 'secondary' as const;
    case 'CODER':
      return 'outline' as const;
    case 'GOD':
      return 'destructive' as const;
    default:
      return 'default' as const;
  }
}
