/**
 * Error handling utilities for improved user experience
 */

export interface ApiError {
  message: string;
  code?: string;
  details?: any;
  statusCode?: number;
}

export interface ErrorDisplayProps {
  title: string;
  message: string;
  action?: () => void;
  actionLabel?: string;
  variant?: 'error' | 'warning' | 'info';
}

/**
 * Extract meaningful error messages from GraphQL/Apollo errors
 */
export function extractErrorMessage(error: any): string {
  // GraphQL errors
  if (error?.graphQLErrors?.length > 0) {
    return error.graphQLErrors[0].message;
  }
  
  // Network errors
  if (error?.networkError?.message) {
    return error.networkError.message;
  }
  
  // Standard error
  if (error?.message) {
    return error.message;
  }
  
  // Fallback
  return 'An unexpected error occurred. Please try again.';
}

/**
 * Categorize errors for better user messaging
 */
export function categorizeError(error: any): {
  category: 'network' | 'authentication' | 'validation' | 'server' | 'unknown';
  userMessage: string;
  shouldRetry: boolean;
} {
  const message = extractErrorMessage(error);
  const lowerMessage = message.toLowerCase();
  
  // Network connectivity issues
  if (
    lowerMessage.includes('network') ||
    lowerMessage.includes('fetch') ||
    lowerMessage.includes('connection') ||
    error?.networkError
  ) {
    return {
      category: 'network',
      userMessage: 'Connection problem. Please check your internet connection and try again.',
      shouldRetry: true,
    };
  }
  
  // Authentication/authorization issues
  if (
    lowerMessage.includes('unauthorized') ||
    lowerMessage.includes('forbidden') ||
    lowerMessage.includes('token') ||
    lowerMessage.includes('authentication')
  ) {
    return {
      category: 'authentication',
      userMessage: 'Your session has expired. Please log in again.',
      shouldRetry: false,
    };
  }
  
  // Validation errors
  if (
    lowerMessage.includes('validation') ||
    lowerMessage.includes('invalid') ||
    lowerMessage.includes('required') ||
    lowerMessage.includes('must be')
  ) {
    return {
      category: 'validation',
      userMessage: message, // Show validation messages as-is
      shouldRetry: false,
    };
  }
  
  // Server errors
  if (
    lowerMessage.includes('server') ||
    lowerMessage.includes('500') ||
    lowerMessage.includes('internal')
  ) {
    return {
      category: 'server',
      userMessage: 'Server error. Our team has been notified. Please try again later.',
      shouldRetry: true,
    };
  }
  
  // Unknown errors
  return {
    category: 'unknown',
    userMessage: message || 'Something went wrong. Please try again.',
    shouldRetry: true,
  };
}

/**
 * Create user-friendly error messages with suggested actions
 */
export function createErrorDisplay(error: any): ErrorDisplayProps {
  const { category, userMessage, shouldRetry } = categorizeError(error);
  
  switch (category) {
    case 'network':
      return {
        title: 'Connection Problem',
        message: userMessage,
        actionLabel: 'Retry',
        variant: 'warning',
      };
      
    case 'authentication':
      return {
        title: 'Session Expired',
        message: userMessage,
        actionLabel: 'Log In',
        variant: 'error',
      };
      
    case 'validation':
      return {
        title: 'Invalid Input',
        message: userMessage,
        variant: 'warning',
      };
      
    case 'server':
      return {
        title: 'Server Error',
        message: userMessage,
        actionLabel: shouldRetry ? 'Try Again' : undefined,
        variant: 'error',
      };
      
    default:
      return {
        title: 'Error',
        message: userMessage,
        actionLabel: shouldRetry ? 'Try Again' : undefined,
        variant: 'error',
      };
  }
}

/**
 * Log errors with context for debugging
 */
export function logError(error: any, context?: string): void {
  const errorInfo = {
    message: extractErrorMessage(error),
    context,
    timestamp: new Date().toISOString(),
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown',
    url: typeof window !== 'undefined' ? window.location.href : 'unknown',
    stackTrace: error?.stack,
    graphQLErrors: error?.graphQLErrors,
    networkError: error?.networkError,
  };
  
  console.error('Application Error:', errorInfo);
  
  // In production, you could send this to an error tracking service
  if (process.env.NODE_ENV === 'production') {
    // Example: Sentry, LogRocket, etc.
    // errorTrackingService.captureError(errorInfo);
  }
}

/**
 * Hook for consistent error handling across components
 */
export function useErrorHandler() {
  return {
    handleError: (error: any, context?: string) => {
      logError(error, context);
      return createErrorDisplay(error);
    },
    extractMessage: extractErrorMessage,
    categorize: categorizeError,
  };
}