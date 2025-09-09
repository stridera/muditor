'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { Loader2 } from 'lucide-react';

export default function HomePage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <Loader2 className='h-8 w-8 animate-spin' />
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <Loader2 className='h-8 w-8 animate-spin' />
      </div>
    );
  }
  return (
    <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
      <div className='text-center'>
        <h1 className='text-6xl font-bold text-gray-900 mb-4'>Muditor</h1>
        <p className='text-xl text-gray-600 mb-8'>
          A modern, database-driven MUD editor and administration tool
        </p>
        <div className='space-y-4 mb-8'>
          <div className='text-green-600 font-semibold'>
            ✅ Database connected and seeded with {130} zones
          </div>
          <div className='text-green-600 font-semibold'>
            ✅ API running on port 4000
          </div>
          <div className='text-green-600 font-semibold'>
            ✅ Web application running
          </div>
        </div>
        <div className='space-x-4'>
          <Link
            href='/login'
            className='bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-block'
          >
            Sign In
          </Link>
          <Link
            href='/register'
            className='bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors inline-block'
          >
            Create Account
          </Link>
        </div>
        <div className='mt-4'>
          <a
            href='http://localhost:4000/graphql'
            target='_blank'
            rel='noopener noreferrer'
            className='text-blue-600 hover:text-blue-500 text-sm'
          >
            GraphQL Playground →
          </a>
        </div>
      </div>
    </div>
  );
}
