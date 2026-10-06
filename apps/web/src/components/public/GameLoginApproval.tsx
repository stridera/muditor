'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { CheckCircle2, Lock, ShieldAlert, Unlock, XCircle } from 'lucide-react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/auth-context';
import {
  useApproveGameLogin,
  useDenyGameLogin,
  useGameLoginLookup,
} from '@/hooks/use-game-login';
import { extractErrorMessage } from '@/lib/error-utils';
import { QueryLoading } from './QueryState';

/** Uppercase, strip non-alphanumerics, and insert the hyphen after 4 chars. */
export function normalizeCode(raw: string): string {
  const clean = raw
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 8);
  return clean.length > 4 ? `${clean.slice(0, 4)}-${clean.slice(4)}` : clean;
}

function formatRemaining(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function useCountdown(expiresAt: string | undefined): number | null {
  const [remaining, setRemaining] = useState<number | null>(null);
  useEffect(() => {
    if (!expiresAt) {
      setRemaining(null);
      return;
    }
    const target = new Date(expiresAt).getTime();
    const tick = () => setRemaining(Math.max(0, target - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [expiresAt]);
  return remaining;
}

type Outcome = 'approved' | 'denied' | null;

export function GameLoginApproval() {
  const { user, loading: authLoading } = useAuth();
  const pathname = usePathname() ?? '/verify';
  const searchParams = useSearchParams();
  const initial = normalizeCode(searchParams.get('code') ?? '');

  const [code, setCode] = useState(initial);
  const [outcome, setOutcome] = useState<Outcome>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [characterPassword, setCharacterPassword] = useState('');
  const { lookup, request, loading, error } = useGameLoginLookup();
  const [approve, { loading: approving }] = useApproveGameLogin();
  const [deny, { loading: denying }] = useDenyGameLogin();
  const remaining = useCountdown(request?.expiresAt);

  const userId = user?.id;
  // Auto-lookup a prefilled, complete code once logged in.
  useEffect(() => {
    if (userId && initial.length === 9) {
      void lookup({ variables: { code: initial } }).catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, initial]);

  if (authLoading) return <QueryLoading />;

  if (!user) {
    const next = `${pathname}${initial ? `?code=${initial}` : ''}`;
    return (
      <Card>
        <CardHeader>
          <CardTitle>Log in to continue</CardTitle>
          <CardDescription>
            When you connect to the game and type <code>code</code> at the
            password prompt, the game gives you a short login code. Approving it
            here, from your logged-in account, signs that connection in without
            typing a password into your game client.
          </CardDescription>
        </CardHeader>
        <CardContent className='flex flex-wrap items-center gap-3'>
          <Button asChild>
            <Link href={`/login?redirect=${encodeURIComponent(next)}`}>
              Log in
            </Link>
          </Button>
          <Link
            href='/register'
            className='text-sm text-primary hover:underline'
          >
            Need an account? Sign up
          </Link>
        </CardContent>
      </Card>
    );
  }

  const busy = approving || denying;
  const pending =
    request?.status === 'PENDING' && (remaining === null || remaining > 0);

  const doLookup = (e: React.FormEvent) => {
    e.preventDefault();
    setOutcome(null);
    setActionError(null);
    setCharacterPassword('');
    if (code.length === 9) {
      void lookup({ variables: { code } }).catch(() => {});
    }
  };

  const linkRequired = request?.linkRequired === true;
  const canLink = linkRequired && request?.characterHasPassword === true;
  const accountLabel = user.email || user.displayName;

  const doApprove = async () => {
    if (!request) return;
    setActionError(null);
    try {
      await approve({
        variables: {
          code: request.code,
          ...(linkRequired ? { characterPassword } : {}),
        },
      });
      setCharacterPassword('');
      setOutcome('approved');
    } catch (err) {
      setCharacterPassword('');
      setActionError(extractErrorMessage(err));
    }
  };

  const doDeny = async () => {
    if (!request) return;
    setActionError(null);
    try {
      await deny({ variables: { code: request.code } });
      setOutcome('denied');
    } catch (err) {
      setActionError(extractErrorMessage(err));
    }
  };

  return (
    <div className='space-y-6'>
      <form onSubmit={doLookup} className='flex flex-wrap items-end gap-3'>
        <div className='space-y-2'>
          <Label htmlFor='login-code'>Login code</Label>
          <Input
            id='login-code'
            value={code}
            onChange={e => setCode(normalizeCode(e.target.value))}
            placeholder='ABCD-EFGH'
            autoComplete='off'
            autoCapitalize='characters'
            spellCheck={false}
            inputMode='text'
            className='w-48 font-mono text-lg tracking-widest'
          />
        </div>
        <Button type='submit' disabled={code.length !== 9 || loading}>
          {loading ? 'Looking up...' : 'Look up'}
        </Button>
      </form>

      {error && (
        <Alert variant='destructive' role='alert'>
          <AlertDescription>
            {extractErrorMessage(error)}. This code may have expired or already
            been used. Type <code>code</code> at the game password prompt to
            request a new one.
          </AlertDescription>
        </Alert>
      )}

      {outcome === 'approved' && (
        <Alert role='status'>
          <CheckCircle2 className='h-4 w-4' />
          <AlertDescription>
            {linkRequired
              ? 'Linked and approved. Return to your game client and press Enter.'
              : 'Approved. Return to your game client and press Enter.'}
          </AlertDescription>
        </Alert>
      )}
      {outcome === 'denied' && (
        <Alert role='status'>
          <XCircle className='h-4 w-4' />
          <AlertDescription>Denied.</AlertDescription>
        </Alert>
      )}

      {request && !outcome && (
        <Card>
          <CardHeader>
            <CardTitle>
              {linkRequired ? (
                'Link this character and sign in?'
              ) : request.characterName ? (
                <>
                  Sign in as{' '}
                  <span className='text-primary'>{request.characterName}</span>?
                </>
              ) : (
                'Approve this login?'
              )}
            </CardTitle>
            <CardDescription>
              {linkRequired
                ? 'Only approve if you just started this login from your game client.'
                : 'Only approve this if you just started this login yourself.'}
            </CardDescription>
            {linkRequired && (
              <div className='flex flex-wrap items-center gap-2 pt-2 text-sm'>
                <span className='text-muted-foreground'>Requested from</span>
                <span className='font-mono'>{request.clientIp}</span>
                {request.tls ? (
                  <Badge variant='secondary'>
                    <Lock className='mr-1 h-3 w-3' aria-hidden />
                    Encrypted (TLS)
                  </Badge>
                ) : (
                  <Badge variant='destructive'>
                    <Unlock className='mr-1 h-3 w-3' aria-hidden />
                    Not encrypted
                  </Badge>
                )}
              </div>
            )}
          </CardHeader>
          <CardContent className='space-y-5'>
            {linkRequired && (
              <p className='text-sm'>
                {request.characterName || 'This character'} isn&apos;t linked to
                a website account yet. Enter its game password to link it to
                your account ({accountLabel}) and approve this login.
              </p>
            )}

            {request.accountLocked && (
              <Alert role='status'>
                <ShieldAlert className='h-4 w-4' />
                <AlertDescription>
                  Your account is locked for game logins
                  {request.lockedUntil
                    ? ` until ${new Date(request.lockedUntil).toLocaleString()}`
                    : ''}
                  . Approving this code logs you in anyway and clears the lock.
                </AlertDescription>
              </Alert>
            )}

            {!request.characterName && (
              <Alert variant='destructive' role='alert'>
                <ShieldAlert className='h-4 w-4' />
                <AlertDescription className='font-semibold'>
                  This code grants access to ANY character on your account. Only
                  approve if you just requested it from your game client.
                </AlertDescription>
              </Alert>
            )}

            <dl className='grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm'>
              <dt className='text-muted-foreground'>Character</dt>
              <dd className='font-medium'>
                {request.characterName || 'Any character on your account'}
              </dd>
              <dt className='text-muted-foreground'>Client IP</dt>
              <dd className='font-mono'>{request.clientIp}</dd>
              <dt className='text-muted-foreground'>Connection</dt>
              <dd>
                {request.tls ? (
                  <Badge variant='secondary'>
                    <Lock className='mr-1 h-3 w-3' aria-hidden />
                    Encrypted (TLS)
                  </Badge>
                ) : (
                  <Badge variant='destructive'>
                    <Unlock className='mr-1 h-3 w-3' aria-hidden />
                    Not encrypted
                  </Badge>
                )}
              </dd>
              <dt className='text-muted-foreground'>Requested</dt>
              <dd>{new Date(request.createdAt).toLocaleString()}</dd>
              <dt className='text-muted-foreground'>Time left</dt>
              <dd className='font-mono' aria-live='off'>
                {remaining === null
                  ? '-'
                  : remaining > 0
                    ? formatRemaining(remaining)
                    : 'Expired'}
              </dd>
            </dl>

            {!request.tls && (
              <p className='flex items-start gap-2 text-sm text-muted-foreground'>
                <ShieldAlert className='mt-0.5 h-4 w-4 shrink-0' aria-hidden />
                This connection is unencrypted. Prefer the TLS port when your
                client supports it.
              </p>
            )}

            {actionError && (
              <Alert variant='destructive' role='alert'>
                <AlertDescription>{actionError}</AlertDescription>
              </Alert>
            )}

            {pending ? (
              <>
                {linkRequired && !canLink && (
                  <Alert role='status'>
                    <ShieldAlert className='h-4 w-4' />
                    <AlertDescription>
                      This character has no password set, so it can&apos;t be
                      linked from here. Ask staff to link it.
                    </AlertDescription>
                  </Alert>
                )}
                {canLink && (
                  <div className='space-y-2'>
                    <Label htmlFor='character-password'>
                      Character game password
                    </Label>
                    <Input
                      id='character-password'
                      type='password'
                      value={characterPassword}
                      onChange={e => setCharacterPassword(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && characterPassword && !busy) {
                          e.preventDefault();
                          void doApprove();
                        }
                      }}
                      autoComplete='off'
                      className='max-w-xs'
                    />
                  </div>
                )}
                <p className='text-sm font-medium'>
                  Never approve a code you did not request yourself.
                </p>
                <div className='flex flex-wrap gap-3'>
                  {(!linkRequired || canLink) && (
                    <Button
                      onClick={doApprove}
                      disabled={busy || (linkRequired && !characterPassword)}
                    >
                      {approving
                        ? linkRequired
                          ? 'Linking...'
                          : 'Approving...'
                        : linkRequired
                          ? 'Link and sign in'
                          : 'Approve'}
                    </Button>
                  )}
                  <Button variant='outline' onClick={doDeny} disabled={busy}>
                    {denying ? 'Denying...' : 'Deny'}
                  </Button>
                </div>
              </>
            ) : (
              <p className='text-sm text-muted-foreground'>
                {request.status === 'PENDING' || request.status === 'EXPIRED'
                  ? 'This code has expired.'
                  : `This code is already ${request.status.toLowerCase()}.`}{' '}
                Type <code>code</code> at the game password prompt to request a
                new one.
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
