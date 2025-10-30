'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { 
  AlertTriangle, 
  Wifi, 
  RefreshCw, 
  LogIn, 
  Home,
  AlertCircle,
  Info
} from 'lucide-react';
import Link from 'next/link';
import { ErrorDisplayProps } from '@/lib/error-utils';

interface ErrorDisplayComponentProps extends ErrorDisplayProps {
  onRetry?: () => void;
  showHomeButton?: boolean;
  className?: string;
}

export function ErrorDisplay({
  title,
  message,
  action,
  actionLabel,
  variant = 'error',
  onRetry,
  showHomeButton = false,
  className = '',
}: ErrorDisplayComponentProps) {
  const getIcon = () => {
    switch (variant) {
      case 'warning':
        return <AlertTriangle className="h-4 w-4" />;
      case 'info':
        return <Info className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getVariant = () => {
    switch (variant) {
      case 'warning':
        return 'default' as const;
      case 'info':
        return 'default' as const;
      default:
        return 'destructive' as const;
    }
  };

  const getActionIcon = () => {
    if (actionLabel?.toLowerCase().includes('retry')) {
      return <RefreshCw className="w-4 h-4 mr-2" />;
    }
    if (actionLabel?.toLowerCase().includes('log')) {
      return <LogIn className="w-4 h-4 mr-2" />;
    }
    return null;
  };

  return (
    <Alert variant={getVariant()} className={className}>
      {getIcon()}
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="mt-2">
        <p>{message}</p>
        
        {(action || onRetry || actionLabel || showHomeButton) && (
          <div className="flex flex-col sm:flex-row gap-2 mt-4">
            {(action || onRetry) && actionLabel && (
              <Button
                onClick={action || onRetry}
                variant={variant === 'error' ? 'destructive' : 'default'}
                size="sm"
              >
                {getActionIcon()}
                {actionLabel}
              </Button>
            )}
            
            {showHomeButton && (
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard">
                  <Home className="w-4 h-4 mr-2" />
                  Go to Dashboard
                </Link>
              </Button>
            )}
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
}

/**
 * Simplified error display for loading states
 */
export function LoadingError({ 
  error, 
  onRetry,
  resource = 'data'
}: { 
  error: any; 
  onRetry?: () => void;
  resource?: string;
}) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-md p-4">
      <div className="flex items-start">
        <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5 mr-3" />
        <div className="flex-1">
          <h3 className="text-red-800 font-medium">
            Error loading {resource}
          </h3>
          <p className="text-red-600 text-sm mt-1">
            {error?.message || 'An unexpected error occurred'}
          </p>
          {onRetry && (
            <Button
              onClick={onRetry}
              variant="outline"
              size="sm"
              className="mt-3"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Network-specific error display
 */
export function NetworkError({ onRetry }: { onRetry?: () => void }) {
  return (
    <ErrorDisplay
      title="Connection Problem"
      message="Unable to connect to the server. Please check your internet connection."
      variant="warning"
      actionLabel="Retry"
      onRetry={onRetry}
      showHomeButton
    />
  );
}

/**
 * Authentication error display
 */
export function AuthError() {
  return (
    <ErrorDisplay
      title="Session Expired"
      message="Your session has expired. Please log in again to continue."
      variant="error"
      actionLabel="Log In"
      action={() => window.location.href = '/login'}
    />
  );
}