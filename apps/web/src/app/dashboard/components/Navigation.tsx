'use client';

import { EnvironmentSelector } from '@/components/environment-selector';
import { Breadcrumb } from '@/components/navigation/breadcrumb';
import { ZoneEntityTabs } from '@/components/navigation/zone-entity-tabs';
import { ThemeToggle } from '@/components/theme-toggle';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/auth-context';
import { gql } from '@/generated/gql';
import { usePermissions } from '@/hooks/use-permissions';
import { useZoneContext } from '@/hooks/use-zone-context';
import { useMutation } from '@apollo/client/react';
import {
  Box,
  Clipboard,
  FileCode,
  HelpCircle,
  Home,
  Inbox,
  LogOut,
  Mail,
  Map,
  MessageCircle,
  ScrollText,
  Settings,
  Shield,
  ShoppingBag,
  Sparkles,
  Swords,
  User,
  Users,
  Users2,
  Vault,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const UPDATE_PREFERENCES = gql(`
  mutation UpdateViewMode($input: UpdatePreferencesInput!) {
    updateUserPreferences(input: $input) {
      id
      preferences {
        viewMode
      }
    }
  }
`);

// Map routes to their display info
const routeInfo: Record<string, { name: string; icon: React.ReactNode }> = {
  '/dashboard': { name: 'Dashboard', icon: <Home className='h-5 w-5' /> },
  '/dashboard/zones': { name: 'Zones', icon: <Map className='h-5 w-5' /> },
  '/dashboard/rooms': { name: 'Rooms', icon: <Box className='h-5 w-5' /> },
  '/dashboard/mobs': { name: 'Mobs', icon: <Users2 className='h-5 w-5' /> },
  '/dashboard/objects': { name: 'Objects', icon: <Box className='h-5 w-5' /> },
  '/dashboard/shops': {
    name: 'Shops',
    icon: <ShoppingBag className='h-5 w-5' />,
  },
  '/dashboard/quests': {
    name: 'Quests',
    icon: <ScrollText className='h-5 w-5' />,
  },
  '/dashboard/scripts': {
    name: 'Scripts',
    icon: <FileCode className='h-5 w-5' />,
  },
  '/dashboard/classes': {
    name: 'Classes',
    icon: <Swords className='h-5 w-5' />,
  },
  '/dashboard/races': {
    name: 'Races',
    icon: <Users className='h-5 w-5' />,
  },
  '/dashboard/effects': {
    name: 'Effects',
    icon: <Zap className='h-5 w-5' />,
  },
  '/dashboard/abilities': {
    name: 'Abilities',
    icon: <Sparkles className='h-5 w-5' />,
  },
  '/dashboard/socials': {
    name: 'Socials',
    icon: <MessageCircle className='h-5 w-5' />,
  },
  '/dashboard/help': {
    name: 'Help',
    icon: <HelpCircle className='h-5 w-5' />,
  },
  '/dashboard/player/characters': {
    name: 'My Characters',
    icon: <Users className='h-5 w-5' />,
  },
  '/dashboard/admin/characters': {
    name: 'All Characters',
    icon: <Users className='h-5 w-5' />,
  },
  '/dashboard/characters': {
    name: 'Characters',
    icon: <Users className='h-5 w-5' />,
  },
  '/dashboard/users': { name: 'Users', icon: <Users className='h-5 w-5' /> },
  '/dashboard/admin/game-config': {
    name: 'Game Config',
    icon: <Settings className='h-5 w-5' />,
  },
  '/dashboard/admin/mail': {
    name: 'Mail Admin',
    icon: <Mail className='h-5 w-5' />,
  },
  '/dashboard/player/mailbox': {
    name: 'Mailbox',
    icon: <Inbox className='h-5 w-5' />,
  },
  '/dashboard/player/storage': {
    name: 'Account Storage',
    icon: <Vault className='h-5 w-5' />,
  },
  '/dashboard/boards': {
    name: 'Boards',
    icon: <Clipboard className='h-5 w-5' />,
  },
};

export function Navigation() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { isImmortal, isCoder, isGod } = usePermissions();
  const { isInZoneContext } = useZoneContext();
  const [updatePreferences] = useMutation(UPDATE_PREFERENCES);

  // View mode state - read from user preferences or localStorage
  const [viewMode, setViewMode] = useState<'player' | 'admin'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('muditor-view-preference');
      return (saved as 'player' | 'admin') || 'admin';
    }
    return 'admin';
  });

  // Sync viewMode to localStorage and database
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('muditor-view-preference', viewMode);
    }
  }, [viewMode]);

  const handleViewModeToggle = async (mode: 'player' | 'admin') => {
    setViewMode(mode);

    // Sync to database
    try {
      await updatePreferences({
        variables: {
          input: { viewMode: mode },
        },
      });
    } catch (error) {
      console.error('Failed to sync view mode:', error);
    }
  };

  // Get current page info
  const getCurrentPageInfo = () => {
    // Check for exact match first
    if (routeInfo[pathname]) {
      return routeInfo[pathname];
    }

    // Check for partial match (e.g., /dashboard/zones/editor)
    const matchingRoute = Object.keys(routeInfo).find(
      route => route !== '/dashboard' && pathname.startsWith(route)
    );

    if (matchingRoute) {
      return routeInfo[matchingRoute];
    }

    return { name: 'Dashboard', icon: <Home className='h-5 w-5' /> };
  };

  const currentPage = getCurrentPageInfo();
  const canSwitchViews = isImmortal;
  const showPlayerView = viewMode === 'player';

  // Quick links based on view mode
  const playerQuickLinks = [
    {
      name: 'My Characters',
      href: '/dashboard/player/characters',
      icon: <Users className='h-4 w-4' />,
    },
    {
      name: 'Mailbox',
      href: '/dashboard/player/mailbox',
      icon: <Inbox className='h-4 w-4' />,
    },
    {
      name: 'Storage',
      href: '/dashboard/player/storage',
      icon: <Vault className='h-4 w-4' />,
    },
    {
      name: 'Help',
      href: '/dashboard/help',
      icon: <HelpCircle className='h-4 w-4' />,
    },
  ];

  const adminQuickLinks = [
    {
      name: 'Zones',
      href: '/dashboard/zones',
      icon: <Map className='h-4 w-4' />,
    },
    {
      name: 'Rooms',
      href: '/dashboard/rooms',
      icon: <Box className='h-4 w-4' />,
    },
    {
      name: 'Mobs',
      href: '/dashboard/mobs',
      icon: <Users2 className='h-4 w-4' />,
    },
    {
      name: 'Objects',
      href: '/dashboard/objects',
      icon: <Box className='h-4 w-4' />,
    },
    {
      name: 'Shops',
      href: '/dashboard/shops',
      icon: <ShoppingBag className='h-4 w-4' />,
    },
    {
      name: 'Quests',
      href: '/dashboard/quests',
      icon: <ScrollText className='h-4 w-4' />,
    },
    {
      name: 'Scripts',
      href: '/dashboard/scripts',
      icon: <FileCode className='h-4 w-4' />,
    },
  ];

  const quickLinks = showPlayerView ? playerQuickLinks : adminQuickLinks;
  const canAccessGameSystems = isCoder || isGod;

  return (
    <nav className='bg-background/95 backdrop-blur-md border-b border-border shadow-sm sticky top-0 z-50'>
      <div className='container mx-auto px-4'>
        <div className='flex items-center h-16'>
          {/* Left: Breadcrumbs and Zone Tabs */}
          <div className='flex items-center gap-4 flex-1'>
            <Breadcrumb />
            <ZoneEntityTabs />
          </div>

          {/* Center: Quick Links (only show when NOT in zone context) */}
          {!isInZoneContext && (
            <div className='hidden md:flex items-center gap-2 flex-1 justify-center'>
              {quickLinks.map(link => {
                const isActive =
                  pathname === link.href ||
                  (link.href !== '/dashboard' &&
                    pathname.startsWith(link.href));

                return (
                  <Link key={link.href} href={link.href}>
                    <Button
                      variant={isActive ? 'default' : 'ghost'}
                      size='sm'
                      className={`flex items-center gap-2 transition-all duration-200 ${
                        isActive
                          ? 'bg-primary text-primary-foreground hover:bg-primary/80'
                          : 'hover:bg-muted'
                      }`}
                    >
                      {link.icon}
                      <span className='hidden lg:inline'>{link.name}</span>
                    </Button>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Right: View Toggle, Theme, Environment, User - Always positioned at the right */}
          <div className='flex items-center gap-3 flex-1 justify-end'>
            {/* View Mode Toggle (only for Immortal+) */}
            {canSwitchViews && (
              <div className='hidden md:flex items-center bg-muted rounded-lg p-1'>
                <Button
                  variant={showPlayerView ? 'default' : 'ghost'}
                  size='sm'
                  onClick={() => handleViewModeToggle('player')}
                  className={`flex items-center gap-1 h-8 transition-all duration-200 ${
                    showPlayerView
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-transparent hover:bg-muted'
                  }`}
                >
                  <Users className='h-4 w-4' />
                  <span className='text-xs'>Player</span>
                </Button>
                <Button
                  variant={!showPlayerView ? 'default' : 'ghost'}
                  size='sm'
                  onClick={() => handleViewModeToggle('admin')}
                  className={`flex items-center gap-1 h-8 transition-all duration-200 ${
                    !showPlayerView
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-transparent hover:bg-muted'
                  }`}
                >
                  <Shield className='h-4 w-4' />
                  <span className='text-xs'>Admin</span>
                </Button>
              </div>
            )}

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Environment Selector */}
            <EnvironmentSelector />

            {/* User Menu */}
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant='ghost' className='h-9 w-9 rounded-full p-0'>
                    <div className='h-9 w-9 bg-primary rounded-full flex items-center justify-center'>
                      <span className='text-primary-foreground text-sm font-medium'>
                        {user.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end' className='w-56'>
                  <DropdownMenuLabel>
                    <div className='flex flex-col gap-1'>
                      <span className='font-medium'>{user.username}</span>
                      <Badge variant='outline' className='w-fit text-xs'>
                        {user.role}
                      </Badge>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href='/profile'>
                      <User className='mr-2 h-4 w-4' />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className='mr-2 h-4 w-4' />
                    Settings
                  </DropdownMenuItem>
                  {canAccessGameSystems && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuLabel className='text-xs text-muted-foreground'>
                        Game Systems
                      </DropdownMenuLabel>
                      <DropdownMenuItem asChild>
                        <Link href='/dashboard/classes'>
                          <Swords className='mr-2 h-4 w-4' />
                          Classes
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href='/dashboard/races'>
                          <Users className='mr-2 h-4 w-4' />
                          Races
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href='/dashboard/effects'>
                          <Zap className='mr-2 h-4 w-4' />
                          Effects
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href='/dashboard/abilities'>
                          <Sparkles className='mr-2 h-4 w-4' />
                          Abilities
                        </Link>
                      </DropdownMenuItem>
                      {isGod && (
                        <DropdownMenuItem asChild>
                          <Link href='/dashboard/socials'>
                            <MessageCircle className='mr-2 h-4 w-4' />
                            Socials
                          </Link>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem asChild>
                        <Link href='/dashboard/boards'>
                          <Clipboard className='mr-2 h-4 w-4' />
                          Boards
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href='/dashboard/help'>
                          <HelpCircle className='mr-2 h-4 w-4' />
                          Help Entries
                        </Link>
                      </DropdownMenuItem>
                      {isGod && (
                        <DropdownMenuItem asChild>
                          <Link href='/dashboard/admin/game-config'>
                            <Settings className='mr-2 h-4 w-4' />
                            Game Config
                          </Link>
                        </DropdownMenuItem>
                      )}
                      {isCoder && (
                        <DropdownMenuItem asChild>
                          <Link href='/dashboard/admin/mail'>
                            <Mail className='mr-2 h-4 w-4' />
                            Mail Admin
                          </Link>
                        </DropdownMenuItem>
                      )}
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout}>
                    <LogOut className='mr-2 h-4 w-4' />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
