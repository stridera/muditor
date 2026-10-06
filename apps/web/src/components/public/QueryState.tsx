import { AlertCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Loading } from '@/components/ui/loading';

export function QueryLoading({ text }: { text?: string }) {
  return (
    <div role='status' className='py-16 text-muted-foreground'>
      <Loading text={text ?? 'Loading...'} />
    </div>
  );
}

interface QueryErrorProps {
  message?: string | undefined;
  onRetry?: (() => void) | undefined;
}

export function QueryError({ message, onRetry }: QueryErrorProps) {
  return (
    <div
      role='alert'
      className='flex flex-col items-center gap-3 rounded-lg border border-destructive/40 bg-destructive/5 px-6 py-10 text-center'
    >
      <AlertCircle className='h-6 w-6 text-destructive' aria-hidden />
      <p className='font-medium'>
        {message ?? 'Something went wrong loading this page.'}
      </p>
      {onRetry && (
        <Button variant='outline' size='sm' onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}

export function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className='rounded-lg border border-dashed border-border px-6 py-12 text-center text-muted-foreground'>
      {children}
    </div>
  );
}
