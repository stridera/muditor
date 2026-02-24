'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
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
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function LoginPage() {
  const { login, loading } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
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

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-background text-foreground'>
        <Loader2 className='h-8 w-8 animate-spin text-primary' />
      </div>
    );
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-background text-foreground relative overflow-hidden'>
      {/* Ambient gradient */}
      <div className='absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--gold)/0.06)_0%,transparent_70%)]' />

      <div className='relative max-w-md w-full px-4 animate-fade-in'>
        <div className='text-center mb-8'>
          <Link href='/'>
            <h1 className='text-3xl font-display font-bold text-foreground tracking-wider mb-1'>
              MUDITOR
            </h1>
          </Link>
          <div className='w-16 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent mx-auto mb-3' />
          <h2 className='text-xl font-display text-foreground/80'>
            Enter the Realm
          </h2>
        </div>

        <Card className='border-border/50 shadow-xl backdrop-blur-sm bg-card/95'>
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>
              Enter your username/email and password to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className='space-y-4'>
              {error && (
                <Alert variant='destructive'>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className='space-y-2'>
                <Label htmlFor='identifier'>Username or Email</Label>
                <Input
                  id='identifier'
                  type='text'
                  value={identifier}
                  onChange={e => setIdentifier(e.target.value)}
                  required
                  disabled={isLoading}
                  placeholder='Enter your username or email'
                  className='focus-visible:ring-primary'
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='password'>Password</Label>
                <Input
                  id='password'
                  type='password'
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  placeholder='Enter your password'
                  className='focus-visible:ring-primary'
                />
              </div>

              <Button type='submit' className='w-full' disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>

            <div className='mt-4 text-center text-sm'>
              <span className='text-muted-foreground'>
                Don't have an account?{' '}
              </span>
              <Link
                href='/register'
                className='font-medium text-primary hover:text-primary/80'
              >
                Sign up
              </Link>
            </div>

            <div className='mt-2 text-center text-sm'>
              <Link
                href='/forgot-password'
                className='font-medium text-muted-foreground hover:text-foreground'
              >
                Forgot your password?
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
