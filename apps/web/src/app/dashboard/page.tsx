'use client';

import {
  OnlineCharactersList,
  OnlineStats,
} from '@/components/characters/online-characters-list';
import { DualInterface } from '@/components/dashboard/dual-interface';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { usePermissions } from '@/hooks/use-permissions';
import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import {
  Box,
  FileCode,
  Gamepad2,
  Map,
  Settings,
  ShoppingBag,
  Users,
  Users2,
} from 'lucide-react';
import Link from 'next/link';

const GET_DASHBOARD_STATS = gql`
  query GetDashboardStats {
    zonesCount
    roomsCount
    mobsCount
    objectsCount
    shopsCount
  }
`;

interface DashboardStatsQuery {
  zonesCount: number;
  roomsCount: number;
  mobsCount: number;
  objectsCount: number;
  shopsCount: number;
}

interface DashboardStats {
  zones: number;
  rooms: number;
  mobs: number;
  objects: number;
  shops: number;
}

interface StatItem {
  name: string;
  key: keyof DashboardStats;
  href: string;
  icon: React.ReactNode;
}

export default function DashboardPage() {
  const { loading, error, data } =
    useQuery<DashboardStatsQuery>(GET_DASHBOARD_STATS);
  const { isPlayer, isImmortal } = usePermissions();

  const stats: DashboardStats | null = data
    ? {
        zones: data.zonesCount || 0,
        rooms: data.roomsCount || 0,
        mobs: data.mobsCount || 0,
        objects: data.objectsCount || 0,
        shops: data.shopsCount || 0,
      }
    : null;

  if (error) {
    console.error('GraphQL error:', error);
  }

  const adminStatItems: StatItem[] = [
    {
      name: 'Zones',
      key: 'zones',
      href: '/dashboard/zones',
      icon: <Map className='h-5 w-5' />,
    },
    {
      name: 'Rooms',
      key: 'rooms',
      href: '/dashboard/rooms',
      icon: <Box className='h-5 w-5' />,
    },
    {
      name: 'Mobs',
      key: 'mobs',
      href: '/dashboard/mobs',
      icon: <Users2 className='h-5 w-5' />,
    },
    {
      name: 'Objects',
      key: 'objects',
      href: '/dashboard/objects',
      icon: <Box className='h-5 w-5' />,
    },
    {
      name: 'Shops',
      key: 'shops',
      href: '/dashboard/shops',
      icon: <ShoppingBag className='h-5 w-5' />,
    },
  ];

  // Player-focused dashboard view
  const playerView = (
    <div className='space-y-6'>
      {/* Welcome */}
      <div className='rounded-xl bg-gradient-to-br from-primary/10 via-card to-card border border-border p-6'>
        <h1 className='text-2xl font-display font-bold text-foreground mb-1'>
          Welcome Back
        </h1>
        <p className='text-muted-foreground'>
          Manage your characters and explore the realm.
        </p>
      </div>

      {/* Online Status Stats */}
      <OnlineStats showMyStats={true} />

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Character Management */}
        <Card className='border-border hover:border-primary/30 transition-colors'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Gamepad2 className='h-5 w-5 text-primary' />
              My Characters
            </CardTitle>
            <CardDescription>
              Manage your game characters and view their status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              <Button asChild className='w-full'>
                <Link href='/dashboard/player/characters'>
                  View My Characters
                </Link>
              </Button>
              <div className='text-sm text-muted-foreground'>
                Link your existing game characters to this account to manage
                them here.
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Settings */}
        <Card className='border-border hover:border-primary/30 transition-colors'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Settings className='h-5 w-5 text-primary' />
              Account Settings
            </CardTitle>
            <CardDescription>
              Manage your account preferences and settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              <Button asChild variant='outline' className='w-full'>
                <Link href='/profile'>Edit Profile</Link>
              </Button>
              <div className='text-sm text-muted-foreground'>
                Update your profile, password, and notification preferences.
              </div>
            </div>
          </CardContent>
        </Card>

        {/* My Online Characters */}
        <div className='lg:col-span-1'>
          <OnlineCharactersList
            showAllUsers={false}
            title='My Online Characters'
            maxHeight='300px'
          />
        </div>
      </div>
    </div>
  );

  // Admin-focused dashboard view
  const adminView = (
    <div className='space-y-8'>
      {/* Online Status Overview */}
      <OnlineStats />

      {/* Stats Grid */}
      <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4'>
        {adminStatItems.map(item => (
          <Link key={item.name} href={item.href}>
            <div className='bg-card border border-border rounded-lg p-5 hover:border-primary/40 hover:shadow-md hover:shadow-primary/5 transition-all duration-200 group'>
              <div className='flex items-center gap-3'>
                <span className='text-muted-foreground group-hover:text-primary transition-colors'>
                  {item.icon}
                </span>
                <div>
                  <p className='text-xs font-medium text-muted-foreground uppercase tracking-wide'>
                    {item.name}
                  </p>
                  <p className='text-2xl font-semibold text-foreground'>
                    {loading ? '...' : (stats?.[item.key] ?? '—')}
                  </p>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
        {/* Quick Actions */}
        <div className='lg:col-span-2'>
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                {[
                  {
                    name: 'Browse Zones',
                    href: '/dashboard/zones',
                    icon: <Map className='h-4 w-4' />,
                    desc: 'View and edit zone configurations',
                  },
                  {
                    name: 'Visual Editor',
                    href: '/dashboard/zones/editor?zone=511',
                    icon: <Map className='h-4 w-4' />,
                    desc: 'Edit zones with visual interface',
                  },
                  {
                    name: 'Script Editor',
                    href: '/dashboard/scripts',
                    icon: <FileCode className='h-4 w-4' />,
                    desc: 'Lua script editing with Monaco Editor',
                  },
                  {
                    name: 'View Characters',
                    href: '/dashboard/admin/characters',
                    icon: <Users className='h-4 w-4' />,
                    desc: 'Manage characters and player accounts',
                  },
                  {
                    name: 'Browse Mobs',
                    href: '/dashboard/mobs',
                    icon: <Users2 className='h-4 w-4' />,
                    desc: 'View and edit mob configurations',
                  },
                ].map(action => (
                  <Link
                    key={action.href}
                    href={action.href}
                    className='flex items-start gap-3 p-4 border border-border rounded-lg hover:bg-accent/50 hover:border-primary/30 transition-all duration-200 group'
                  >
                    <span className='text-muted-foreground group-hover:text-primary transition-colors mt-0.5'>
                      {action.icon}
                    </span>
                    <div>
                      <h3 className='font-medium text-foreground text-sm'>
                        {action.name}
                      </h3>
                      <p className='text-xs text-muted-foreground'>
                        {action.desc}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Panel */}
        <div className='space-y-6'>
          {/* Online Characters */}
          <OnlineCharactersList
            showAllUsers={true}
            title='Online Players'
            maxHeight='300px'
          />

          {/* Quick Nav */}
          <Card>
            <CardHeader className='pb-3'>
              <CardTitle className='text-base'>Quick Navigation</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div>
                <h4 className='text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide'>
                  Featured Zones
                </h4>
                <div className='space-y-1'>
                  {[
                    { zone: 12, name: 'The Heavens' },
                    { zone: 30, name: 'Mielikki' },
                    { zone: 489, name: 'Doom' },
                  ].map(z => (
                    <Link
                      key={z.zone}
                      href={`/dashboard/zones/editor?zone=${z.zone}`}
                      className='block text-sm text-primary hover:text-primary/80 hover:underline'
                    >
                      Zone {z.zone} - {z.name}
                    </Link>
                  ))}
                </div>
              </div>

              <div className='border-t border-border pt-3'>
                <h4 className='text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide'>
                  Development Tools
                </h4>
                <div className='space-y-1'>
                  <a
                    href={
                      process.env.NEXT_PUBLIC_GRAPHQL_URL ||
                      'http://localhost:3001/graphql'
                    }
                    target='_blank'
                    rel='noopener noreferrer'
                    className='block text-sm text-primary hover:text-primary/80 hover:underline'
                  >
                    GraphQL Playground
                  </a>
                </div>
              </div>

              <div className='border-t border-border pt-3'>
                <h4 className='text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide'>
                  Entity Shortcuts
                </h4>
                <div className='grid grid-cols-2 gap-2'>
                  {['Mobs', 'Objects', 'Rooms', 'Shops'].map(entity => (
                    <Link
                      key={entity}
                      href={`/dashboard/${entity.toLowerCase()}`}
                      className='text-xs px-2 py-1.5 rounded border border-border bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground hover:border-primary/30 transition-colors text-center'
                    >
                      {entity}
                    </Link>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

  return (
    <DualInterface
      title='Dashboard'
      description='Welcome to Muditor - your MUD world interface'
      playerView={playerView}
      adminView={adminView}
    >
      <div></div>
    </DualInterface>
  );
}
