import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/contexts/auth-context';
import { EnvironmentProvider } from '@/contexts/environment-context';
import { ZoneProvider } from '@/contexts/zone-context';
import type { Metadata } from 'next';
import { ApolloWrapper } from '../lib/apollo-wrapper';
import './globals.css';

export const metadata: Metadata = {
  title: 'Muditor - MUD World Editor',
  description: 'A modern, database-driven MUD editor and administration tool',
};

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
                <ZoneProvider>{children}</ZoneProvider>
              </AuthProvider>
            </EnvironmentProvider>
          </ApolloWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}
