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
import { apolloClient } from '@/lib/apollo-client';
import { gql } from '@apollo/client';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';

const COMPLETE_GOOGLE_REGISTRATION = gql`
  mutation CompleteGoogleRegistration($token: String!, $displayName: String!) {
    completeGoogleRegistration(token: $token, displayName: $displayName) {
      accessToken
      user {
        id
        displayName
        email
        role
        createdAt
      }
    }
  }
`;

function ChooseDisplayNameContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { loginWithToken } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const token = searchParams.get('token');

  if (!token) {
    router.replace('/login?error=Missing registration token');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

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
      const result = await apolloClient.mutate({
        mutation: COMPLETE_GOOGLE_REGISTRATION,
        variables: { token, displayName },
      });

      const data = (result.data as any)?.completeGoogleRegistration;
      if (data?.accessToken) {
        await loginWithToken(data.accessToken);
      }
    } catch (err: any) {
      const errorMessage =
        err.graphQLErrors?.[0]?.message ||
        err.networkError?.message ||
        'Registration failed. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

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
            Choose Your Name
          </h2>
        </div>

        <Card className='border-border/50 shadow-xl backdrop-blur-sm bg-card/95'>
          <CardHeader>
            <CardTitle>Almost There</CardTitle>
            <CardDescription>
              Choose a display name to complete your account setup
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
                <Label htmlFor='displayName'>Display Name</Label>
                <Input
                  id='displayName'
                  type='text'
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  required
                  disabled={isLoading}
                  placeholder='Choose a display name'
                  minLength={3}
                  maxLength={20}
                  pattern='^[a-zA-Z0-9_]+$'
                  title='Display name can only contain letters, numbers, and underscores'
                  className='focus-visible:ring-primary'
                  autoFocus
                />
                <p className='text-xs text-muted-foreground'>
                  3-20 characters, letters, numbers, and underscores only
                </p>
              </div>

              <Button type='submit' className='w-full' disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Creating account...
                  </>
                ) : (
                  'Complete Registration'
                )}
              </Button>
            </form>

            <div className='mt-4 text-center text-sm'>
              <Link
                href='/login'
                className='font-medium text-muted-foreground hover:text-foreground'
              >
                Back to login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function ChooseDisplayNamePage() {
  return (
    <Suspense
      fallback={
        <div className='min-h-screen flex items-center justify-center bg-background text-foreground'>
          <Loader2 className='h-8 w-8 animate-spin text-primary' />
        </div>
      }
    >
      <ChooseDisplayNameContent />
    </Suspense>
  );
}
