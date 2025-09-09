'use client';

import { useState } from 'react';
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
import { Loader2, Mail, ArrowLeft } from 'lucide-react';
import { gql } from '@apollo/client';
import { apolloClient } from '@/lib/apollo-client';

const REQUEST_PASSWORD_RESET_MUTATION = gql`
  mutation RequestPasswordReset($input: RequestPasswordResetInput!) {
    requestPasswordReset(input: $input) {
      success
      message
    }
  }
`;

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await apolloClient.mutate({
        mutation: REQUEST_PASSWORD_RESET_MUTATION,
        variables: {
          input: { email },
        },
      });

      const { success, message } = (result.data as any)
        ?.requestPasswordReset || { success: false, message: '' };
      if (success) {
        setIsSubmitted(true);
      } else {
        setError(message || 'Failed to send reset email');
      }
    } catch (err: any) {
      const errorMessage =
        err.graphQLErrors?.[0]?.message ||
        err.networkError?.message ||
        'Failed to send reset email. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
        <div className='max-w-md w-full space-y-8'>
          <Card>
            <CardHeader className='text-center'>
              <div className='mx-auto h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mb-4'>
                <Mail className='h-6 w-6 text-green-600' />
              </div>
              <CardTitle>Check your email</CardTitle>
              <CardDescription>
                If an account with email {email} exists, we've sent you a
                password reset link.
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <Alert>
                <Mail className='h-4 w-4' />
                <AlertDescription>
                  Check your email inbox and click the reset link to create a
                  new password. If you don't see it, check your spam folder.
                </AlertDescription>
              </Alert>

              <div className='text-center space-y-2'>
                <p className='text-sm text-gray-600'>
                  Didn't receive an email?
                </p>
                <Button
                  variant='outline'
                  onClick={() => {
                    setIsSubmitted(false);
                    setEmail('');
                  }}
                >
                  Try again
                </Button>
              </div>

              <div className='text-center'>
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

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-md w-full space-y-8'>
        <div>
          <h2 className='mt-6 text-center text-3xl font-extrabold text-gray-900'>
            Reset your password
          </h2>
          <p className='mt-2 text-center text-sm text-gray-600'>
            Enter your email address and we'll send you a link to reset your
            password
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Forgot Password</CardTitle>
            <CardDescription>
              We'll send you a secure link to reset your password
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
                <Label htmlFor='email'>Email Address</Label>
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

              <Button type='submit' className='w-full' disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Sending reset link...
                  </>
                ) : (
                  'Send Reset Link'
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

            <div className='mt-2 text-center text-sm'>
              <span className='text-gray-600'>Don't have an account? </span>
              <Link
                href='/register'
                className='font-medium text-blue-600 hover:text-blue-500'
              >
                Sign up
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
