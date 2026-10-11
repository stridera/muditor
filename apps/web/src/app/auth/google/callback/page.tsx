'use client';

import { useAuth } from '@/contexts/auth-context';
import { Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useRef } from 'react';

function GoogleCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { loginWithOAuthCode } = useAuth();
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;

    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      router.replace(`/login?error=${encodeURIComponent(error)}`);
      return;
    }

    if (!code) {
      router.replace('/login?error=Missing authentication code');
      return;
    }

    loginWithOAuthCode(code).catch(() => {
      router.replace('/login?error=Authentication failed');
    });
  }, [searchParams, router, loginWithOAuthCode]);

  return (
    <div className='min-h-screen flex items-center justify-center bg-background text-foreground'>
      <div className='text-center'>
        <Loader2 className='h-8 w-8 animate-spin text-primary mx-auto mb-4' />
        <p className='text-muted-foreground'>Completing sign in...</p>
      </div>
    </div>
  );
}

export default function GoogleCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className='min-h-screen flex items-center justify-center bg-background text-foreground'>
          <Loader2 className='h-8 w-8 animate-spin text-primary' />
        </div>
      }
    >
      <GoogleCallbackContent />
    </Suspense>
  );
}
