'use client';

import { ClientErrorHandlers } from '@/components/client-error-handlers';
import { EnhancedCommandPalette } from '@/components/EnhancedCommandPalette';
import { ErrorBoundary } from '@/components/error-boundary';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider, useAuth } from '@/contexts/auth-context';
import { EnvironmentProvider } from '@/contexts/environment-context';
import { ZoneProvider } from '@/contexts/zone-context';
import { ApolloWrapper } from '../lib/apollo-wrapper';

function AuthedCommandPalette() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <EnhancedCommandPalette /> : null;
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
      <ErrorBoundary>
        <ApolloWrapper>
          <EnvironmentProvider>
            <AuthProvider>
              <ZoneProvider>
                {children}
                <AuthedCommandPalette />
              </ZoneProvider>
            </AuthProvider>
          </EnvironmentProvider>
        </ApolloWrapper>
      </ErrorBoundary>
    </ThemeProvider>
  );
}
