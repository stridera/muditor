'use client';

import { ProtectedRoute } from '@/components/auth/protected-route';
import { ErrorBoundary } from '@/components/error-boundary';
import { Navigation } from './components/Navigation';
import { GoToHint, HelpModal, useHelpModal } from '@/components/HelpModal';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const {
    open: helpOpen,
    setOpen: setHelpOpen,
    showGoToHint,
  } = useHelpModal('global');

  return (
    <ProtectedRoute>
      <div className='min-h-screen bg-background text-foreground'>
        <Navigation />
        <main className='container mx-auto px-4 py-8'>
          <ErrorBoundary>{children}</ErrorBoundary>
        </main>
      </div>

      {/* Global help modal */}
      <HelpModal open={helpOpen} onOpenChange={setHelpOpen} context='global' />

      {/* Global go-to hint popup */}
      <GoToHint show={showGoToHint} />
    </ProtectedRoute>
  );
}
