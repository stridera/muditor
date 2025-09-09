'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { usePermissions } from '@/hooks/use-permissions';
import { EnvironmentSelector } from '@/components/environment-selector';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  User,
  LogOut,
  Settings,
  Shield,
  Code,
  Crown,
  Users,
} from 'lucide-react';

// Navigation items for different user types
const playerNavItems = [
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'My Characters', href: '/dashboard/characters' },
];

const immortalNavItems = [
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Zones', href: '/dashboard/zones' },
  { name: 'Rooms', href: '/dashboard/rooms' },
  { name: 'Mobs', href: '/dashboard/mobs' },
  { name: 'Objects', href: '/dashboard/objects' },
  { name: 'Shops', href: '/dashboard/shops' },
  { name: 'Scripts', href: '/dashboard/scripts' },
];

const coderNavItems = [
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Zones', href: '/dashboard/zones' },
  { name: 'Rooms', href: '/dashboard/rooms' },
  { name: 'Mobs', href: '/dashboard/mobs' },
  { name: 'Objects', href: '/dashboard/objects' },
  { name: 'Shops', href: '/dashboard/shops' },
  { name: 'Scripts', href: '/dashboard/scripts' },
  { name: 'Validation', href: '/dashboard/validation' },
];

const godNavItems = [
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Zones', href: '/dashboard/zones' },
  { name: 'Rooms', href: '/dashboard/rooms' },
  { name: 'Mobs', href: '/dashboard/mobs' },
  { name: 'Objects', href: '/dashboard/objects' },
  { name: 'Shops', href: '/dashboard/shops' },
  { name: 'Scripts', href: '/dashboard/scripts' },
  { name: 'Validation', href: '/dashboard/validation' },
  { name: 'Users', href: '/dashboard/users' },
];

export function Navigation() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { permissions, isPlayer, isImmortal, isCoder, isGod } =
    usePermissions();

  // Build navigation items based on user role and permissions
  const getNavItems = () => {
    if (isGod) return godNavItems;
    if (isCoder) return coderNavItems;
    if (isImmortal) return immortalNavItems;
    if (isPlayer) return playerNavItems;
    return playerNavItems; // fallback to player view
  };

  const navItems = getNavItems();

  const getRoleIcon = () => {
    switch (user?.role) {
      case 'PLAYER':
        return <Users className='h-4 w-4' />;
      case 'IMMORTAL':
        return <Shield className='h-4 w-4' />;
      case 'CODER':
        return <Code className='h-4 w-4' />;
      case 'GOD':
        return <Crown className='h-4 w-4' />;
      default:
        return <Users className='h-4 w-4' />;
    }
  };

  return (
    <nav className='bg-white shadow-sm border-b'>
      <div className='container mx-auto px-4'>
        <div className='flex items-center justify-between h-16'>
          <div className='flex items-center space-x-8'>
            <Link
              href='/'
              className='text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors'
            >
              Muditor
            </Link>
            <div className='flex space-x-4'>
              {navItems.map(item => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== '/dashboard' &&
                    pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className='flex items-center space-x-4'>
            <EnvironmentSelector />
            {user && (
              <div className='flex items-center space-x-3'>
                <div className='text-sm'>
                  <div className='flex items-center gap-2'>
                    <span className='text-gray-900 font-medium'>
                      {user.username}
                    </span>
                    <Badge
                      variant='outline'
                      className='text-xs flex items-center gap-1'
                    >
                      {getRoleIcon()}
                      {user.role}
                    </Badge>
                  </div>
                  <div className='text-gray-500 text-xs'>
                    {permissions && (
                      <span>
                        Max Character Level: {permissions.maxCharacterLevel}
                      </span>
                    )}
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant='ghost'
                      className='h-8 w-8 rounded-full p-0'
                    >
                      <div className='h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center'>
                        <span className='text-white text-sm font-medium'>
                          {user.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='end'>
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
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
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout}>
                      <LogOut className='mr-2 h-4 w-4' />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
