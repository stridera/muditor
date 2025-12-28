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
import { Progress } from '@/components/ui/progress';
import {
  useGameServerConnected,
  useServerStatus,
} from '@/hooks/use-game-admin';
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Cpu,
  RefreshCw,
  Server,
  Users,
  Wifi,
  WifiOff,
  XCircle,
} from 'lucide-react';
import { useState } from 'react';

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

export function ServerStatus() {
  const {
    connected,
    loading: connectedLoading,
    refetch: refetchConnected,
  } = useGameServerConnected();
  const {
    status,
    loading: statusLoading,
    error,
    refetch: refetchStatus,
  } = useServerStatus();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([refetchConnected(), refetchStatus()]);
    } finally {
      setIsRefreshing(false);
    }
  };

  const loading = connectedLoading || statusLoading;

  if (!connected && !loading) {
    return (
      <Card className='border-red-500/20'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2 text-red-500'>
            <WifiOff className='h-5 w-5' />
            Game Server Disconnected
          </CardTitle>
          <CardDescription>
            Unable to connect to the FieryMUD admin API
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleRefresh}
            variant='outline'
            disabled={isRefreshing}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`}
            />
            Retry Connection
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className='border-yellow-500/20'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2 text-yellow-500'>
            <AlertTriangle className='h-5 w-5' />
            Error Loading Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className='text-sm text-muted-foreground mb-4'>{error.message}</p>
          <Button
            onClick={handleRefresh}
            variant='outline'
            disabled={isRefreshing}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`}
            />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (loading && !status) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Server className='h-5 w-5' />
            Server Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='flex items-center justify-center p-8'>
            <RefreshCw className='h-6 w-6 animate-spin text-muted-foreground' />
          </div>
        </CardContent>
      </Card>
    );
  }

  const { stats, server } = status || { stats: null, server: null };
  const errorRate = stats
    ? (stats.failedCommands / Math.max(stats.totalCommands, 1)) * 100
    : 0;
  const loginSuccessRate = stats
    ? ((stats.totalLogins - stats.failedLogins) /
        Math.max(stats.totalLogins, 1)) *
      100
    : 100;

  return (
    <div className='space-y-4'>
      {/* Connection & Server Info */}
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <div>
              <CardTitle className='flex items-center gap-2'>
                <Server className='h-5 w-5' />
                {server?.name || 'FieryMUD'}
              </CardTitle>
              <CardDescription>
                Server status and connection info
              </CardDescription>
            </div>
            <Button
              variant='ghost'
              size='sm'
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw
                className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
              />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
            <div className='flex items-center gap-2'>
              {server?.running ? (
                <CheckCircle className='h-5 w-5 text-green-500' />
              ) : (
                <XCircle className='h-5 w-5 text-red-500' />
              )}
              <div>
                <p className='text-sm font-medium'>
                  {server?.running ? 'Running' : 'Stopped'}
                </p>
                <p className='text-xs text-muted-foreground'>Status</p>
              </div>
            </div>

            <div className='flex items-center gap-2'>
              <Wifi className='h-5 w-5 text-blue-500' />
              <div>
                <p className='text-sm font-medium'>
                  {server?.port || 4000} / {server?.tlsPort || 4001}
                </p>
                <p className='text-xs text-muted-foreground'>Port / TLS</p>
              </div>
            </div>

            <div className='flex items-center gap-2'>
              <Clock className='h-5 w-5 text-purple-500' />
              <div>
                <p className='text-sm font-medium'>
                  {stats ? formatUptime(stats.uptimeSeconds) : '--'}
                </p>
                <p className='text-xs text-muted-foreground'>Uptime</p>
              </div>
            </div>

            <div className='flex items-center gap-2'>
              {server?.maintenanceMode ? (
                <AlertTriangle className='h-5 w-5 text-yellow-500' />
              ) : (
                <CheckCircle className='h-5 w-5 text-green-500' />
              )}
              <div>
                <p className='text-sm font-medium'>
                  {server?.maintenanceMode ? 'Maintenance' : 'Normal'}
                </p>
                <p className='text-xs text-muted-foreground'>Mode</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Connection Statistics */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium flex items-center gap-2'>
              <Users className='h-4 w-4' />
              Connections
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {stats?.currentConnections ?? '--'}
            </div>
            <div className='flex items-center gap-2 mt-2'>
              <span className='text-xs text-muted-foreground'>
                Peak: {stats?.peakConnections ?? '--'}
              </span>
              <span className='text-xs text-muted-foreground'>•</span>
              <span className='text-xs text-muted-foreground'>
                Total: {stats?.totalConnections ?? '--'}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium flex items-center gap-2'>
              <Activity className='h-4 w-4' />
              Commands/sec
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {stats?.commandsPerSecond?.toFixed(1) ?? '--'}
            </div>
            <div className='mt-2'>
              <Progress value={100 - errorRate} className='h-1' />
              <div className='flex items-center justify-between mt-1'>
                <span className='text-xs text-muted-foreground'>
                  Total: {stats?.totalCommands?.toLocaleString() ?? '--'}
                </span>
                <span className='text-xs text-red-400'>
                  {errorRate.toFixed(1)}% failed
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium flex items-center gap-2'>
              <Cpu className='h-4 w-4' />
              Login Success
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {loginSuccessRate.toFixed(0)}%
            </div>
            <div className='mt-2'>
              <Progress value={loginSuccessRate} className='h-1' />
              <div className='flex items-center justify-between mt-1'>
                <span className='text-xs text-green-400'>
                  {stats ? stats.totalLogins - stats.failedLogins : '--'}{' '}
                  success
                </span>
                <span className='text-xs text-red-400'>
                  {stats?.failedLogins ?? '--'} failed
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
