/**
 * Error handling utilities for improved user experience
 */

export interface ApiError {
  message: string;
  code?: string;
  details?: unknown;
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
// Narrowable GraphQL/Apollo error shapes
interface GraphQLErrorLike {
  message: string;
}
interface ApolloErrorLike {
  graphQLErrors?: GraphQLErrorLike[];
  networkError?: { message?: string } & Record<string, unknown>;
  message?: string;
  stack?: string;
}

/** `roomDescription` / `room_description` -> `Room description`. */
function humanizeField(field: string): string {
  const words = field
    .replace(/_/g, ' ')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .toLowerCase()
    .trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

const SERVER_PHRASES: Array<[RegExp, (m: RegExpMatchArray) => string]> = [
  // Missing required field in a mutation payload
  [
    /Field "([^"]+)" of required type "[^"]*" was not provided/,
    m => `${humanizeField(m[1] ?? '')} is required.`,
  ],
  // Required variable (usually an id taken from the URL) is missing
  [
    /Variable "\$[^"]*" of (?:non-null|required) type "[^"]*" must not be null/,
    () =>
      'This page needs a valid id in its link. Check the address and try again.',
  ],
  [
    /Variable "\$[^"]*" of required type "[^"]*" was not provided/,
    () =>
      'This page needs a valid id in its link. Check the address and try again.',
  ],
  // Wrong type for a field of the payload
  [
    /Variable "\$[^"]*" got invalid value [\s\S]*? at "[^".]*\.([^"]+)"/,
    m => `${humanizeField(m[1] ?? '')} has an invalid value.`,
  ],
  [
    /Cannot return null for non-nullable field Query\.(\w+)/,
    m =>
      `That ${humanizeField(m[1] ?? 'item').toLowerCase()} could not be found.`,
  ],
  [
    /^Forbidden resource$/i,
    () =>
      "You don't have write access here. Ask an admin to grant you access to this zone.",
  ],
  [/^Unauthorized$/i, () => 'Your session has expired. Please log in again.'],
  // class-validator (Nest ValidationPipe)
  [
    /^(\w+) should not be empty$/,
    m => `${humanizeField(m[1] ?? '')} is required.`,
  ],
  [
    /^(\w+) must be a string$/,
    m => `${humanizeField(m[1] ?? '')} must be text.`,
  ],
  [
    /^property (\w+) should not exist$/,
    m => `The field "${m[1]}" is not accepted here.`,
  ],
];

/**
 * Rewrite raw GraphQL / Nest validation text into something a builder can act
 * on. Unknown messages pass through unchanged. Multi-line messages (several
 * errors joined by newlines) are rewritten line by line.
 */
export function friendlyGraphQLMessage(message: string): string {
  if (!message) return message;
  const lines = message.split('\n').map(line => {
    for (const [pattern, render] of SERVER_PHRASES) {
      const match = line.trim().match(pattern);
      if (match) return render(match);
    }
    return line;
  });
  return lines.join('\n');
}

export function extractErrorMessage(error: unknown): string {
  const e = error as ApolloErrorLike | undefined;
  // GraphQL errors
  if (e?.graphQLErrors && e.graphQLErrors.length > 0 && e.graphQLErrors[0]) {
    return friendlyGraphQLMessage(e.graphQLErrors[0].message);
  }

  // Network errors
  if (e?.networkError?.message) {
    return e.networkError.message as string;
  }

  // Standard error
  if (typeof e?.message === 'string') {
    return friendlyGraphQLMessage(e.message);
  }

  // Fallback
  return 'An unexpected error occurred. Please try again.';
}

/**
 * Categorize errors for better user messaging
 */
export function categorizeError(error: unknown): {
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
    (error as ApolloErrorLike | undefined)?.networkError
  ) {
    return {
      category: 'network',
      userMessage:
        'Connection problem. Please check your internet connection and try again.',
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
      userMessage:
        'Server error. Our team has been notified. Please try again later.',
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
export function createErrorDisplay(error: unknown): ErrorDisplayProps {
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
      return shouldRetry
        ? {
            title: 'Server Error',
            message: userMessage,
            actionLabel: 'Try Again',
            variant: 'error',
          }
        : {
            title: 'Server Error',
            message: userMessage,
            variant: 'error',
          };

    default:
      return shouldRetry
        ? {
            title: 'Error',
            message: userMessage,
            actionLabel: 'Try Again',
            variant: 'error',
          }
        : {
            title: 'Error',
            message: userMessage,
            variant: 'error',
          };
  }
}

/**
 * Log errors with context for debugging
 */
export function logError(error: unknown, context?: string): void {
  const e = error as ApolloErrorLike | undefined;
  const errorInfo = {
    message: extractErrorMessage(error),
    context,
    timestamp: new Date().toISOString(),
    userAgent:
      typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown',
    url: typeof window !== 'undefined' ? window.location.href : 'unknown',
    stackTrace: e?.stack,
    graphQLErrors: e?.graphQLErrors,
    networkError: e?.networkError,
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
    handleError: (error: unknown, context?: string) => {
      logError(error, context);
      return createErrorDisplay(error);
    },
    extractMessage: extractErrorMessage,
    categorize: categorizeError,
  };
}
