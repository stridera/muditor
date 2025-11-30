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
import { Gamepad2, Settings } from 'lucide-react';
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
    { name: 'Zones', key: 'zones', href: '/dashboard/zones' },
    { name: 'Rooms', key: 'rooms', href: '/dashboard/rooms' },
    { name: 'Mobs', key: 'mobs', href: '/dashboard/mobs' },
    { name: 'Objects', key: 'objects', href: '/dashboard/objects' },
    { name: 'Shops', key: 'shops', href: '/dashboard/shops' },
  ];

  // Player-focused dashboard view
  const playerView = (
    <div className='space-y-6 bg-background text-foreground'>
      {/* Online Status Stats */}
      <OnlineStats showMyStats={true} />

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Character Management */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Gamepad2 className='h-5 w-5' />
              My Characters
            </CardTitle>
            <CardDescription>
              Manage your game characters and view their status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              <Button asChild className='w-full'>
                <Link href='/dashboard/characters'>View My Characters</Link>
              </Button>
              <div className='text-sm text-muted-foreground'>
                Link your existing game characters to this account to manage
                them here.
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Settings */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Settings className='h-5 w-5' />
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
    <>
      {/* Online Status Overview */}
      <div className='mb-8'>
        <OnlineStats />
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8'>
        {adminStatItems.map(item => (
          <Link
            key={item.name}
            href={item.href}
            className='bg-card p-6 rounded-lg shadow hover:shadow-md transition-shadow'
          >
            <div className='flex items-center'>
              <div>
                <p className='text-sm font-medium text-muted-foreground'>
                  {item.name}
                </p>
                <p className='text-2xl font-semibold text-foreground'>
                  {loading ? '...' : (stats?.[item.key] ?? '—')}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
        {/* Quick Actions */}
        <div className='lg:col-span-2'>
          <div className='bg-card rounded-lg shadow p-6'>
            <h2 className='text-xl font-semibold text-foreground mb-4'>
              Quick Actions
            </h2>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <Link
                href='/dashboard/zones'
                className='p-4 border border-border rounded-lg hover:bg-muted transition-colors'
              >
                <h3 className='font-medium text-foreground'>🗺️ Browse Zones</h3>
                <p className='text-sm text-muted-foreground'>
                  View and edit zone configurations
                </p>
              </Link>
              <Link
                href='/dashboard/zones/editor?zone=511'
                className='p-4 border border-border rounded-lg hover:bg-muted transition-colors'
              >
                <h3 className='font-medium text-foreground'>
                  ✏️ Visual Editor
                </h3>
                <p className='text-sm text-muted-foreground'>
                  Edit zones with visual interface
                </p>
              </Link>
              <Link
                href='/dashboard/scripts'
                className='p-4 border border-border rounded-lg hover:bg-muted transition-colors'
              >
                <h3 className='font-medium text-foreground'>
                  📝 Script Editor
                </h3>
                <p className='text-sm text-muted-foreground'>
                  Lua script editing with Monaco Editor
                </p>
              </Link>
              <Link
                href='/dashboard/characters'
                className='p-4 border border-border rounded-lg hover:bg-muted transition-colors'
              >
                <h3 className='font-medium text-foreground'>
                  👥 View Characters
                </h3>
                <p className='text-sm text-muted-foreground'>
                  Manage characters and player accounts
                </p>
              </Link>
              <Link
                href='/dashboard/mobs'
                className='p-4 border border-border rounded-lg hover:bg-muted transition-colors'
              >
                <h3 className='font-medium text-foreground'>👹 Browse Mobs</h3>
                <p className='text-sm text-muted-foreground'>
                  View and edit mob configurations
                </p>
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Navigation Sidebar */}
        <div className='space-y-6'>
          {/* Online Characters */}
          <OnlineCharactersList
            showAllUsers={true}
            title='Online Players'
            maxHeight='300px'
          />

          <div className='bg-card rounded-lg shadow p-6'>
            <h3 className='text-lg font-semibold text-foreground mb-4'>
              🔗 Quick Navigation
            </h3>
            <div className='space-y-3'>
              <div>
                <h4 className='text-sm font-medium text-muted-foreground mb-2'>
                  Featured Zones
                </h4>
                <div className='space-y-1'>
                  <Link
                    href='/dashboard/zones/editor?zone=511'
                    className='block text-sm text-primary hover:text-primary-foreground hover:underline'
                  >
                    📍 Zone 511 - Test Zone
                  </Link>
                  <Link
                    href='/dashboard/zones/editor?zone=1000'
                    className='block text-sm text-primary hover:text-primary-foreground hover:underline'
                  >
                    📍 Zone 1000 - Starting Area
                  </Link>
                  <Link
                    href='/dashboard/zones/editor?zone=1'
                    className='block text-sm text-primary hover:text-primary-foreground hover:underline'
                  >
                    📍 Zone 1 - Main Area
                  </Link>
                </div>
              </div>

              <div className='border-t pt-3'>
                <h4 className='text-sm font-medium text-muted-foreground mb-2'>
                  Development Tools
                </h4>
                <div className='space-y-1'>
                  <a
                    href={
                      process.env.NEXT_PUBLIC_GRAPHQL_URL ||
                      'http://localhost:4000/graphql'
                    }
                    target='_blank'
                    rel='noopener noreferrer'
                    className='block text-sm text-green-600 hover:text-green-800 hover:underline'
                  >
                    🔧 GraphQL Playground
                  </a>
                  <a
                    href='http://localhost:8080'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='block text-sm text-purple-600 hover:text-purple-800 hover:underline'
                  >
                    🗃️ Database Admin
                  </a>
                </div>
              </div>

              <div className='border-t pt-3'>
                <h4 className='text-sm font-medium text-muted-foreground mb-2'>
                  Entity Shortcuts
                </h4>
                <div className='grid grid-cols-2 gap-2'>
                  <Link
                    href='/dashboard/mobs'
                    className='text-xs px-2 py-1 rounded border border-border bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors text-center'
                    aria-label='Manage mobs'
                  >
                    Mobs
                  </Link>
                  <Link
                    href='/dashboard/objects'
                    className='text-xs px-2 py-1 rounded border border-border bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors text-center'
                    aria-label='Manage objects'
                  >
                    Objects
                  </Link>
                  <Link
                    href='/dashboard/rooms'
                    className='text-xs px-2 py-1 rounded border border-border bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors text-center'
                    aria-label='Manage rooms'
                  >
                    Rooms
                  </Link>
                  <Link
                    href='/dashboard/shops'
                    className='text-xs px-2 py-1 rounded border border-border bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors text-center'
                    aria-label='Manage shops'
                  >
                    Shops
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
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
