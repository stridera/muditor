'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { usePermissions } from '@/hooks/use-permissions';
import { Loader2, XCircle } from 'lucide-react';
import type { ReactNode } from 'react';

/** Renders children only for BUILDER+ users. */
export function BuilderGuard({ children }: { children: ReactNode }) {
  const { loading, isBuilder } = usePermissions();

  if (loading) {
    return (
      <div className='flex items-center justify-center h-96'>
        <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
      </div>
    );
  }

  if (!isBuilder) {
    return (
      <div className='container mx-auto p-6'>
        <Alert variant='destructive'>
          <XCircle className='h-4 w-4' />
          <AlertDescription>
            You need the Builder role or higher to manage site content.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return <>{children}</>;
}
