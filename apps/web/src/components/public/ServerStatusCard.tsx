'use client';

import { useState } from 'react';
import { Check, Copy, Server } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { usePublicServerStatus } from '@/hooks/use-public-site';
import { MUD_HOST, MUD_PORT, MUD_TLS_PORT } from './mud-config';

function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export function ServerStatusCard() {
  const { status, loading } = usePublicServerStatus();
  const [copied, setCopied] = useState(false);

  // Fall back to env-config values while loading or if the query failed.
  const host = status?.host ?? MUD_HOST;
  const port = status?.port ?? MUD_PORT;
  const tlsPort = status?.tlsPort ?? MUD_TLS_PORT;
  const command = `telnet ${host} ${port}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable (insecure context); the text is still selectable.
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className='flex items-center justify-between gap-2'>
          <CardTitle className='flex items-center gap-2 font-display'>
            <Server className='h-5 w-5 text-primary' aria-hidden />
            Server status
          </CardTitle>
          {status ? (
            <Badge variant={status.online ? 'default' : 'destructive'}>
              {status.online ? 'Online' : 'Offline'}
            </Badge>
          ) : (
            <Badge variant='outline'>
              {loading ? 'Checking...' : 'Unknown'}
            </Badge>
          )}
        </div>
        <CardDescription>Where to find the game.</CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        <dl className='grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm'>
          {status?.online && status.playersOnline != null && (
            <>
              <dt className='text-muted-foreground'>Players online</dt>
              <dd className='font-mono'>{status.playersOnline}</dd>
            </>
          )}
          {status?.online && status.uptimeSeconds != null && (
            <>
              <dt className='text-muted-foreground'>Uptime</dt>
              <dd className='font-mono'>
                {formatUptime(status.uptimeSeconds)}
              </dd>
            </>
          )}
          <dt className='text-muted-foreground'>Host</dt>
          <dd className='font-mono'>{host}</dd>
          <dt className='text-muted-foreground'>Port</dt>
          <dd className='font-mono'>{port}</dd>
          <dt className='text-muted-foreground'>TLS port</dt>
          <dd className='font-mono'>{tlsPort}</dd>
        </dl>
        <div className='flex items-center gap-2'>
          <code className='flex-1 overflow-x-auto rounded-md border border-border bg-muted px-3 py-2 font-mono text-sm'>
            {command}
          </code>
          <Button
            variant='outline'
            size='icon'
            onClick={() => void copy()}
            aria-label={copied ? 'Copied' : 'Copy telnet command'}
          >
            {copied ? (
              <Check className='h-4 w-4' aria-hidden />
            ) : (
              <Copy className='h-4 w-4' aria-hidden />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
