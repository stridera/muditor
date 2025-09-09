'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireRole?: ('PLAYER' | 'IMMORTAL' | 'BUILDER' | 'CODER' | 'GOD')[];
  requiredRole?: 'PLAYER' | 'IMMORTAL' | 'BUILDER' | 'CODER' | 'GOD'; // Legacy support
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
    ? requireRole.includes(user.role as any)
    : checkRolePermission(user.role, requiredRole);

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

// Role hierarchy helper function
function checkRolePermission(userRole: string, requiredRole: string): boolean {
  const roleHierarchy = {
    PLAYER: 1,
    IMMORTAL: 2,
    BUILDER: 3,
    CODER: 4,
    GOD: 5,
  };

  const userLevel = roleHierarchy[userRole as keyof typeof roleHierarchy] || 0;
  const requiredLevel =
    roleHierarchy[requiredRole as keyof typeof roleHierarchy] || 0;

  return userLevel >= requiredLevel;
}
