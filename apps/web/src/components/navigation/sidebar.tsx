'use client';

import { EnvironmentSelector } from '@/components/environment-selector';
import { ThemeToggle } from '@/components/theme-toggle';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import { gql } from '@/generated/gql';
import { usePermissions } from '@/hooks/use-permissions';
import { useMutation } from '@apollo/client/react';
import {
  Box,
  ChevronLeft,
  ChevronRight,
  Clipboard,
  FileCode,
  Gamepad2,
  HelpCircle,
  Home,
  Inbox,
  LogOut,
  Mail,
  Map,
  Menu,
  MessageCircle,
  Monitor,
  Package,
  ScrollText,
  Settings,
  Shield,
  ShoppingBag,
  Sparkles,
  Swords,
  Terminal,
  Users,
  Users2,
  Vault,
  X,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

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

// Custom event name for view mode sync
export const VIEW_MODE_EVENT = 'muditor-view-mode-change';

interface NavItem {
  name: string;
  href: string;
  icon: React.ReactNode;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { isImmortal, isCoder } = usePermissions();
  const [updatePreferences] = useMutation(UPDATE_PREFERENCES);

  // Collapse state
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('muditor-sidebar-collapsed') === 'true';
    }
    return false;
  });

  // Mobile overlay - listen for external trigger
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setMobileOpen(true);
    window.addEventListener('muditor-sidebar-open', handler);
    return () => window.removeEventListener('muditor-sidebar-open', handler);
  }, []);

  // View mode
  const [viewMode, setViewMode] = useState<'player' | 'admin'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('muditor-view-preference');
      return (saved as 'player' | 'admin') || 'admin';
    }
    return 'admin';
  });

  // Tab memory — remember last path per mode
  const lastPathRef = useRef<{ player: string; admin: string }>(
    (() => {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('muditor-mode-paths');
        if (saved) {
          try {
            return JSON.parse(saved);
          } catch {
            /* ignore */
          }
        }
      }
      return { player: '/dashboard', admin: '/dashboard' };
    })()
  );

  // Track the current path for the active mode
  useEffect(() => {
    if (pathname && pathname !== '/dashboard') {
      lastPathRef.current[viewMode] = pathname;
      localStorage.setItem(
        'muditor-mode-paths',
        JSON.stringify(lastPathRef.current)
      );
    }
  }, [pathname, viewMode]);

  // Persist collapse state
  useEffect(() => {
    localStorage.setItem('muditor-sidebar-collapsed', String(collapsed));
  }, [collapsed]);

  // Sync viewMode to localStorage and dispatch event
  useEffect(() => {
    localStorage.setItem('muditor-view-preference', viewMode);
    window.dispatchEvent(
      new CustomEvent(VIEW_MODE_EVENT, { detail: viewMode })
    );
  }, [viewMode]);

  // Close mobile overlay on navigation
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const handleViewModeToggle = useCallback(
    async (mode: 'player' | 'admin') => {
      setViewMode(mode);

      // Navigate to last known path for the target mode
      const targetPath = lastPathRef.current[mode] || '/dashboard';
      router.push(targetPath);

      try {
        await updatePreferences({
          variables: { input: { viewMode: mode } },
        });
      } catch (error) {
        console.error('Failed to sync view mode:', error);
      }
    },
    [updatePreferences, router]
  );

  const canSwitchViews = isImmortal;
  const showAdminMode = viewMode === 'admin' && isImmortal;
  const canAccessGameSystems = isCoder;

  // Dashboard — always visible at top
  const dashboardItem: NavItem = {
    name: 'Dashboard',
    href: '/dashboard',
    icon: <Home className='h-4 w-4' />,
  };

  // Navigation sections
  const playerSection: NavSection = {
    title: 'PLAYER',
    items: [
      {
        name: 'My Characters',
        href: '/dashboard/player/characters',
        icon: <Gamepad2 className='h-4 w-4' />,
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
    ],
  };

  const worldBuildingSection: NavSection = {
    title: 'WORLD BUILDING',
    items: [
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
    ],
  };

  const gameSystemsItems: NavItem[] = [
    {
      name: 'Classes',
      href: '/dashboard/classes',
      icon: <Swords className='h-4 w-4' />,
    },
    {
      name: 'Races',
      href: '/dashboard/races',
      icon: <Users className='h-4 w-4' />,
    },
    {
      name: 'Effects',
      href: '/dashboard/effects',
      icon: <Zap className='h-4 w-4' />,
    },
    {
      name: 'Abilities',
      href: '/dashboard/abilities',
      icon: <Sparkles className='h-4 w-4' />,
    },
  ];

  if (isCoder) {
    gameSystemsItems.push({
      name: 'Socials',
      href: '/dashboard/socials',
      icon: <MessageCircle className='h-4 w-4' />,
    });
  }

  gameSystemsItems.push(
    {
      name: 'Boards',
      href: '/dashboard/boards',
      icon: <Clipboard className='h-4 w-4' />,
    },
    {
      name: 'Help',
      href: '/dashboard/help',
      icon: <HelpCircle className='h-4 w-4' />,
    }
  );

  const gameSystemsSection: NavSection = {
    title: 'GAME SYSTEMS',
    items: gameSystemsItems,
  };

  const adminItems: NavItem[] = [];
  if (isCoder) {
    adminItems.push({
      name: 'Game Config',
      href: '/dashboard/admin/game-config',
      icon: <Settings className='h-4 w-4' />,
    });
  }
  if (isCoder) {
    adminItems.push(
      {
        name: 'Mail Admin',
        href: '/dashboard/admin/mail',
        icon: <Mail className='h-4 w-4' />,
      },
      {
        name: 'Deployments',
        href: '/dashboard/deployments',
        icon: <Package className='h-4 w-4' />,
      }
    );
  }
  adminItems.push({
    name: 'Console',
    href: '/dashboard/admin/console',
    icon: <Terminal className='h-4 w-4' />,
  });
  if (isCoder) {
    adminItems.push({
      name: 'Users',
      href: '/dashboard/users',
      icon: <Users className='h-4 w-4' />,
    });
  }
  adminItems.push(
    {
      name: 'Characters',
      href: '/dashboard/admin/characters',
      icon: <Users className='h-4 w-4' />,
    },
    {
      name: 'Validation',
      href: '/dashboard/validation',
      icon: <Monitor className='h-4 w-4' />,
    }
  );

  const adminSection: NavSection = {
    title: 'ADMIN',
    items: adminItems,
  };

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  const renderNavItem = (item: NavItem) => {
    const active = isActive(item.href);
    return (
      <Link key={item.href} href={item.href}>
        <div
          className={`group flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all duration-150 ${
            active
              ? 'bg-primary/10 text-primary border-l-2 border-primary font-medium -ml-px'
              : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
          } ${collapsed ? 'justify-center px-2' : ''}`}
          title={collapsed ? item.name : undefined}
        >
          <span
            className={
              active
                ? 'text-primary'
                : 'text-muted-foreground group-hover:text-foreground'
            }
          >
            {item.icon}
          </span>
          {!collapsed && <span>{item.name}</span>}
        </div>
      </Link>
    );
  };

  const renderSection = (section: NavSection) => (
    <div key={section.title} className='animate-fade-in'>
      {!collapsed && (
        <div className='px-3 py-2'>
          <span className='text-[10px] font-semibold tracking-wider text-muted-foreground/70 uppercase'>
            {section.title}
          </span>
        </div>
      )}
      <div className='space-y-0.5'>{section.items.map(renderNavItem)}</div>
    </div>
  );

  const sidebarContent = (
    <div className='flex flex-col h-full'>
      {/* Header */}
      <div className='flex items-center justify-between p-4 border-b border-sidebar-border'>
        {!collapsed && (
          <Link href='/dashboard' className='flex items-center gap-2'>
            <span className='text-lg font-display font-bold text-primary tracking-wide'>
              MUDITOR
            </span>
          </Link>
        )}
        <Button
          variant='ghost'
          size='sm'
          onClick={() => setCollapsed(!collapsed)}
          className='h-8 w-8 p-0 hidden md:flex hover:bg-accent'
        >
          {collapsed ? (
            <ChevronRight className='h-4 w-4' />
          ) : (
            <ChevronLeft className='h-4 w-4' />
          )}
        </Button>
        {/* Mobile close */}
        <Button
          variant='ghost'
          size='sm'
          onClick={() => setMobileOpen(false)}
          className='h-8 w-8 p-0 md:hidden hover:bg-accent'
        >
          <X className='h-4 w-4' />
        </Button>
      </div>

      {/* Mode Toggle */}
      {canSwitchViews && !collapsed && (
        <div className='p-3 border-b border-sidebar-border'>
          <div className='flex rounded-lg bg-muted p-0.5'>
            <button
              onClick={() => handleViewModeToggle('player')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md text-xs font-medium transition-all duration-200 ${
                viewMode === 'player'
                  ? 'bg-copper text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Gamepad2 className='h-3 w-3' />
              Player
            </button>
            <button
              onClick={() => handleViewModeToggle('admin')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md text-xs font-medium transition-all duration-200 ${
                viewMode === 'admin'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Shield className='h-3 w-3' />
              Admin
            </button>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className='flex-1 overflow-y-auto p-2 space-y-4'>
        {/* Dashboard - always visible */}
        <div className='space-y-0.5'>{renderNavItem(dashboardItem)}</div>

        {/* Player section - only in player mode */}
        {!showAdminMode && renderSection(playerSection)}

        {/* Admin sections - only in admin mode */}
        {showAdminMode && (
          <>
            {renderSection(worldBuildingSection)}
            {canAccessGameSystems && renderSection(gameSystemsSection)}
            {renderSection(adminSection)}
          </>
        )}
      </nav>

      {/* Footer */}
      <div className='border-t border-sidebar-border p-3 space-y-3'>
        {/* Tools row */}
        <div
          className={`flex items-center ${collapsed ? 'flex-col gap-2' : 'gap-2'}`}
        >
          <ThemeToggle />
          {!collapsed && <EnvironmentSelector />}
        </div>

        {/* User info */}
        {user && (
          <div
            className={`flex items-center ${collapsed ? 'flex-col gap-2' : 'gap-3'}`}
          >
            <div className='h-8 w-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0'>
              <span className='text-primary-foreground text-sm font-medium'>
                {user.displayName.charAt(0).toUpperCase()}
              </span>
            </div>
            {!collapsed && (
              <div className='flex-1 min-w-0'>
                <div className='text-sm font-medium truncate'>
                  {user.displayName}
                </div>
                <Badge variant='outline' className='text-[10px] h-4 px-1'>
                  {user.role}
                </Badge>
              </div>
            )}
            <Button
              variant='ghost'
              size='sm'
              onClick={logout}
              className='h-8 w-8 p-0 text-muted-foreground hover:text-destructive'
              title='Log out'
            >
              <LogOut className='h-4 w-4' />
            </Button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile hamburger trigger - rendered by TopBar */}
      {/* Desktop sidebar */}
      <aside
        className={`hidden md:flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-200 ${
          collapsed ? 'w-16' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className='fixed inset-0 z-50 md:hidden'>
          <div
            className='fixed inset-0 bg-black/60 backdrop-blur-sm'
            onClick={() => setMobileOpen(false)}
          />
          <aside className='fixed inset-y-0 left-0 w-72 bg-sidebar border-r border-sidebar-border shadow-xl animate-slide-in-left'>
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}

// Dispatch event to open sidebar on mobile
export function openMobileSidebar() {
  window.dispatchEvent(new CustomEvent('muditor-sidebar-open'));
}
