'use client';

import { EnhancedCommandPalette } from '@/components/EnhancedCommandPalette';
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
    </ThemeProvider>
  );
}
