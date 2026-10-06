'use client';

import { BuilderGuard } from '@/components/site-content/BuilderGuard';
import { SiteContentForm } from '@/components/site-content/SiteContentForm';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useSiteContentById } from '@/hooks/useSiteContent';
import { Loader2, RefreshCw, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

function EditSiteContent({ id }: { id: string }) {
  const { item, loading, error, refetch } = useSiteContentById(id);

  if (loading && !item) {
    return (
      <div className='flex items-center justify-center h-96'>
        <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
      </div>
    );
  }

  if (error && !item) {
    return (
      <div className='container mx-auto p-6 space-y-4'>
        <Alert variant='destructive'>
          <XCircle className='h-4 w-4' />
          <AlertDescription>
            Error loading content: {error.message}
          </AlertDescription>
        </Alert>
        <Button variant='outline' onClick={() => refetch()}>
          <RefreshCw className='h-4 w-4 mr-2' />
          Retry
        </Button>
      </div>
    );
  }

  if (!item) {
    return (
      <div className='container mx-auto p-6 space-y-4'>
        <Alert>
          <AlertDescription>Content not found.</AlertDescription>
        </Alert>
        <Button variant='outline' asChild>
          <Link href='/dashboard/site-content'>Back to list</Link>
        </Button>
      </div>
    );
  }

  // key forces form state to reset if the row changes after a refetch/navigation
  return <SiteContentForm key={`${item.id}-${item.updatedAt}`} item={item} />;
}

export default function EditSiteContentPage() {
  const params = useParams<{ id: string }>();
  return (
    <BuilderGuard>
      <EditSiteContent id={params.id} />
    </BuilderGuard>
  );
}
