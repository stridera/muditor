import { Loader2 } from 'lucide-react';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

export function Loading({
  size = 'md',
  text = 'Loading...',
  className = '',
}: LoadingProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  const containerClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  return (
    <div
      className={`flex items-center justify-center gap-3 ${containerClasses[size]} ${className}`}
    >
      <Loader2 className={`animate-spin ${sizeClasses[size]}`} />
      <span className='text-muted-foreground'>{text}</span>
    </div>
  );
}

export function FullPageLoading({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className='min-h-screen flex items-center justify-center'>
      <Loading size='lg' text={text} />
    </div>
  );
}

export function CardLoading({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className='flex items-center justify-center py-8'>
      <Loading text={text} />
    </div>
  );
}

export function LoadingOverlay({
  show,
  message = 'Processing...',
  className = '',
}: {
  show: boolean;
  message?: string;
  className?: string;
}) {
  if (!show) return null;

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${className}`}
    >
      <div className='bg-white rounded-lg p-6 shadow-xl flex flex-col items-center min-w-[200px]'>
        <Loading size='lg' text={message} />
      </div>
    </div>
  );
}

export function SkeletonRow({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse ${className}`}>
      <div className='flex space-x-4'>
        <div className='rounded-full bg-gray-300 h-10 w-10'></div>
        <div className='flex-1 space-y-2 py-1'>
          <div className='h-4 bg-gray-300 rounded w-3/4'></div>
          <div className='h-4 bg-gray-300 rounded w-1/2'></div>
        </div>
      </div>
    </div>
  );
}
