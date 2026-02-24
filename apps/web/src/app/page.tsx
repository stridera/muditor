'use client';

import { useAuth } from '@/contexts/auth-context';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function HomePage() {
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
    <div className='min-h-screen bg-background flex items-center justify-center text-foreground relative overflow-hidden'>
      {/* Ambient gradient glow */}
      <div className='absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--gold)/0.08)_0%,transparent_70%)]' />

      {/* Subtle noise texture */}
      <div
        className='absolute inset-0 opacity-[0.03]'
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: '128px 128px',
        }}
      />

      {/* Decorative corner accents */}
      <div className='absolute top-8 left-8 w-16 h-16 border-t-2 border-l-2 border-primary/20 rounded-tl-lg' />
      <div className='absolute top-8 right-8 w-16 h-16 border-t-2 border-r-2 border-primary/20 rounded-tr-lg' />
      <div className='absolute bottom-8 left-8 w-16 h-16 border-b-2 border-l-2 border-primary/20 rounded-bl-lg' />
      <div className='absolute bottom-8 right-8 w-16 h-16 border-b-2 border-r-2 border-primary/20 rounded-br-lg' />

      {/* Content */}
      <div className='relative text-center animate-fade-in'>
        <h1 className='text-6xl sm:text-7xl font-display font-bold text-foreground mb-3 tracking-wider'>
          <span className='bg-gradient-to-b from-foreground via-foreground to-primary/60 bg-clip-text text-transparent'>
            MUDITOR
          </span>
        </h1>

        <div className='w-24 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent mx-auto mb-4' />

        <p className='text-lg text-muted-foreground mb-10 tracking-wide'>
          Forge Your World
        </p>

        <div className='flex flex-col sm:flex-row gap-4 justify-center'>
          <Link
            href='/login'
            className='inline-flex items-center justify-center px-8 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all duration-200 shadow-lg shadow-primary/20 hover:shadow-primary/30'
          >
            Sign In
          </Link>
          <Link
            href='/register'
            className='inline-flex items-center justify-center px-8 py-3 rounded-lg border border-border text-foreground font-medium hover:bg-accent hover:border-primary/30 transition-all duration-200'
          >
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
}
