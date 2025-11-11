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
import { useAuth } from '@/contexts/auth-context';
import { usePermissions } from '@/hooks/use-permissions';
import { AlertTriangle, ArrowLeft, Loader2, Shield } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';

interface PermissionGuardProps {
  children: ReactNode;
  requireImmortal?: boolean;
  requireBuilder?: boolean;
  requireCoder?: boolean;
  requireGod?: boolean;
  requireUserManagement?: boolean;
  requireValidation?: boolean;
  fallback?: ReactNode;
  showFallback?: boolean;
}

export function PermissionGuard({
  children,
  requireImmortal = false,
  requireBuilder = false,
  requireCoder = false,
  requireGod = false,
  requireUserManagement = false,
  requireValidation = false,
  fallback,
  showFallback = true,
}: PermissionGuardProps) {
  const { user } = useAuth();
  const { permissions, loading, isImmortal, isBuilder, isCoder, isGod } =
    usePermissions();

  if (loading) {
    return (
      <div className='flex items-center justify-center p-8'>
        <Loader2 className='h-6 w-6 animate-spin' />
      </div>
    );
  }

  if (!user || !permissions) {
    return (
      <Alert variant='destructive'>
        <AlertTriangle className='h-4 w-4' />
        <AlertDescription>
          Unable to verify permissions. Please refresh and try again.
        </AlertDescription>
      </Alert>
    );
  }

  // Check permission requirements
  const hasPermission = checkPermissions({
    permissions,
    requireImmortal,
    requireBuilder,
    requireCoder,
    requireGod,
    requireUserManagement,
    requireValidation,
    isImmortal,
    isBuilder,
    isCoder,
    isGod,
  });

  if (hasPermission) {
    return <>{children}</>;
  }

  // Show fallback if permission denied
  if (fallback) {
    return <>{fallback}</>;
  }

  if (!showFallback) {
    return null;
  }

  // Default permission denied UI
  return (
    <Card className='max-w-md mx-auto mt-8'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Shield className='h-5 w-5 text-red-500' />
          Access Denied
        </CardTitle>
        <CardDescription>
          You don't have the required permissions to access this content.
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='bg-red-50 border border-red-200 rounded-lg p-4'>
          <h4 className='font-medium text-red-900 mb-2'>
            Required Permissions:
          </h4>
          <ul className='text-sm text-red-700 space-y-1'>
            {requireGod && <li>• God role</li>}
            {requireCoder && <li>• Coder role or higher</li>}
            {requireBuilder && <li>• Builder role or higher</li>}
            {requireImmortal && <li>• Immortal role or higher</li>}
            {requireUserManagement && <li>• User management permissions</li>}
            {requireValidation && <li>• Validation access permissions</li>}
          </ul>
        </div>

        <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
          <h4 className='font-medium text-blue-900 mb-2'>
            Your Current Level:
          </h4>
          <div className='text-sm text-blue-700 space-y-1'>
            <div>Role: {user.role}</div>
            <div>Max Character Level: {permissions.maxCharacterLevel}</div>
          </div>
        </div>

        <Button asChild className='w-full'>
          <Link href='/dashboard'>
            <ArrowLeft className='w-4 h-4 mr-2' />
            Return to Dashboard
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

interface PermissionCheckOptions {
  permissions: any;
  requireImmortal: boolean;
  requireBuilder: boolean;
  requireCoder: boolean;
  requireGod: boolean;
  requireUserManagement: boolean;
  requireValidation: boolean;
  isImmortal: boolean;
  isBuilder: boolean;
  isCoder: boolean;
  isGod: boolean;
}

function checkPermissions({
  permissions,
  requireImmortal,
  requireBuilder,
  requireCoder,
  requireGod,
  requireUserManagement,
  requireValidation,
  isImmortal,
  isBuilder,
  isCoder,
  isGod,
}: PermissionCheckOptions): boolean {
  // Check role requirements
  if (requireGod && !isGod) return false;
  if (requireCoder && !isCoder) return false;
  if (requireBuilder && !isBuilder) return false;
  if (requireImmortal && !isImmortal) return false;

  // Check specific permissions
  if (requireUserManagement && !permissions.canManageUsers) return false;
  if (requireValidation && !permissions.canViewValidation) return false;

  return true;
}
