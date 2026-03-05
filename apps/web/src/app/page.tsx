'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/auth-context';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/* ───────────────────────── Floating Embers ───────────────────────── */

function Embers() {
  return (
    <div className='landing-embers' aria-hidden>
      {Array.from({ length: 18 }).map((_, i) => (
        <span key={i} className='landing-ember' />
      ))}
    </div>
  );
}

/* ──────────────────────── Decorative SVG Grid ──────────────────── */

function CartographyGrid() {
  return (
    <svg
      className='absolute inset-0 w-full h-full opacity-[0.04] pointer-events-none'
      aria-hidden
    >
      <defs>
        <pattern id='grid' width='60' height='60' patternUnits='userSpaceOnUse'>
          <path
            d='M 60 0 L 0 0 0 60'
            fill='none'
            stroke='currentColor'
            strokeWidth='0.5'
          />
        </pattern>
        <pattern
          id='grid-lg'
          width='300'
          height='300'
          patternUnits='userSpaceOnUse'
        >
          <rect width='300' height='300' fill='url(#grid)' />
          <path
            d='M 300 0 L 0 0 0 300'
            fill='none'
            stroke='currentColor'
            strokeWidth='1'
          />
        </pattern>
      </defs>
      <rect width='100%' height='100%' fill='url(#grid-lg)' />
    </svg>
  );
}

/* ──────────────────────── Compass Rose ──────────────────────────── */

function CompassRose() {
  return (
    <svg viewBox='0 0 120 120' className='landing-compass' aria-hidden>
      <g
        transform='translate(60,60)'
        fill='none'
        stroke='hsl(var(--gold))'
        strokeWidth='0.75'
        opacity='0.35'
      >
        {/* outer ring */}
        <circle r='54' />
        <circle r='48' strokeDasharray='3 5' />
        {/* cardinal points */}
        <path
          d='M0,-52 L4,-14 L0,-18 L-4,-14Z'
          fill='hsl(var(--gold))'
          opacity='0.5'
        />
        <path
          d='M0,52 L4,14 L0,18 L-4,14Z'
          fill='hsl(var(--gold))'
          opacity='0.3'
        />
        <path
          d='M-52,0 L-14,4 L-18,0 L-14,-4Z'
          fill='hsl(var(--gold))'
          opacity='0.3'
        />
        <path
          d='M52,0 L14,4 L18,0 L14,-4Z'
          fill='hsl(var(--gold))'
          opacity='0.3'
        />
        {/* intercardinal lines */}
        <line x1='-38' y1='-38' x2='38' y2='38' strokeDasharray='2 4' />
        <line x1='38' y1='-38' x2='-38' y2='38' strokeDasharray='2 4' />
        {/* tick marks */}
        {Array.from({ length: 36 }).map((_, i) => {
          const a = (i * 10 * Math.PI) / 180;
          const len = i % 9 === 0 ? 6 : 3;
          const r1 = 48 - len;
          const r2 = 48;
          return (
            <line
              key={i}
              x1={Math.sin(a) * r1}
              y1={-Math.cos(a) * r1}
              x2={Math.sin(a) * r2}
              y2={-Math.cos(a) * r2}
            />
          );
        })}
      </g>
    </svg>
  );
}

/* ───────────────────── Feature Highlights ─────────────────────── */

const FEATURES = [
  { icon: '{}', label: 'Visual Room Editor', desc: 'Drag-and-drop zone maps' },
  {
    icon: '\u2694',
    label: 'Mob & Object Builder',
    desc: 'Stats, effects, triggers',
  },
  {
    icon: '\u26A1',
    label: 'Live Game Link',
    desc: 'Test changes in real time',
  },
];

/* ───────────────────── Auth Form (inline) ────────────────────── */

type AuthTab = 'login' | 'register';

