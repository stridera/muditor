'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, ArrowLeft } from 'lucide-react';
import { gql } from '@apollo/client';
import { apolloClient } from '@/lib/apollo-client';

const RESET_PASSWORD_MUTATION = gql`
  mutation ResetPassword($input: ResetPasswordInput!) {
    resetPassword(input: $input) {
      success
      message
    }
  }
`;

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError(
        'Invalid or missing reset token. Please request a new password reset.'
      );
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (!token) {
      setError('Invalid reset token');
      return;
    }

    setIsLoading(true);

    try {
      const result = await apolloClient.mutate({
        mutation: RESET_PASSWORD_MUTATION,
        variables: {
          input: {
            token,
            newPassword,
          },
        },
      });

      const { success, message } = (result.data as any)?.resetPassword || {
        success: false,
        message: '',
      };
      if (success) {
        setIsSuccess(true);
      } else {
        setError(message || 'Failed to reset password');
      }
    } catch (err: any) {
      const errorMessage =
        err.graphQLErrors?.[0]?.message ||
        err.networkError?.message ||
        'Failed to reset password. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
        <div className='max-w-md w-full space-y-8'>
          <Card>
            <CardHeader className='text-center'>
              <div className='mx-auto h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mb-4'>
                <CheckCircle className='h-6 w-6 text-green-600' />
              </div>
              <CardTitle>Password Reset Successful</CardTitle>
              <CardDescription>
                Your password has been successfully updated
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <Alert>
                <CheckCircle className='h-4 w-4' />
                <AlertDescription>
                  You can now log in with your new password.
                </AlertDescription>
              </Alert>

              <div className='text-center'>
                <Button
                  onClick={() => router.push('/login')}
                  className='w-full'
                >
                  Go to Login
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-md w-full space-y-8'>
        <div>
          <h2 className='mt-6 text-center text-3xl font-extrabold text-gray-900'>
            Reset your password
          </h2>
          <p className='mt-2 text-center text-sm text-gray-600'>
            Enter your new password below
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Set New Password</CardTitle>
            <CardDescription>
              Choose a strong password for your account
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
                <Label htmlFor='newPassword'>New Password</Label>
                <Input
                  id='newPassword'
                  type='password'
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  required
                  disabled={isLoading || !token}
                  placeholder='Enter your new password'
                  minLength={8}
                  maxLength={128}
                />
                <p className='text-xs text-gray-500'>
                  8-128 characters required
                </p>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='confirmPassword'>Confirm New Password</Label>
                <Input
                  id='confirmPassword'
                  type='password'
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                  disabled={isLoading || !token}
                  placeholder='Confirm your new password'
                />
              </div>

              <Button
                type='submit'
                className='w-full'
                disabled={isLoading || !token}
              >
                {isLoading ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Resetting password...
                  </>
                ) : (
                  'Reset Password'
                )}
              </Button>
            </form>

            <div className='mt-4 text-center'>
              <Link
                href='/login'
                className='inline-flex items-center text-sm text-blue-600 hover:text-blue-500'
              >
                <ArrowLeft className='mr-1 h-4 w-4' />
                Back to login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className='min-h-screen flex items-center justify-center'>
          Loading...
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
