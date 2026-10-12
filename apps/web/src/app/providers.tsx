'use client';

import { ClientErrorHandlers } from '@/components/client-error-handlers';
import { EnhancedCommandPalette } from '@/components/EnhancedCommandPalette';
import { ErrorBoundary } from '@/components/error-boundary';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider, useAuth } from '@/contexts/auth-context';
import { ZoneProvider } from '@/contexts/zone-context';
import { useTheme } from 'next-themes';
import { Toaster } from 'sonner';
import { ApolloWrapper } from '../lib/apollo-wrapper';

function AuthedCommandPalette() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <EnhancedCommandPalette /> : null;
}

// Without a mounted Toaster every toast.error()/toast.success() in the app is
// a silent no-op, which hid save failures from builders.
function ThemedToaster() {
  const { resolvedTheme } = useTheme();
  return (
    <Toaster
      richColors
      closeButton
      theme={resolvedTheme === 'light' ? 'light' : 'dark'}
    />
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute='class'
      defaultTheme='dark'
      enableSystem
      disableTransitionOnChange
    >
      <ClientErrorHandlers />
      <ThemedToaster />
      <ErrorBoundary>
        <ApolloWrapper>
          <AuthProvider>
            <ZoneProvider>
              {children}
              <AuthedCommandPalette />
            </ZoneProvider>
          </AuthProvider>
        </ApolloWrapper>
      </ErrorBoundary>
    </ThemeProvider>
  );
}
