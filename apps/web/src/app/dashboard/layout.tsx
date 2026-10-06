'use client';

import { ChatContainer } from '@/components/chat';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { ErrorBoundary } from '@/components/error-boundary';
import { HelpPanelProvider, HelpPanelSlot } from '@/components/help';
import { Sidebar } from '@/components/navigation/sidebar';
import { TopBar } from '@/components/navigation/top-bar';
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
    <ErrorBoundary>
      <ProtectedRoute>
        <HelpPanelProvider>
          <div className='flex h-screen overflow-hidden bg-background text-foreground'>
            <Sidebar />
            <div className='flex-1 min-w-0 flex flex-col overflow-hidden'>
              <TopBar />
              {/* Main content and the docked help panel share this row, so
                  opening help shrinks the content instead of overlaying it. */}
              <div className='flex flex-1 min-h-0 overflow-hidden'>
                <main className='flex-1 min-w-0 overflow-y-auto p-6'>
                  <ErrorBoundary>{children}</ErrorBoundary>
                </main>
                <HelpPanelSlot />
              </div>
            </div>
          </div>
        </HelpPanelProvider>

        {/* Game chat bubble */}
        <ChatContainer />

        {/* Global help modal */}
        <HelpModal
          open={helpOpen}
          onOpenChange={setHelpOpen}
          context='global'
        />

        {/* Global go-to hint popup */}
        <GoToHint show={showGoToHint} />
      </ProtectedRoute>
    </ErrorBoundary>
  );
}