function AuthForm() {
  const { login, register, loading } = useAuth();
  const searchParams = useSearchParams();

  const [tab, setTab] = useState<AuthTab>('login');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const oauthError = searchParams.get('error');
    if (oauthError) setError(oauthError);
  }, [searchParams]);

  const switchTab = (t: AuthTab) => {
    setTab(t);
    setError('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(identifier, password);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    if (displayName.length < 3 || displayName.length > 20) {
      setError('Display name must be between 3 and 20 characters');
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(displayName)) {
      setError(
        'Display name can only contain letters, numbers, and underscores'
      );
      return;
    }

    setIsLoading(true);
    try {
      await register(displayName, identifier, password);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) return null;

  return (
    <div className='landing-auth-panel'>
      {/* Tab switcher */}
      <div className='landing-tabs'>
        <button
          type='button'
          className={`landing-tab ${tab === 'login' ? 'landing-tab--active' : ''}`}
          onClick={() => switchTab('login')}
        >
          Sign In
        </button>
        <button
          type='button'
          className={`landing-tab ${tab === 'register' ? 'landing-tab--active' : ''}`}
          onClick={() => switchTab('register')}
        >
          Create Account
        </button>
      </div>

      {/* ─── Login ─── */}
      {tab === 'login' && (
        <form onSubmit={handleLogin} className='landing-form animate-fade-in'>
          {error && (
            <Alert variant='destructive'>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className='space-y-1.5'>
            <Label htmlFor='identifier'>Email</Label>
            <Input
              id='identifier'
              type='email'
              value={identifier}
              onChange={e => setIdentifier(e.target.value)}
              required
              disabled={isLoading}
              placeholder='you@example.com'
              className='landing-input'
            />
          </div>

          <div className='space-y-1.5'>
            <Label htmlFor='password'>Password</Label>
            <Input
              id='password'
              type='password'
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              disabled={isLoading}
              placeholder='••••••••'
              className='landing-input'
            />
          </div>

          <Button
            type='submit'
            className='w-full landing-btn-primary'
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Signing in...
              </>
            ) : (
              'Enter the Realm'
            )}
          </Button>

          <div className='text-center'>
            <Link
              href='/forgot-password'
              className='text-xs text-muted-foreground hover:text-foreground transition-colors'
            >
              Forgot your password?
            </Link>
          </div>
        </form>
      )}

      {/* ─── Register ─── */}
      {tab === 'register' && (
        <form
          onSubmit={handleRegister}
          className='landing-form animate-fade-in'
        >
          {error && (
            <Alert variant='destructive'>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className='space-y-1.5'>
            <Label htmlFor='reg-display'>Display Name</Label>
            <Input
              id='reg-display'
              type='text'
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              required
              disabled={isLoading}
              placeholder='YourCharacterName'
              minLength={3}
              maxLength={20}
              pattern='^[a-zA-Z0-9_]+$'
              title='Letters, numbers, underscores only'
              className='landing-input'
            />
          </div>

          <div className='space-y-1.5'>
            <Label htmlFor='reg-email'>Email</Label>
            <Input
              id='reg-email'
              type='email'
              value={identifier}
              onChange={e => setIdentifier(e.target.value)}
              required
              disabled={isLoading}
              placeholder='you@example.com'
              className='landing-input'
            />
          </div>

          <div className='space-y-1.5'>
            <Label htmlFor='reg-password'>Password</Label>
            <Input
              id='reg-password'
              type='password'
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              disabled={isLoading}
              placeholder='Min 8 characters'
              minLength={8}
              maxLength={128}
              className='landing-input'
            />
          </div>

          <div className='space-y-1.5'>
            <Label htmlFor='reg-confirm'>Confirm Password</Label>
            <Input
              id='reg-confirm'
              type='password'
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
              disabled={isLoading}
              placeholder='Repeat password'
              className='landing-input'
            />
          </div>

          <Button
            type='submit'
            className='w-full landing-btn-primary'
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Creating account...
              </>
            ) : (
              'Join the Guild'
            )}
          </Button>
        </form>
      )}

      {/* ─── Google OAuth ─── */}
      <div className='landing-divider'>
        <span>or</span>
      </div>

      <Button
        variant='outline'
        className='w-full landing-btn-google'
        onClick={() => {
          window.location.href = `${API_URL}/api/auth/google`;
        }}
      >
        <svg className='mr-2 h-4 w-4' viewBox='0 0 24 24'>
          <path
            d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z'
            fill='#4285F4'
          />
          <path
            d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
            fill='#34A853'
          />
          <path
            d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
            fill='#FBBC05'
          />
          <path
            d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
            fill='#EA4335'
          />
        </svg>
        Continue with Google
      </Button>
    </div>
  );
}

/* ─────────────────────── Main Page ───────────────────────────── */

function HomeContent() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, loading, router]);

  if (loading || isAuthenticated) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-background text-foreground'>
        <Loader2 className='h-8 w-8 animate-spin text-primary' />
      </div>
    );
  }

  return (
    <div className='landing-root'>
      {/* ── Atmosphere layers ── */}
      <CartographyGrid />
      <div className='landing-vignette' aria-hidden />
      <div className='landing-glow' aria-hidden />
      <Embers />

      {/* ── Content split ── */}
      <div className='landing-split'>
        {/* ── Left: Hero ── */}
        <div className='landing-hero'>
          <CompassRose />

          <div className='landing-hero-content'>
            {/* Corner accents */}
            <div className='landing-corner landing-corner--tl' />
            <div className='landing-corner landing-corner--br' />

            <h1 className='landing-title'>
              <span className='landing-title-text'>MUDITOR</span>
            </h1>

            <div className='landing-rule' />

            <p className='landing-tagline'>Forge Your World</p>

            <p className='landing-subtitle'>
              The world-building toolkit for FieryMUD.
              <br />
              Design rooms, craft mobs, script triggers — all from your browser.
            </p>

            <div className='landing-features'>
              {FEATURES.map(f => (
                <div key={f.label} className='landing-feature'>
                  <span className='landing-feature-icon'>{f.icon}</span>
                  <div>
                    <div className='landing-feature-label'>{f.label}</div>
                    <div className='landing-feature-desc'>{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right: Auth ── */}
        <div className='landing-auth'>
          <AuthForm />
        </div>
      </div>

      {/* ── Footer ── */}
      <footer className='landing-footer'>
        <span>FieryMUD &middot; Since 1996</span>
      </footer>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className='min-h-screen flex items-center justify-center bg-background text-foreground'>
          <Loader2 className='h-8 w-8 animate-spin text-primary' />
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
