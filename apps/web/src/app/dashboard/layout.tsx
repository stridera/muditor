'use client';

import { LoginApprovalNotification } from '@/components/auth/login-approval-notification';
import { ChatContainer } from '@/components/chat';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { ErrorBoundary } from '@/components/error-boundary';
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
    <ProtectedRoute>
      <div className='flex h-screen overflow-hidden bg-background text-foreground'>
        <Sidebar />
        <div className='flex-1 flex flex-col overflow-hidden'>
          <TopBar />
          <main className='flex-1 overflow-y-auto p-6'>
            <ErrorBoundary>{children}</ErrorBoundary>
          </main>
        </div>
      </div>

      {/* Game chat bubble */}
      <ChatContainer />

      {/* Login approval notification */}
      <LoginApprovalNotification />

      {/* Global help modal */}
      <HelpModal open={helpOpen} onOpenChange={setHelpOpen} context='global' />

      {/* Global go-to hint popup */}
      <GoToHint show={showGoToHint} />
    </ProtectedRoute>
  );
}
