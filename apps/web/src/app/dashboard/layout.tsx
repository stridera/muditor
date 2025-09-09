'use client';

import { Navigation } from './components/Navigation';
import { ProtectedRoute } from '@/components/auth/protected-route';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className='min-h-screen bg-gray-50'>
        <Navigation />
        <main className='container mx-auto px-4 py-8'>{children}</main>
      </div>
    </ProtectedRoute>
  );
}
