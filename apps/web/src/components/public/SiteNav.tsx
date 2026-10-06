'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { Flame, Menu, Moon, Sun, X } from 'lucide-react';

import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { PUBLIC_NAV_LINKS } from './mud-config';

function isActive(pathname: string, href: string) {
  return href === '/' ? pathname === '/' : pathname.startsWith(href);
}

function ThemeSwitch() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const dark = resolvedTheme === 'dark';

  return (
    <Button
      variant='ghost'
      size='icon'
      aria-label={
        mounted && dark ? 'Switch to light theme' : 'Switch to dark theme'
      }
      onClick={() => setTheme(dark ? 'light' : 'dark')}
    >
      {mounted && dark ? (
        <Sun className='h-4 w-4' />
      ) : (
        <Moon className='h-4 w-4' />
      )}
    </Button>
  );
}

function AuthActions({ onNavigate = () => {} }: { onNavigate?: () => void }) {
  const { user, loading } = useAuth();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Render nothing auth-dependent until mounted (avoids hydration mismatch).
  if (!mounted || loading) {
    return <div className='h-9 w-24' aria-hidden />;
  }

  if (user) {
    return (
      <div className='flex items-center gap-3'>
        <span className='hidden text-sm text-muted-foreground xl:inline'>
          {user.displayName}
        </span>
        <Link
          href='/verify'
          onClick={onNavigate}
          className='text-sm font-medium text-muted-foreground transition-colors hover:text-primary'
        >
          Approve login
        </Link>
        <Button asChild size='sm'>
          <Link href='/dashboard' onClick={onNavigate}>
            Dashboard
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <Button asChild size='sm' variant='outline'>
      <Link href='/login' onClick={onNavigate}>
        Log in
      </Link>
    </Button>
  );
}

export function SiteNav() {
  const pathname = usePathname() ?? '/';
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header className='sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur'>
      <nav
        aria-label='Main'
        className='mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6'
      >
        <Link
          href='/'
          className='flex items-center gap-2 font-display text-xl font-semibold tracking-wide text-primary'
        >
          <Flame className='h-5 w-5' aria-hidden />
          FieryMUD
        </Link>

        <ul className='ml-4 hidden flex-1 items-center gap-1 lg:flex'>
          {PUBLIC_NAV_LINKS.map(link => (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-current={
                  isActive(pathname, link.href) ? 'page' : undefined
                }
                className={cn(
                  'rounded-md px-3 py-2 text-sm font-medium transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  isActive(pathname, link.href)
                    ? 'text-primary'
                    : 'text-muted-foreground'
                )}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className='ml-auto flex items-center gap-2 lg:ml-0'>
          <ThemeSwitch />
          <div className='hidden lg:block'>
            <AuthActions />
          </div>
          <Button
            variant='ghost'
            size='icon'
            className='lg:hidden'
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            aria-controls='public-mobile-menu'
            onClick={() => setOpen(o => !o)}
          >
            {open ? <X className='h-5 w-5' /> : <Menu className='h-5 w-5' />}
          </Button>
        </div>
      </nav>

      {open && (
        <div
          id='public-mobile-menu'
          className='border-t border-border bg-background lg:hidden'
        >
          <ul className='mx-auto flex max-w-6xl flex-col px-4 py-2 sm:px-6'>
            {PUBLIC_NAV_LINKS.map(link => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  aria-current={
                    isActive(pathname, link.href) ? 'page' : undefined
                  }
                  className={cn(
                    'block rounded-md px-3 py-3 text-base font-medium hover:bg-accent hover:text-accent-foreground',
                    isActive(pathname, link.href)
                      ? 'text-primary'
                      : 'text-foreground'
                  )}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li className='px-3 py-3'>
              <AuthActions onNavigate={() => setOpen(false)} />
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
