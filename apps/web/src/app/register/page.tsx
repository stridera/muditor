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

export default function RegisterPage() {
  const { register, loading } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (username.length < 3 || username.length > 20) {
      setError('Username must be between 3 and 20 characters');
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setError('Username can only contain letters, numbers, and underscores');
      return;
    }

    setIsLoading(true);

    try {
      await register(username, email, password);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-background text-foreground'>
        <Loader2 className='h-8 w-8 animate-spin' />
      </div>
    );
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-background text-foreground py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-md w-full space-y-8'>
        <div>
          <h2 className='mt-6 text-center text-3xl font-extrabold text-foreground'>
            Create your account
          </h2>
          <p className='mt-2 text-center text-sm text-muted-foreground'>
            Join Muditor to start building worlds
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Register</CardTitle>
            <CardDescription>
              Create a new account to access the world editor
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
                <Label htmlFor='username'>Username</Label>
                <Input
                  id='username'
                  type='text'
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  required
                  disabled={isLoading}
                  placeholder='Choose a username'
                  minLength={3}
                  maxLength={20}
                  pattern='^[a-zA-Z0-9_]+$'
                  title='Username can only contain letters, numbers, and underscores'
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='email'>Email</Label>
                <Input
                  id='email'
                  type='email'
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  placeholder='Enter your email address'
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
                  minLength={8}
                  maxLength={128}
                />
                <p className='text-xs text-muted-foreground'>
                  8-128 characters required
                </p>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='confirmPassword'>Confirm Password</Label>
                <Input
                  id='confirmPassword'
                  type='password'
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  placeholder='Confirm your password'
                />
              </div>

              <Button type='submit' className='w-full' disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Creating account...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>
            </form>

            <div className='mt-4 text-center text-sm'>
              <span className='text-muted-foreground'>
                Already have an account?{' '}
              </span>
              <Link
                href='/login'
                className='font-medium text-primary hover:text-primary-foreground'
              >
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
