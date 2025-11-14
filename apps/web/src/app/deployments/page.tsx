'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Package } from 'lucide-react';

// TODO: Re-enable when deployment feature is added to schema
// This page was using deployment queries that don't exist in the current GraphQL schema

export default function DeploymentsPage() {
  return (
    <div className='container mx-auto py-8 bg-background text-foreground'>
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2 text-foreground'>
            <Package className='h-6 w-6' />
            Deployments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className='h-4 w-4 text-muted-foreground' />
            <AlertDescription className='text-muted-foreground'>
              The deployment feature is currently under development. Please
              check back later.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
