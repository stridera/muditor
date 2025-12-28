'use client';

import { PermissionGuard } from '@/components/auth/permission-guard';
import {
  CommandConsole,
  EventFeed,
  PlayerList,
  ServerStatus,
} from '@/components/admin';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/auth-context';
import { Activity, Monitor, Server, Terminal, Users } from 'lucide-react';

export default function AdminConsolePage() {
  const { user } = useAuth();

  return (
    <PermissionGuard requireCoder>
      <div className='space-y-6'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-bold flex items-center gap-2'>
              <Monitor className='h-6 w-6' />
              Game Server Console
            </h1>
            <p className='text-muted-foreground'>
              Monitor and manage the FieryMUD game server in real-time
            </p>
          </div>
        </div>

        {/* Server Status Overview */}
        <ServerStatus />

        {/* Main Console Interface */}
        <Tabs defaultValue='players' className='space-y-4'>
          <TabsList className='grid w-full grid-cols-3 lg:w-auto lg:inline-flex'>
            <TabsTrigger value='players' className='flex items-center gap-2'>
              <Users className='h-4 w-4' />
              <span className='hidden sm:inline'>Players</span>
            </TabsTrigger>
            <TabsTrigger value='console' className='flex items-center gap-2'>
              <Terminal className='h-4 w-4' />
              <span className='hidden sm:inline'>Console</span>
            </TabsTrigger>
            <TabsTrigger value='events' className='flex items-center gap-2'>
              <Activity className='h-4 w-4' />
              <span className='hidden sm:inline'>Events</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value='players' className='space-y-4'>
            <PlayerList
              onPlayerSelect={playerName => {
                console.log('Selected player:', playerName);
              }}
            />
          </TabsContent>

          <TabsContent value='console' className='space-y-4'>
            <CommandConsole defaultExecutor={user?.username} />
          </TabsContent>

          <TabsContent value='events' className='min-h-[600px]'>
            <EventFeed maxEvents={200} />
          </TabsContent>
        </Tabs>
      </div>
    </PermissionGuard>
  );
}
