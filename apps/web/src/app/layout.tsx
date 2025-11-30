'use client';

import { ThemeProvider } from '@/components/theme-provider';
import { EnhancedCommandPalette } from '@/components/EnhancedCommandPalette';
import { AuthProvider } from '@/contexts/auth-context';
import { EnvironmentProvider } from '@/contexts/environment-context';
import { ZoneProvider } from '@/contexts/zone-context';
import { ApolloWrapper } from '../lib/apollo-wrapper';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body className='bg-background text-foreground'>
        <ThemeProvider
          attribute='class'
          defaultTheme='system'
          enableSystem
          disableTransitionOnChange
        >
          <ApolloWrapper>
            <EnvironmentProvider>
              <AuthProvider>
                <ZoneProvider>
                  {children}
                  <EnhancedCommandPalette />
                </ZoneProvider>
              </AuthProvider>
            </EnvironmentProvider>
          </ApolloWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}
