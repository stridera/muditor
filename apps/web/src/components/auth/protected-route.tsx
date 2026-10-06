'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { roleAtLeast, type UserRole } from '@/lib/roles';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** Allow any of these roles or higher (hierarchical, not exact match). */
  requireRole?: UserRole[];
  /** Minimum role required. */
  requiredRole?: UserRole;
}

export function ProtectedRoute({
  children,
  requireRole,
  requiredRole = 'PLAYER',
}: ProtectedRouteProps) {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <Loader2 className='h-8 w-8 animate-spin' />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <Loader2 className='h-8 w-8 animate-spin' />
      </div>
    );
  }

  // Check role permissions
  const hasRequiredRole = requireRole
    ? requireRole.some(role => roleAtLeast(user.role, role))
    : roleAtLeast(user.role, requiredRole);

  if (!hasRequiredRole) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <h1 className='text-2xl font-bold text-gray-900 mb-2'>
            Access Denied
          </h1>
          <p className='text-gray-600 mb-4'>
            You don't have permission to access this page.
          </p>
          <p className='text-sm text-gray-500'>
            Required: {requireRole ? requireRole.join(' or ') : requiredRole}
          </p>
          <p className='text-sm text-gray-500'>Your role: {user.role}</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
