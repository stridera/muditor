'use client';

import { Component, ErrorInfo, ReactNode } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className='min-h-screen bg-gray-50 flex items-center justify-center p-4'>
          <Card className='w-full max-w-md'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2 text-red-600'>
                <AlertTriangle className='h-5 w-5' />
                Something went wrong
              </CardTitle>
              <CardDescription>
                An unexpected error occurred while loading this page.
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              {this.state.error && (
                <Alert variant='destructive'>
                  <AlertTriangle className='h-4 w-4' />
                  <AlertTitle>Error Details</AlertTitle>
                  <AlertDescription className='text-xs mt-2 font-mono'>
                    {this.state.error.message}
                  </AlertDescription>
                </Alert>
              )}

              <div className='flex flex-col sm:flex-row gap-3'>
                <Button
                  onClick={() => window.location.reload()}
                  className='flex-1'
                >
                  <RefreshCw className='w-4 h-4 mr-2' />
                  Reload Page
                </Button>
                <Button variant='outline' className='flex-1' asChild>
                  <Link href='/dashboard'>
                    <Home className='w-4 h-4 mr-2' />
                    Go Home
                  </Link>
                </Button>
              </div>

              {process.env.NODE_ENV === 'development' &&
                this.state.errorInfo && (
                  <details className='text-xs text-gray-600'>
                    <summary className='cursor-pointer'>
                      Technical Details
                    </summary>
                    <pre className='mt-2 whitespace-pre-wrap'>
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook-based error boundary for functional components
export function withErrorBoundary<T extends object>(
  Component: React.ComponentType<T>,
  fallback?: ReactNode
) {
  return function WrappedComponent(props: T) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}
