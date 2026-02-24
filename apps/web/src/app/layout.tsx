'use client';

import { ThemeProvider } from '@/components/theme-provider';
import { EnhancedCommandPalette } from '@/components/EnhancedCommandPalette';
import { AuthProvider } from '@/contexts/auth-context';
import { EnvironmentProvider } from '@/contexts/environment-context';
import { ZoneProvider } from '@/contexts/zone-context';
import { ApolloWrapper } from '../lib/apollo-wrapper';
import { Cinzel, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

const cinzel = Cinzel({
  subsets: ['latin'],
  variable: '--font-cinzel',
  display: 'swap',
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body
        className={`${cinzel.variable} ${jakarta.variable} bg-background text-foreground`}
        suppressHydrationWarning
      >
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
