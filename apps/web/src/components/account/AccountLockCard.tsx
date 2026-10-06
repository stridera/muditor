'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { QueryError, QueryLoading } from '@/components/public/QueryState';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  useAccountLockStatus,
  useClearAccountLock,
} from '@/hooks/use-game-login';
import { extractErrorMessage } from '@/lib/error-utils';

function formatDuration(totalSeconds: number): string {
  const t = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(t / 3600);
  const m = Math.floor((t % 3600) / 60);
  const s = t % 60;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function useSecondsUntil(iso: string | null | undefined): number | null {
  const [seconds, setSeconds] = useState<number | null>(null);
  useEffect(() => {
    if (!iso) {
      setSeconds(null);
      return;
    }
    const target = new Date(iso).getTime();
    const tick = () => setSeconds(Math.max(0, (target - Date.now()) / 1000));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [iso]);
  return seconds;
}

export function AccountLockCard() {
  const { lock, loading, error, refetch } = useAccountLockStatus();
  const [clearLock, { loading: clearing }] = useClearAccountLock();
  const remaining = useSecondsUntil(lock?.locked ? lock.lockedUntil : null);

  const lockedUntil = lock?.locked ? lock.lockedUntil : null;
  // Refetch once when the countdown hits zero so the card flips to "Not locked".
  useEffect(() => {
    if (!lockedUntil) return;
    const ms = new Date(lockedUntil).getTime() - Date.now();
    const id = setTimeout(() => void refetch(), Math.max(0, ms) + 500);
    return () => clearTimeout(id);
  }, [lockedUntil, refetch]);

  const lockouts = lock?.characterLinkLockouts ?? [];
  const anyLocked = !!lock && (lock.locked || lockouts.length > 0);

  const onClear = async () => {
    try {
      await clearLock();
      await refetch();
      toast.success('Lock cleared.');
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Game login lock</CardTitle>
        <CardDescription>
          The game locks your account after too many wrong passwords. Clearing
          it here is safe because you&apos;re signed in; staff bans can&apos;t
          be cleared here.
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        {loading ? (
          <QueryLoading text='Loading lock status...' />
        ) : error ? (
          <QueryError
            message={extractErrorMessage(error)}
            onRetry={() => void refetch()}
          />
        ) : lock ? (
          <>
            <dl className='grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm'>
              <dt className='text-muted-foreground'>Status</dt>
              <dd>
                {lock.locked ? (
                  <Badge variant='destructive'>Locked</Badge>
                ) : (
                  <Badge variant='secondary'>Not locked</Badge>
                )}
              </dd>
              {lock.locked && lock.lockedUntil && (
                <>
                  <dt className='text-muted-foreground'>Locked until</dt>
                  <dd>
                    {new Date(lock.lockedUntil).toLocaleString()}
                    {remaining !== null && (
                      <span className='ml-2 font-mono text-muted-foreground'>
                        ({formatDuration(remaining)} left)
                      </span>
                    )}
                  </dd>
                </>
              )}
              <dt className='text-muted-foreground'>Failed attempts</dt>
              <dd>{lock.failedLoginAttempts}</dd>
            </dl>

            {lockouts.length > 0 && (
              <div className='space-y-1 text-sm'>
                <p className='font-medium'>Character link lockouts</p>
                <ul className='list-disc pl-6'>
                  {lockouts.map(l => (
                    <li key={l.characterName}>
                      {l.characterName}: {formatDuration(l.remainingSeconds)}{' '}
                      remaining
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <Button onClick={onClear} disabled={!anyLocked || clearing}>
              {clearing ? 'Clearing...' : 'Clear lock'}
            </Button>
          </>
        ) : null}
      </CardContent>
    </Card>
  );
}
